<?php

declare(strict_types=1);

namespace App\Support\Expenses;

use App\Models\Expense;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ExpenseAccess
{
    public function resolveWorkspaceMember(Workspace $workspace, User $user): WorkspaceMember
    {
        $member = $workspace->members()
            ->with('user:id,name,email')
            ->where('user_id', $user->id)
            ->first();

        if ($member === null) {
            throw new AuthorizationException('You are not part of this family workspace.');
        }

        return $member;
    }

    public function isOwner(WorkspaceMember $member): bool
    {
        return $member->role === 'owner';
    }

    public function visibleExpensesQuery(Workspace $workspace, WorkspaceMember $viewer): HasMany
    {
        return $workspace->expenses()
            ->with([
                'child:id,name,color',
                'createdByMember.user:id,name,email',
                'sharedWithMember.user:id,name,email',
                'acceptedByMember.user:id,name,email',
            ])
            ->when(
                ! $this->isOwner($viewer),
                fn (Builder $query): Builder => $query->where(
                    fn (Builder $nested): Builder => $nested
                        ->where('created_by_member_id', $viewer->id)
                        ->orWhere('shared_with_member_id', $viewer->id)
                )
            );
    }

    public function canEdit(Expense $expense, WorkspaceMember $viewer): bool
    {
        return $expense->status->value === 'pending'
            && ($this->isOwner($viewer) || $expense->created_by_member_id === $viewer->id);
    }

    public function canDelete(Expense $expense, WorkspaceMember $viewer): bool
    {
        return $this->isOwner($viewer) || $expense->created_by_member_id === $viewer->id;
    }

    public function canAccept(Expense $expense, WorkspaceMember $viewer): bool
    {
        return $this->isOwner($viewer) && $expense->status->value === 'pending';
    }

    public function canReopen(Expense $expense, WorkspaceMember $viewer): bool
    {
        return $this->isOwner($viewer) && $expense->status->value === 'accepted';
    }
}
