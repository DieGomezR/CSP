<?php

declare(strict_types=1);

namespace Tests\Feature\Expenses;

use App\Enums\ExpenseStatus;
use App\Models\Expense;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExpenseModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_sees_all_expenses_but_member_only_sees_owner_shared_expenses(): void
    {
        [$workspace, $ownerMember] = $this->makeWorkspace();
        [$memberOne, $memberOneMembership] = $this->attachMember($workspace, 'Member One');
        [$memberTwo] = $this->attachMember($workspace, 'Member Two');
        $memberTwoMembership = $workspace->members()->where('user_id', $memberTwo->id)->firstOrFail();
        $this->createSubscription($ownerMember->user, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        Expense::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $ownerMember->id,
            'shared_with_member_id' => $memberOneMembership->id,
            'currency' => 'USD',
            'amount_cents' => 5000,
            'category' => 'medical',
            'expense_date' => now()->toDateString(),
            'description' => 'Visible to member one',
            'other_party_share_percentage' => 50,
            'status' => ExpenseStatus::Pending,
        ]);

        Expense::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $ownerMember->id,
            'shared_with_member_id' => $memberTwoMembership->id,
            'currency' => 'USD',
            'amount_cents' => 9000,
            'category' => 'school',
            'expense_date' => now()->toDateString(),
            'description' => 'Hidden from member one',
            'other_party_share_percentage' => 50,
            'status' => ExpenseStatus::Pending,
        ]);

        $this->actingAs($ownerMember->user)->get(route('expenses.index', ['workspace' => $workspace->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('expenses/index')
                ->has('expenses', 2)
                ->where('expenses.0.description', 'Hidden from member one')
                ->where('expenses.1.description', 'Visible to member one'));

        $this->actingAs($memberOne)->get(route('expenses.index', ['workspace' => $workspace->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('expenses/index')
                ->has('expenses', 1)
                ->where('expenses.0.description', 'Visible to member one'));
    }

    public function test_accepted_expense_cannot_be_edited(): void
    {
        [$workspace, $ownerMember] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Member One');
        $memberMembership = $workspace->members()->where('user_id', $member->id)->firstOrFail();
        $this->createSubscription($ownerMember->user, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        $expense = Expense::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $memberMembership->id,
            'shared_with_member_id' => $ownerMember->id,
            'accepted_by_member_id' => $ownerMember->id,
            'currency' => 'USD',
            'amount_cents' => 5000,
            'category' => 'medical',
            'expense_date' => now()->toDateString(),
            'description' => 'Accepted expense',
            'other_party_share_percentage' => 45,
            'status' => ExpenseStatus::Accepted,
            'accepted_at' => now(),
        ]);

        $this->actingAs($ownerMember->user)->get(route('expenses.edit', ['expense' => $expense->id, 'workspace' => $workspace->id]))
            ->assertForbidden();
    }

    public function test_owner_can_accept_and_reopen_expense_but_member_cannot_accept(): void
    {
        [$workspace, $ownerMember] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Member One');
        $memberMembership = $workspace->members()->where('user_id', $member->id)->firstOrFail();
        $this->createSubscription($ownerMember->user, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        $expense = Expense::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $memberMembership->id,
            'shared_with_member_id' => $ownerMember->id,
            'currency' => 'USD',
            'amount_cents' => 5000,
            'category' => 'medical',
            'expense_date' => now()->toDateString(),
            'description' => 'Pending expense',
            'other_party_share_percentage' => 45,
            'status' => ExpenseStatus::Pending,
        ]);

        $this->actingAs($member)->post(route('expenses.accept', $expense->id))
            ->assertForbidden();

        $this->actingAs($ownerMember->user)->post(route('expenses.accept', $expense->id))
            ->assertRedirect();

        $expense->refresh();
        $this->assertSame('accepted', $expense->status->value);

        $this->actingAs($ownerMember->user)->post(route('expenses.reopen', $expense->id))
            ->assertRedirect();

        $expense->refresh();
        $this->assertSame('pending', $expense->status->value);
    }

    public function test_coparent_cannot_accept_or_reopen_expenses(): void
    {
        [$workspace, $ownerMember] = $this->makeWorkspace();
        $this->createSubscription($ownerMember->user, 'price_1TKeobGVa0O4LKuhllpTSD4i');
        $coparent = User::factory()->create([
            'name' => 'Co-Parent',
            'email_verified_at' => now(),
        ]);

        $coparentMembership = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $coparent->id,
            'role' => 'coparent',
        ]);

        $pendingExpense = Expense::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $coparentMembership->id,
            'shared_with_member_id' => $ownerMember->id,
            'currency' => 'USD',
            'amount_cents' => 5000,
            'category' => 'medical',
            'expense_date' => now()->toDateString(),
            'description' => 'Pending expense',
            'other_party_share_percentage' => 45,
            'status' => ExpenseStatus::Pending,
        ]);

        $acceptedExpense = Expense::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $coparentMembership->id,
            'shared_with_member_id' => $ownerMember->id,
            'accepted_by_member_id' => $ownerMember->id,
            'currency' => 'USD',
            'amount_cents' => 7000,
            'category' => 'school',
            'expense_date' => now()->toDateString(),
            'description' => 'Accepted expense',
            'other_party_share_percentage' => 50,
            'status' => ExpenseStatus::Accepted,
            'accepted_at' => now(),
        ]);

        $this->actingAs($coparent)->post(route('expenses.accept', $pendingExpense->id))
            ->assertForbidden();

        $this->actingAs($coparent)->post(route('expenses.reopen', $acceptedExpense->id))
            ->assertForbidden();
    }

    /**
     * @return array{0: Workspace, 1: WorkspaceMember}
     */
    private function makeWorkspace(): array
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $ownerMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();
        return [$workspace, $ownerMember];
    }

    /**
     * @return array{0: User, 1: WorkspaceMember}
     */
    private function attachMember(Workspace $workspace, string $name): array
    {
        $user = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
        ]);

        $membership = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        return [$user, $membership];
    }

    private function createSubscription(User $user, string $priceId): void
    {
        $user->forceFill([
            'stripe_id' => 'cus_test_'.$user->id,
        ])->save();

        DB::table('subscriptions')->insert([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_id' => 'sub_test_'.$user->id.'_'.md5($priceId),
            'stripe_status' => 'trialing',
            'stripe_price' => $priceId,
            'quantity' => 1,
            'trial_ends_at' => now()->addDays(30),
            'ends_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
