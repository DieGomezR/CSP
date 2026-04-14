<?php

declare(strict_types=1);

namespace App\Jobs;

use App\DTO\Mediation\ClaudeReply;
use App\Enums\MediationMessageRole;
use App\Models\MediationMessage;
use App\Models\MediationSession;
use App\Support\Mediation\AnthropicMediationClient;
use App\Support\Mediation\MediationCommunicationAnalyzer;
use App\Support\Mediation\MediationUsageGuard;
use App\Support\Realtime\WorkspaceRealtimeDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

final class GenerateMediationAssistantReply implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public int $sessionId,
        public int $requestMessageId,
        public bool $alternateReply = false,
    ) {
    }

    public function handle(
        AnthropicMediationClient $anthropicMediationClient,
        MediationCommunicationAnalyzer $analyzer,
        MediationUsageGuard $usageGuard,
        WorkspaceRealtimeDispatcher $workspaceRealtimeDispatcher,
    ): void {
        $session = MediationSession::query()
            ->with(['messages.workspaceMember.user:id,name,email'])
            ->find($this->sessionId);

        $requestMessage = MediationMessage::query()->find($this->requestMessageId);

        if (! $session instanceof MediationSession || ! $requestMessage instanceof MediationMessage) {
            return;
        }

        $existingReply = MediationMessage::query()
            ->where('response_to_message_id', $requestMessage->id)
            ->first();

        if ($existingReply instanceof MediationMessage) {
            return;
        }

        $warningsSummary = $analyzer->summarizeWarnings($session->messages);
        $reply = $anthropicMediationClient->reply($session, $session->messages, $warningsSummary, $this->alternateReply);

        $usageGuard->recordUsage(
            $session,
            (int) data_get($reply->metadata, 'usage.input_tokens', 0) + (int) data_get($reply->metadata, 'usage.output_tokens', 0),
        );

        DB::transaction(function () use ($session, $requestMessage, $reply): void {
            MediationMessage::query()->create([
                'mediation_session_id' => $session->id,
                'role' => MediationMessageRole::Assistant,
                'kind' => 'ai_reply',
                'body' => $reply->text,
                'response_to_message_id' => $requestMessage->id,
                'metadata' => $reply->metadata,
            ]);

            $session->forceFill([
                'last_message_at' => now(),
            ])->save();
        });

        $session->refresh();

        $workspaceRealtimeDispatcher->dispatch(
            $workspaceRealtimeDispatcher->workspaceUsers($session->workspace),
            'mediation',
            'assistant_reply_ready',
            $session->workspace_id,
            null,
            ['mediation_session_id' => $session->id],
        );
    }
}
