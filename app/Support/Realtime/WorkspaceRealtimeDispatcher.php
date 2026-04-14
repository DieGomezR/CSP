<?php

declare(strict_types=1);

namespace App\Support\Realtime;

use App\Events\Realtime\UserRealtimeSyncRequested;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Collection;

final class WorkspaceRealtimeDispatcher
{
    /**
     * @param Collection<int, User> $recipients
     * @param array<string, int|string|null> $context
     */
    public function dispatch(
        Collection $recipients,
        string $domain,
        string $action,
        int $workspaceId,
        ?int $actorUserId = null,
        array $context = [],
    ): void {
        $recipients
            ->unique('id')
            ->each(function (User $user) use ($domain, $action, $workspaceId, $actorUserId, $context): void {
                event(new UserRealtimeSyncRequested(
                    targetUserId: $user->id,
                    domain: $domain,
                    action: $action,
                    workspaceId: $workspaceId,
                    actorUserId: $actorUserId,
                    context: $context,
                ));
            });
    }

    /**
     * @return Collection<int, User>
     */
    public function otherWorkspaceUsers(Workspace $workspace, WorkspaceMember $actor): Collection
    {
        return $workspace->members()
            ->with('user:id,name,email')
            ->where('id', '!=', $actor->id)
            ->get()
            ->pluck('user')
            ->filter()
            ->values();
    }

    /**
     * @return Collection<int, User>
     */
    public function workspaceUsers(Workspace $workspace): Collection
    {
        return $workspace->members()
            ->with('user:id,name,email')
            ->get()
            ->pluck('user')
            ->filter()
            ->values();
    }
}
