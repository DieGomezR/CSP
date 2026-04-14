<?php

declare(strict_types=1);

namespace App\Support\Notifications;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Notifications\AppWorkspaceNotification;
use Illuminate\Support\Collection;

final class WorkspaceNotificationDispatcher
{
    /**
     * @param Collection<int, User> $recipients
     */
    public function dispatch(Collection $recipients, string $kind, string $title, string $body, ?string $href = null, ?Workspace $workspace = null): void
    {
        $recipients
            ->unique('id')
            ->each(function (User $user) use ($kind, $title, $body, $href, $workspace): void {
                $user->notify(new AppWorkspaceNotification([
                    'kind' => $kind,
                    'title' => $title,
                    'body' => $body,
                    'href' => $href,
                    'workspace_id' => $workspace?->id,
                ]));
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
