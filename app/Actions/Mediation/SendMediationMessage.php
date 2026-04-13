<?php

declare(strict_types=1);

namespace App\Actions\Mediation;

use App\Enums\MediationMessageRole;
use App\Enums\MediationSessionStatus;
use App\Models\MediationMessage;
use App\Models\MediationSession;
use App\Models\WorkspaceMember;
use App\Jobs\GenerateMediationAssistantReply;
use App\Support\Mediation\AnthropicMediationClient;
use App\Support\Mediation\MediationCommunicationAnalyzer;
use App\Support\Mediation\MediationUsageGuard;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class SendMediationMessage
{
    public function __construct(
        private readonly AnthropicMediationClient $anthropicMediationClient,
        private readonly MediationCommunicationAnalyzer $analyzer,
        private readonly MediationUsageGuard $usageGuard,
    ) {
    }

    public function handle(MediationSession $session, WorkspaceMember $member, string $body, string $clientRequestId, bool $alternateReply = false): void
    {
        if ($session->status !== MediationSessionStatus::Active) {
            throw ValidationException::withMessages([
                'message' => 'This mediation session is already closed.',
            ]);
        }

        $body = trim($body);

        if (! $alternateReply && $body === '') {
            throw ValidationException::withMessages([
                'message' => 'Please enter a message before sending.',
            ]);
        }

        $existing = MediationMessage::query()
            ->where('mediation_session_id', $session->id)
            ->where('client_request_id', $clientRequestId)
            ->first();

        if ($existing instanceof MediationMessage) {
            return;
        }

        $this->usageGuard->ensureCanSend($session, $member, $alternateReply);

        $userMessage = DB::transaction(function () use ($session, $member, $body, $clientRequestId, $alternateReply): MediationMessage {
            return MediationMessage::query()->create([
                'mediation_session_id' => $session->id,
                'workspace_member_id' => $alternateReply ? null : $member->id,
                'role' => $alternateReply ? MediationMessageRole::System : MediationMessageRole::User,
                'kind' => $alternateReply ? 'ai_help_request' : 'message',
                'body' => $alternateReply ? 'Alternate AI mediation guidance requested.' : $body,
                'client_request_id' => $clientRequestId,
                'metadata' => $alternateReply ? ['alternate_reply' => true] : [
                    'analysis' => $this->analyzer->analyze($body),
                ],
            ]);
        });

        if ((bool) config('mediation.ai.queue_replies', false)) {
            GenerateMediationAssistantReply::dispatch($session->id, $userMessage->id, $alternateReply);

            return;
        }

        $session->refresh()->loadMissing('messages.workspaceMember.user:id,name,email');
        $warningsSummary = $this->analyzer->summarizeWarnings($session->messages);
        $reply = $this->anthropicMediationClient->reply($session, $session->messages, $warningsSummary, $alternateReply);

        $this->usageGuard->recordUsage(
            $session,
            (int) data_get($reply->metadata, 'usage.input_tokens', 0) + (int) data_get($reply->metadata, 'usage.output_tokens', 0),
        );

        DB::transaction(function () use ($session, $userMessage, $reply): void {
            MediationMessage::query()->create([
                'mediation_session_id' => $session->id,
                'role' => MediationMessageRole::Assistant,
                'kind' => 'ai_reply',
                'body' => $reply->text,
                'response_to_message_id' => $userMessage->id,
                'metadata' => $reply->metadata,
            ]);

            $session->forceFill([
                'last_message_at' => now(),
            ])->save();
        });
    }
}
