<?php

declare(strict_types=1);

namespace App\Support\Expenses;

use App\Models\Expense;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Collection;

final class BuildExpenseDashboard
{
    public function __construct(
        private readonly ExpenseAccess $expenseAccess,
    ) {
    }

    /**
     * @param Collection<int, Expense> $expenses
     * @return array{members: list<array<string,mixed>>, total_unsettled: string}
     */
    public function handle(Workspace $workspace, WorkspaceMember $viewer, Collection $expenses, WorkspaceMember $ownerMember): array
    {
        $members = $this->buildVisibleMembers($workspace, $viewer, $ownerMember);

        $summaries = $members->map(function (WorkspaceMember $member) use ($expenses): array {
            $memberExpenses = $expenses->filter(
                fn (Expense $expense): bool => $expense->created_by_member_id === $member->id
                    || $expense->shared_with_member_id === $member->id
            );

            $paid = $memberExpenses
                ->filter(fn (Expense $expense): bool => $expense->created_by_member_id === $member->id)
                ->sum('amount');

            $owes = $memberExpenses->sum(function (Expense $expense) use ($member): float {
                $otherShare = round($expense->amount * ($expense->other_party_share_percentage / 100), 2);
                $payerShare = round($expense->amount - $otherShare, 2);

                return $expense->created_by_member_id === $member->id ? $payerShare : $otherShare;
            });

            $net = round($paid - $owes, 2);

            return [
                'member_id' => $member->id,
                'name' => $member->user?->name ?? 'Unknown member',
                'role' => $member->role,
                'paid' => $this->money($paid),
                'owes' => $this->money($owes),
                'net' => $this->money(abs($net)),
                'net_direction' => $net > 0 ? 'is_owed' : ($net < 0 ? 'owes' : 'settled'),
                'status_label' => $net > 0 ? 'Is owed' : ($net < 0 ? 'Owes' : 'Settled up'),
            ];
        })->values()->all();

        return [
            'members' => $summaries,
            'total_unsettled' => $this->money((float) $expenses->sum('amount')),
        ];
    }

    /**
     * @return Collection<int, WorkspaceMember>
     */
    private function buildVisibleMembers(Workspace $workspace, WorkspaceMember $viewer, WorkspaceMember $ownerMember): Collection
    {
        if ($this->expenseAccess->isOwner($viewer)) {
            return $workspace->members
                ->filter(fn (WorkspaceMember $member): bool => $member->user !== null)
                ->sortBy(fn (WorkspaceMember $member): int => $member->id === $ownerMember->id ? 0 : 1)
                ->values();
        }

        return collect([$viewer, $ownerMember])->unique('id')->values();
    }

    private function money(float $amount): string
    {
        return number_format($amount, 2, '.', '');
    }
}
