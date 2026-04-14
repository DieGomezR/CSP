<?php

declare(strict_types=1);

namespace App\Actions\Messages;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessageThread;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CreateWorkspaceMessageThread
{
    public function handle(Workspace $workspace, WorkspaceMember $creator, string $subject): WorkspaceMessageThread
    {
        $subject = trim($subject);

        if ($subject === '') {
            throw ValidationException::withMessages([
                'subject' => 'Please enter a subject before opening a conversation.',
            ]);
        }

        /** @var WorkspaceMessageThread $thread */
        $thread = DB::transaction(function () use ($workspace, $creator, $subject): WorkspaceMessageThread {
            $thread = WorkspaceMessageThread::query()->create([
                'workspace_id' => $workspace->id,
                'created_by_member_id' => $creator->id,
                'subject' => $subject,
                'last_message_at' => now(),
            ]);

            $memberIds = $workspace->members()->pluck('id');

            foreach ($memberIds as $memberId) {
                DB::table('workspace_message_thread_members')->insert([
                    'workspace_message_thread_id' => $thread->id,
                    'workspace_member_id' => $memberId,
                    'last_read_at' => $memberId === $creator->id ? now() : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return $thread;
        });

        $thread->loadMissing('createdByMember.user:id,name,email');

        return $thread;
    }
}
