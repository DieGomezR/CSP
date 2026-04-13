<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users without a workspace are redirected to onboarding', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertRedirect(route('onboarding.family.create', absolute: false));
});

test('authenticated users with a workspace can visit the dashboard', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);
    activateWorkspaceSubscription($user, 'price_1TKeneGVa0O4LKuhqZWStD8q');

    $this->actingAs($user)
        ->get(route('dashboard', ['workspace' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('workspace')
            ->has('recentActivity'));
});

test('dashboard includes saved appearance and pending invitations for owners', function () {
    $user = User::factory()->create([
        'preferences' => [
            'appearance' => [
                'theme' => 'minimal',
            ],
        ],
    ]);

    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);
    activateWorkspaceSubscription($user, 'price_1TKeneGVa0O4LKuhqZWStD8q');

    WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'invited_by_user_id' => $user->id,
        'email' => 'pending@example.com',
        'role' => 'coparent',
        'status' => 'pending',
        'token' => 'pending-dashboard-token',
        'expires_at' => now()->addDays(7),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['workspace' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('appearance.theme', 'minimal')
            ->has('workspace.pending_invitations', 1));
});

test('dashboard hides owner management actions from non-owner members', function () {
    $owner = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $owner->assignRole('family-owner');

    $member = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $member->assignRole('family-member');

    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
    ]);
    activateWorkspaceSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i');

    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => 'member',
    ]);

    $response = $this->actingAs($member)->get(route('dashboard', ['workspace' => $workspace->id]));

    $response
        ->assertOk()
        ->assertDontSee('Manage workspace')
        ->assertDontSee('Create Invitation')
        ->assertDontSee('Remove Member')
        ->assertDontSee('Delete Child');
});

function activateWorkspaceSubscription(User $user, string $priceId): void
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
