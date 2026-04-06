<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('family onboarding screen can be rendered for users without a workspace', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('onboarding.family.create'))
        ->assertOk();
});

test('users with an existing workspace are redirected away from family onboarding', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('onboarding.family.create'))
        ->assertRedirect(route('dashboard', absolute: false));
});

test('family onboarding creates the first workspace membership and children', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('onboarding.family.store'), [
        'family_name' => 'Rivera Family',
        'timezone' => 'America/Bogota',
        'children' => [
            [
                'name' => 'Emma',
                'birthdate' => '2018-04-10',
                'color' => '#4DBFAE',
            ],
            [
                'name' => 'Noah',
                'birthdate' => '2020-11-02',
                'color' => '#FF8A5B',
            ],
        ],
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $workspace = Workspace::query()->first();

    expect($workspace)->not->toBeNull();
    expect($workspace->type)->toBe('family');
    expect($workspace->owner_id)->toBe($user->id);
    expect($workspace->children()->count())->toBe(2);
    expect($workspace->members()->count())->toBe(1);

    $this->assertDatabaseHas('workspace_members', [
        'workspace_id' => $workspace->id,
        'user_id' => $user->id,
        'role' => 'owner',
    ]);
});
