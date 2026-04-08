<?php

use App\Models\CalendarEvent;
use App\Models\CalendarFeed;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('family workspaces can open the calendar page', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'type' => 'family',
        'timezone' => 'America/Bogota',
    ]);

    $this->actingAs($user)
        ->get(route('calendar', ['workspace' => $workspace->id, 'month' => '2026-04']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calendar')
            ->has('workspace')
            ->has('calendar.summary')
            ->has('syncFeeds', 0));
});

test('family members can create a sync feed and download it as ics', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'type' => 'family',
        'timezone' => 'America/Bogota',
    ]);

    CalendarEvent::factory()->create([
        'workspace_id' => $workspace->id,
        'creator_id' => $user->id,
        'title' => 'School pickup',
        'timezone' => 'America/Bogota',
        'starts_at' => '2026-04-08 15:00:00-05',
        'ends_at' => '2026-04-08 16:00:00-05',
        'recurrence_type' => 'weekly',
        'recurrence_interval' => 1,
        'recurrence_days_of_week' => [3],
        'recurrence_until' => '2026-04-30 23:59:59-05',
    ]);

    $this->actingAs($user)
        ->from(route('calendar', ['workspace' => $workspace->id], absolute: false))
        ->post(route('workspaces.calendar-feeds.store', ['workspace' => $workspace->id]))
        ->assertRedirect(route('calendar', ['workspace' => $workspace->id], absolute: false));

    $feed = CalendarFeed::query()->first();

    expect($feed)->not->toBeNull();
    expect($feed->workspace_id)->toBe($workspace->id);

    $this->get(route('calendar-feeds.show', ['token' => $feed->token]))
        ->assertOk()
        ->assertHeader('Content-Type', 'text/calendar; charset=UTF-8')
        ->assertSee('BEGIN:VCALENDAR', false)
        ->assertSee('SUMMARY:School pickup', false)
        ->assertSee('RRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20260501T045959Z', false);
});
