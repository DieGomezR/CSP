<?php

declare(strict_types=1);

namespace Tests\Feature\Access;

use Database\Seeders\RolesAndPermissionsSeeder;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

final class WorkspaceEntitlementAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_owner_can_access_plus_feature_in_parent_mode_but_member_cannot(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');

        $this->createSubscription($owner, 'price_1TKeneGVa0O4LKuhqZWStD8q', 'trialing');

        $this->actingAs($owner)->get(route('expenses.index', ['workspace' => $workspace->id]))
            ->assertOk();

        $this->actingAs($member)->get(route('expenses.index', ['workspace' => $workspace->id]))
            ->assertForbidden();
    }

    public function test_full_family_plus_allows_member_to_access_expenses(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');

        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i', 'trialing');

        $this->actingAs($member)->get(route('expenses.index', ['workspace' => $workspace->id]))
            ->assertOk();
    }

    public function test_plus_plan_cannot_access_complete_only_schedule_wizard(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();

        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i', 'trialing');

        $this->actingAs($owner)->get(route('calendar.schedule-wizard', ['workspace' => $workspace->id]))
            ->assertRedirect(route('billing', ['plan' => 'complete', 'mode' => 'family']));
    }

    public function test_complete_family_plan_allows_owner_to_access_schedule_wizard(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();

        $this->createSubscription($owner, 'price_1TKeouGVa0O4LKuhObats41S', 'trialing');

        $this->actingAs($owner)->get(route('calendar.schedule-wizard', ['workspace' => $workspace->id]))
            ->assertOk();
    }

    public function test_member_cannot_access_billing_page(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');

        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i', 'trialing');

        $this->actingAs($member)->get(route('billing', ['workspace' => $workspace->id]))
            ->assertForbidden();
    }

    /**
     * @return array{0: Workspace, 1: User}
     */
    private function makeWorkspace(): array
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $owner->assignRole('family-owner');

        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        return [$workspace, $owner];
    }

    /**
     * @return array{0: User, 1: WorkspaceMember}
     */
    private function attachMember(Workspace $workspace, string $name, string $role): array
    {
        $user = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
        ]);

        $applicationRole = match ($role) {
            'coparent' => 'family-coparent',
            'caregiver' => 'caregiver',
            default => 'family-member',
        };

        $user->assignRole($applicationRole);

        $membership = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => $role,
        ]);

        return [$user, $membership];
    }

    private function createSubscription(User $user, string $priceId, string $status): void
    {
        $user->forceFill([
            'stripe_id' => 'cus_test_'.$user->id,
        ])->save();

        DB::table('subscriptions')->insert([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_id' => 'sub_test_'.$user->id.'_'.md5($priceId),
            'stripe_status' => $status,
            'stripe_price' => $priceId,
            'quantity' => 1,
            'trial_ends_at' => now()->addDays(30),
            'ends_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
