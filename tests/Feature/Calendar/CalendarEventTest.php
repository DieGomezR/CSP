<?php

use App\Models\CalendarEvent;
use App\Models\Child;
use App\Models\User;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow('2026-04-04 09:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

test('workspace members can create family calendar events with child assignments', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'type' => 'family',
        'timezone' => 'America/Bogota',
    ]);
    $child = Child::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Emma',
        'color' => '#4DBFAE',
    ]);

    $response = $this->actingAs($user)->post(route('workspaces.events.store', $workspace), [
        'title' => 'Soccer practice',
        'description' => 'Bring shin guards',
        'location' => 'Community field',
        'starts_at' => '2026-04-08T17:00',
        'ends_at' => '2026-04-08T18:30',
        'timezone' => 'America/Bogota',
        'is_all_day' => false,
        'color' => '#4DBFAE',
        'child_ids' => [$child->id],
        'recurrence_type' => 'none',
        'recurrence_interval' => 1,
        'recurrence_until' => null,
        'recurrence_days_of_week' => [],
    ]);

    $response->assertRedirect(route('calendar', [
        'workspace' => $workspace->id,
        'month' => '2026-04',
    ], absolute: false));

    $event = CalendarEvent::query()->first();

    expect($event)->not->toBeNull();
    expect($event->workspace_id)->toBe($workspace->id);
    expect($event->title)->toBe('Soccer practice');
    expect($event->recurrence_type)->toBeNull();

    $this->assertDatabaseHas('calendar_event_child', [
        'calendar_event_id' => $event->id,
        'child_id' => $child->id,
    ]);
});

test('calendar page expands recurring weekly events for the visible month', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'type' => 'family',
        'timezone' => 'America/Bogota',
    ]);
    $child = Child::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Noah',
        'color' => '#5B8DEF',
    ]);

    $event = CalendarEvent::factory()->create([
        'workspace_id' => $workspace->id,
        'creator_id' => $user->id,
        'title' => 'Alternating handoff',
        'timezone' => 'America/Bogota',
        'starts_at' => '2026-04-06 08:00:00-05',
        'ends_at' => '2026-04-06 09:00:00-05',
        'color' => '#5B8DEF',
        'recurrence_type' => 'weekly',
        'recurrence_interval' => 1,
        'recurrence_days_of_week' => [1, 3],
        'recurrence_until' => '2026-04-30 23:59:59-05',
    ]);
    $event->children()->sync([$child->id]);

    $this->actingAs($user)
        ->get(route('calendar', [
            'workspace' => $workspace->id,
            'month' => '2026-04',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calendar')
            ->where('calendar.summary.series_count', 1)
            ->where('calendar.summary.occurrences_count', 8)
            ->where('calendar.upcoming.0.title', 'Alternating handoff'));
});
