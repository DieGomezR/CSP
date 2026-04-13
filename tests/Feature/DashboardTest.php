<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users without a workspace are redirected to onboarding', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertRedirect(route('onboarding.family.create', absolute: false));
});

test('authenticated users with a workspace can visit the dashboard', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
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
