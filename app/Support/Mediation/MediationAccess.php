<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use App\Enums\MediationSessionStatus;
use App\Models\MediationSession;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class MediationAccess
{
    public function resolveWorkspaceMember(Workspace $workspace, User $user): WorkspaceMember
    {
        $member = $workspace->members()->with('user:id,name,email')->where('user_id', $user->id)->first();

        if (! $member instanceof WorkspaceMember) {
            throw new AuthorizationException('You are not part of this workspace.');
        }

        return $member;
    }

    public function activeSessionForWorkspace(Workspace $workspace): ?MediationSession
    {
        return $workspace->mediationSessions()
            ->with(['createdByMember.user:id,name,email', 'messages'])
            ->where('status', MediationSessionStatus::Active->value)
            ->latest('id')
            ->first();
    }

    /**
     * @return HasMany<MediationSession, Workspace>
     */
    public function visibleSessionsQuery(Workspace $workspace): HasMany
    {
        return $workspace->mediationSessions()
            ->with(['createdByMember.user:id,name,email', 'messages.workspaceMember.user:id,name,email'])
            ->latest('id');
    }

    public function ensureBelongsToWorkspace(MediationSession $session, WorkspaceMember $member): void
    {
        if ($session->workspace_id !== $member->workspace_id) {
            throw new AuthorizationException('You cannot access this mediation session.');
        }
    }
}
