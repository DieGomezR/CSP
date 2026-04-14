<?php

declare(strict_types=1);

namespace App\Actions\Messages;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessage;
use App\Models\WorkspaceMessageThread;
use Illuminate\Support\Facades\DB;

final class SendWorkspaceMessage
{
    public function handle(
        Workspace $workspace,
        WorkspaceMessageThread $thread,
        WorkspaceMember $sender,
        string $body,
        ?string $clientRequestId = null,
    ): WorkspaceMessage {
        $normalizedBody = trim($body);

        /** @var WorkspaceMessage $message */
        $message = DB::transaction(function () use ($workspace, $thread, $sender, $normalizedBody, $clientRequestId): WorkspaceMessage {
            if ($clientRequestId !== null && $clientRequestId !== '') {
                $existing = WorkspaceMessage::query()
                    ->where('workspace_member_id', $sender->id)
                    ->where('client_request_id', $clientRequestId)
                    ->first();

                if ($existing instanceof WorkspaceMessage) {
                    return $existing;
                }
            }

            return WorkspaceMessage::query()->create([
                'workspace_id' => $workspace->id,
                'workspace_message_thread_id' => $thread->id,
                'workspace_member_id' => $sender->id,
                'client_request_id' => $clientRequestId,
                'body' => $normalizedBody,
            ]);
        });

        $thread->forceFill(['last_message_at' => now()])->save();

        DB::table('workspace_message_thread_members')
            ->where('workspace_message_thread_id', $thread->id)
            ->where('workspace_member_id', $sender->id)
            ->update([
                'last_read_at' => now(),
                'updated_at' => now(),
            ]);

        $message->loadMissing(['workspaceMember.user:id,name,email', 'thread']);

        return $message;
    }
}
