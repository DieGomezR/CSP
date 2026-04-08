<?php

use App\Models\User;
use App\Models\Workspace;
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
