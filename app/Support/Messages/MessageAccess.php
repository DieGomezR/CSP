<?php

declare(strict_types=1);

namespace App\Support\Messages;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessage;
use App\Models\WorkspaceMessageThread;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class MessageAccess
{
    public function resolveWorkspaceMember(Workspace $workspace, User $user): WorkspaceMember
    {
        return $workspace->members()
            ->with('user:id,name,email')
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    /**
     * @return HasMany<WorkspaceMessage, Workspace>
     */
    public function visibleMessagesQuery(Workspace $workspace): HasMany
    {
        return $workspace->messages()
            ->with(['workspaceMember.user:id,name,email', 'thread'])
            ->oldest('created_at');
    }

    /**
     * @return Collection<int, WorkspaceMessageThread>
     */
    public function visibleThreads(Workspace $workspace): Collection
    {
        return $workspace->messageThreads()
            ->with([
                'createdByMember.user:id,name,email',
                'members.user:id,name,email',
            ])
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();
    }

    public function ensureThreadBelongsToWorkspace(WorkspaceMessageThread $thread, Workspace $workspace): void
    {
        abort_unless($thread->workspace_id === $workspace->id, 404);
    }

    public function markThreadAsRead(WorkspaceMessageThread $thread, WorkspaceMember $viewer): void
    {
        DB::table('workspace_message_thread_members')
            ->where('workspace_message_thread_id', $thread->id)
            ->where('workspace_member_id', $viewer->id)
            ->update([
                'last_read_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function unreadCountForThread(WorkspaceMessageThread $thread, WorkspaceMember $viewer): int
    {
        $lastReadAt = DB::table('workspace_message_thread_members')
            ->where('workspace_message_thread_id', $thread->id)
            ->where('workspace_member_id', $viewer->id)
            ->value('last_read_at');

        $readAt = $lastReadAt instanceof Carbon ? $lastReadAt : ($lastReadAt !== null ? Carbon::parse((string) $lastReadAt) : null);

        return $thread->messages()
            ->where('workspace_member_id', '!=', $viewer->id)
            ->when($readAt !== null, fn ($query) => $query->where('created_at', '>', $readAt))
            ->count();
    }
}
