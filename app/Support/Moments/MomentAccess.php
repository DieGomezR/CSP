<?php

declare(strict_types=1);

namespace App\Support\Moments;

use App\Enums\MomentVisibility;
use App\Models\Moment;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class MomentAccess
{
    public function resolveWorkspaceMember(Workspace $workspace, User $user): WorkspaceMember
    {
        /** @var WorkspaceMember|null $member */
        $member = $workspace->members()
            ->with('user:id,name,email')
            ->where('user_id', $user->id)
            ->first();

        if ($member === null) {
            throw new AuthorizationException('You are not part of this family workspace.');
        }

        return $member;
    }

    /**
     * @return HasMany<Moment, Workspace>
     */
    public function visibleMomentsQuery(Workspace $workspace, WorkspaceMember $viewer): HasMany
    {
        return $workspace->moments()
            ->with([
                'createdByMember.user:id,name,email',
                'reactions.workspaceMember.user:id,name,email',
            ])
            ->where(
                fn (Builder $query): Builder => $query
                    ->where('visibility', MomentVisibility::Family->value)
                    ->orWhere('created_by_member_id', $viewer->id)
            );
    }

    public function canView(Moment $moment, WorkspaceMember $viewer): bool
    {
        return $moment->visibility === MomentVisibility::Family
            || $moment->created_by_member_id === $viewer->id;
    }

    public function canDelete(Moment $moment, WorkspaceMember $viewer): bool
    {
        return $moment->created_by_member_id === $viewer->id;
    }

    public function canReact(Moment $moment, WorkspaceMember $viewer): bool
    {
        return $this->canView($moment, $viewer);
    }
}
