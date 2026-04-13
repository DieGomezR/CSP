<?php

declare(strict_types=1);

use App\Models\Child;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('schedule wizard stores the selected pattern and generates custody events', function () {
    $owner = User::factory()->create();
    $coparent = User::factory()->create();

    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
        'type' => 'family',
        'timezone' => 'America/New_York',
        'settings' => [],
    ]);

    $startingMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();

    $coparentMember = WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $coparent->id,
        'role' => 'member',
        'status' => 'active',
    ]);

    $children = Child::factory()->count(2)->create([
        'workspace_id' => $workspace->id,
    ]);

    $this->actingAs($owner)
        ->post(route('workspaces.schedule-wizard.store', $workspace), [
            'pattern' => 'alternating-weeks',
            'children_ids' => $children->pluck('id')->all(),
            'starting_parent_member_id' => $startingMember->id,
            'start_date' => '2026-04-06',
            'generate_until' => '1 year',
            'end_date' => '2026-04-20',
            'exchange_day' => 'Sunday',
            'exchange_time' => '18:00',
            'school_calendar' => 'Houston ISD 2025-2026',
        ])
        ->assertRedirect(route('calendar', [
            'workspace' => $workspace->id,
            'month' => '2026-04',
        ]));

    $workspace->refresh();

    expect(data_get($workspace->settings, 'custody_schedule.pattern'))->toBe('alternating-weeks');
    expect(data_get($workspace->settings, 'custody_schedule.completed_at'))->not->toBeNull();

    $events = $workspace->calendarEvents()
        ->where('source', 'custody_wizard')
        ->orderBy('starts_at')
        ->get();

    expect($events)->toHaveCount(2);
    expect($events->every(fn ($event) => $event->children()->count() === 2))->toBeTrue();
    expect($events->pluck('meta.assigned_member_id')->all())->toBe([
        $startingMember->id,
        $coparentMember->id,
    ]);
});

test('schedule wizard regeneration replaces previous custody wizard events', function () {
    $owner = User::factory()->create();
    $coparent = User::factory()->create();

    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
        'type' => 'family',
        'timezone' => 'America/New_York',
        'settings' => [],
    ]);

    $startingMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();

    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $coparent->id,
        'role' => 'member',
        'status' => 'active',
    ]);

    $child = Child::factory()->create([
        'workspace_id' => $workspace->id,
    ]);

    $payload = [
        'pattern' => 'every-other-weekend',
        'children_ids' => [$child->id],
        'starting_parent_member_id' => $startingMember->id,
        'start_date' => '2026-04-06',
        'generate_until' => '1 year',
        'end_date' => '2026-04-20',
        'exchange_day' => 'Sunday',
        'exchange_time' => '18:00',
        'school_calendar' => null,
    ];

    $this->actingAs($owner)->post(route('workspaces.schedule-wizard.store', $workspace), $payload);
    $this->actingAs($owner)->post(route('workspaces.schedule-wizard.store', $workspace), array_merge($payload, [
        'pattern' => '2-2-3',
    ]));

    $events = $workspace->fresh()->calendarEvents()
        ->where('source', 'custody_wizard')
        ->get();

    expect($events->count())->toBeGreaterThan(2);
    expect($events->every(fn ($event) => data_get($event->meta, 'pattern') === '2-2-3'))->toBeTrue();
});
