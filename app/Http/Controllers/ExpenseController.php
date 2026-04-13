<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Expenses\UpsertExpense;
use App\DTO\Expenses\UpsertExpenseData;
use App\Enums\ExpenseCategory;
use App\Enums\ExpenseStatus;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Requests\Expenses\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Expenses\BuildExpenseDashboard;
use App\Support\Expenses\ExpenseAccess;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        private readonly ExpenseAccess $expenseAccess,
        private readonly BuildExpenseDashboard $buildExpenseDashboard,
        private readonly UpsertExpense $upsertExpense,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());
        $ownerMember = $this->resolveOwnerMember($workspace);
        $filters = $this->validatedFilters($request);

        $expenses = $this->expenseAccess
            ->visibleExpensesQuery($workspace, $viewer)
            ->when($filters['category'] !== null, fn ($query) => $query->where('category', $filters['category']))
            ->when($filters['status'] !== null, fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['from'] !== null, fn ($query) => $query->whereDate('expense_date', '>=', $filters['from']))
            ->when($filters['to'] !== null, fn ($query) => $query->whereDate('expense_date', '<=', $filters['to']))
            ->latest('expense_date')
            ->latest('id')
            ->get();

        return Inertia::render('expenses/index', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'workspaces' => $this->resolveFamilyWorkspaces($request),
            'summary' => $this->buildExpenseDashboard->handle($workspace, $viewer, $expenses, $ownerMember),
            'filters' => $filters,
            'categories' => ExpenseCategory::options(),
            'expenses' => $this->serializeExpenses($expenses, $viewer),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());

        return Inertia::render('expenses/form', [
            'mode' => 'create',
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'workspaces' => $this->resolveFamilyWorkspaces($request),
            'categories' => ExpenseCategory::options(),
            'form' => [
                'workspace_id' => $workspace->id,
                'child_id' => null,
                'shared_with_member_id' => $this->defaultSharedWithMemberId($workspace, $viewer),
                'currency' => 'USD',
                'amount' => '0.00',
                'category' => '',
                'expense_date' => now($workspace->timezone)->format('Y-m-d'),
                'description' => '',
                'other_party_share_percentage' => 50,
                'receipt_url' => null,
            ],
            'participants' => $this->participantOptions($workspace, $viewer),
            'children' => $this->childOptions($workspace),
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail((int) $request->validated('workspace_id'));
        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());
        $sharedWithMemberId = $this->resolveSharedWithMemberId($workspace, $viewer, $request->validated('shared_with_member_id'));
        $this->assertChildBelongsToWorkspace($workspace, $request->validated('child_id'));

        $this->upsertExpense->handle(
            UpsertExpenseData::fromValidated(
                $request->validated(),
                $workspace->id,
                $viewer->id,
                $sharedWithMemberId,
            )
        );

        return to_route('expenses.index', ['workspace' => $workspace->id])
            ->with('status', 'Expense added successfully!');
    }

    public function edit(Request $request, Expense $expense): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request, $expense->workspace_id);

        if ($workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->expenseAccess->canEdit($expense, $viewer)) {
            throw new AuthorizationException('This expense can no longer be edited.');
        }

        return Inertia::render('expenses/form', [
            'mode' => 'edit',
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'workspaces' => $this->resolveFamilyWorkspaces($request),
            'categories' => ExpenseCategory::options(),
            'form' => [
                'workspace_id' => $workspace->id,
                'child_id' => $expense->child_id,
                'shared_with_member_id' => $expense->shared_with_member_id,
                'currency' => $expense->currency,
                'amount' => number_format($expense->amount, 2, '.', ''),
                'category' => $expense->category,
                'expense_date' => $expense->expense_date?->format('Y-m-d'),
                'description' => $expense->description,
                'other_party_share_percentage' => $expense->other_party_share_percentage,
                'receipt_url' => $expense->receipt_path !== null ? Storage::disk('public')->url($expense->receipt_path) : null,
            ],
            'expense' => [
                'id' => $expense->id,
                'status' => $expense->status->value,
            ],
            'participants' => $this->participantOptions($workspace, $viewer),
            'children' => $this->childOptions($workspace),
        ]);
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail((int) $request->validated('workspace_id'));
        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->expenseAccess->canEdit($expense, $viewer)) {
            throw new AuthorizationException('This expense can no longer be edited.');
        }

        $sharedWithMemberId = $this->resolveSharedWithMemberId($workspace, $viewer, $request->validated('shared_with_member_id'));
        $this->assertChildBelongsToWorkspace($workspace, $request->validated('child_id'));

        $this->upsertExpense->handle(
            UpsertExpenseData::fromValidated(
                $request->validated(),
                $workspace->id,
                $expense->created_by_member_id,
                $sharedWithMemberId,
            ),
            $expense,
        );

        return to_route('expenses.index', ['workspace' => $workspace->id])
            ->with('status', 'Expense updated successfully!');
    }

    public function accept(Request $request, Expense $expense): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($expense->workspace_id);
        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->expenseAccess->canAccept($expense, $viewer)) {
            throw new AuthorizationException('Only the family owner can accept this expense.');
        }

        $expense->forceFill([
            'status' => ExpenseStatus::Accepted,
            'accepted_by_member_id' => $viewer->id,
            'accepted_at' => now(),
        ])->save();

        return back()->with('status', 'Expense marked as settled.');
    }

    public function reopen(Request $request, Expense $expense): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($expense->workspace_id);
        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->expenseAccess->canReopen($expense, $viewer)) {
            throw new AuthorizationException('Only the family owner can undo this expense.');
        }

        $expense->forceFill([
            'status' => ExpenseStatus::Pending,
            'accepted_by_member_id' => null,
            'accepted_at' => null,
        ])->save();

        return back()->with('status', 'Expense moved back to pending.');
    }

    public function destroy(Request $request, Expense $expense): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($expense->workspace_id);
        $viewer = $this->expenseAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->expenseAccess->canDelete($expense, $viewer)) {
            throw new AuthorizationException('You cannot delete this expense.');
        }

        if ($expense->receipt_path !== null) {
            Storage::disk('public')->delete($expense->receipt_path);
        }

        $expense->delete();

        return back()->with('status', 'Expense deleted successfully.');
    }

    private function resolveWorkspace(Request $request, ?int $fallbackWorkspaceId = null): ?Workspace
    {
        $workspaceId = $request->integer('workspace', $fallbackWorkspaceId ?? 0);

        return $request->user()->workspaces()
            ->where('type', 'family')
            ->when($workspaceId > 0, fn ($query) => $query->where('workspaces.id', $workspaceId))
            ->with([
                'children:id,workspace_id,name,color,birthdate',
                'members.user:id,name,email',
                'owner:id,name,email',
            ])
            ->withCount(['children', 'members', 'calendarEvents'])
            ->orderBy('name')
            ->first();
    }

    private function resolveOwnerMember(Workspace $workspace): WorkspaceMember
    {
        return $workspace->members->firstWhere('role', 'owner')
            ?? throw new AuthorizationException('Owner membership is missing.');
    }

    private function defaultSharedWithMemberId(Workspace $workspace, WorkspaceMember $viewer): ?int
    {
        if ($this->expenseAccess->isOwner($viewer)) {
            return $workspace->members->first(fn (WorkspaceMember $member): bool => $member->role !== 'owner')?->id;
        }

        return $this->resolveOwnerMember($workspace)->id;
    }

    /**
     * @return list<array{value:int,label:string}>
     */
    private function participantOptions(Workspace $workspace, WorkspaceMember $viewer): array
    {
        if ($this->expenseAccess->isOwner($viewer)) {
            return $workspace->members
                ->filter(fn (WorkspaceMember $member): bool => $member->role !== 'owner' && $member->user !== null)
                ->map(fn (WorkspaceMember $member): array => [
                    'value' => $member->id,
                    'label' => $member->user?->name ?? 'Unknown member',
                ])
                ->values()
                ->all();
        }

        $ownerMember = $this->resolveOwnerMember($workspace);

        return [[
            'value' => $ownerMember->id,
            'label' => $ownerMember->user?->name ?? 'Family owner',
        ]];
    }

    /**
     * @return list<array{value:int,label:string}>
     */
    private function childOptions(Workspace $workspace): array
    {
        return $workspace->children
            ->map(fn ($child): array => [
                'value' => $child->id,
                'label' => $child->name,
            ])
            ->values()
            ->all();
    }

    private function resolveSharedWithMemberId(Workspace $workspace, WorkspaceMember $viewer, mixed $requestedMemberId): int
    {
        if (! $this->expenseAccess->isOwner($viewer)) {
            return $this->resolveOwnerMember($workspace)->id;
        }

        $memberId = (int) $requestedMemberId;
        $sharedWith = $workspace->members->firstWhere('id', $memberId);

        if ($sharedWith === null || $sharedWith->role === 'owner') {
            throw new AuthorizationException('Choose a valid family member to share this expense with.');
        }

        return $sharedWith->id;
    }

    private function assertChildBelongsToWorkspace(Workspace $workspace, mixed $childId): void
    {
        if ($childId === null || $childId === '') {
            return;
        }

        $exists = $workspace->children->contains(fn ($child): bool => $child->id === (int) $childId);

        if (! $exists) {
            throw new AuthorizationException('Choose a valid child from this family workspace.');
        }
    }

    /**
     * @param Collection<int, Expense> $expenses
     * @return list<array<string,mixed>>
     */
    private function serializeExpenses(Collection $expenses, WorkspaceMember $viewer): array
    {
        return $expenses->map(function (Expense $expense) use ($viewer): array {
            return [
                'id' => $expense->id,
                'date' => $expense->expense_date?->format('M j, Y'),
                'description' => $expense->description ?: 'No description',
                'category' => ExpenseCategory::from($expense->category)->label(),
                'child' => $expense->child?->name,
                'amount' => number_format($expense->amount, 2, '.', ''),
                'currency' => $expense->currency,
                'split' => $expense->other_party_share_percentage,
                'added_by' => $expense->createdByMember->user?->name ?? 'Unknown',
                'status' => $expense->status->label(),
                'status_value' => $expense->status->value,
                'can_accept' => $this->expenseAccess->canAccept($expense, $viewer),
                'can_reopen' => $this->expenseAccess->canReopen($expense, $viewer),
                'can_edit' => $this->expenseAccess->canEdit($expense, $viewer),
                'can_delete' => $this->expenseAccess->canDelete($expense, $viewer),
                'edit_url' => route('expenses.edit', ['expense' => $expense->id, 'workspace' => $expense->workspace_id]),
            ];
        })->values()->all();
    }

    /**
     * @return array{category:?string,status:?string,from:?string,to:?string}
     */
    private function validatedFilters(Request $request): array
    {
        $validated = $request->validate([
            'category' => ['nullable', Rule::in(array_map(static fn (ExpenseCategory $category): string => $category->value, ExpenseCategory::cases()))],
            'status' => ['nullable', Rule::in(array_map(static fn (ExpenseStatus $status): string => $status->value, ExpenseStatus::cases()))],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        return [
            'category' => $validated['category'] ?? null,
            'status' => $validated['status'] ?? null,
            'from' => $validated['from'] ?? null,
            'to' => $validated['to'] ?? null,
        ];
    }

    private function serializeWorkspace(Workspace $workspace, WorkspaceMember $viewer): array
    {
        return [
            'id' => $workspace->id,
            'name' => $workspace->name,
            'timezone' => $workspace->timezone,
            'children_count' => $workspace->children_count,
            'members_count' => $workspace->members_count,
            'events_count' => $workspace->calendar_events_count,
            'members' => $workspace->members
                ->map(fn (WorkspaceMember $member): array => [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user?->name,
                    'email' => $member->user?->email,
                    'role' => $member->role,
                    'joined_at' => ($member->joined_at ?? $member->created_at)?->toIso8601String(),
                ])
                ->values(),
            'children' => $workspace->children
                ->map(fn ($child): array => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'color' => $child->color,
                    'birthdate' => $child->birthdate?->toDateString(),
                ])
                ->values(),
            'viewer' => [
                'member_id' => $viewer->id,
                'role' => $viewer->role,
            ],
        ];
    }

    private function resolveFamilyWorkspaces(Request $request): Collection
    {
        return $request->user()->workspaces()
            ->where('type', 'family')
            ->withCount(['children', 'members', 'calendarEvents'])
            ->orderBy('name')
            ->get(['workspaces.id', 'name', 'type', 'timezone']);
    }
}
