<?php

namespace App\Http\Controllers;

use App\Actions\Calendar\CreateCalendarEvent;
use App\Http\Requests\Calendar\StoreCalendarEventRequest;
use App\Models\Workspace;
use App\Support\Calendar\BuildMonthCalendar;
use App\Support\Workspaces\BuildRecentActivityFeed;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FamilyCalendarController extends Controller
{
    public function index(
        Request $request,
        BuildMonthCalendar $buildMonthCalendar,
        BuildRecentActivityFeed $buildRecentActivityFeed
    ): Response|RedirectResponse {
        $user = $request->user();

        if (! $user->workspaces()->exists()) {
            return to_route('onboarding.family.create');
        }

        $workspace = $this->resolveWorkspace($request);

        if (! $workspace) {
            return to_route('onboarding.family.create');
        }

        $month = $this->resolveMonth($request->query('month'), $workspace->timezone);

        return Inertia::render('dashboard', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'type' => $workspace->type,
                'timezone' => $workspace->timezone,
                'children_count' => $workspace->children_count,
                'members_count' => $workspace->members_count,
                'events_count' => $workspace->calendar_events_count,
                'children' => $workspace->children
                    ->map(fn ($child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'color' => $child->color,
                        'birthdate' => $child->birthdate?->toDateString(),
                    ])
                    ->values(),
                'members' => $workspace->members
                    ->map(fn ($member) => [
                        'id' => $member->id,
                        'user_id' => $member->user_id,
                        'name' => $member->user?->name,
                        'email' => $member->user?->email,
                        'role' => $member->role,
                        'joined_at' => ($member->joined_at ?? $member->created_at)?->toIso8601String(),
                    ])
                    ->values(),
            ],
            'workspaces' => $user->workspaces()
                ->where('type', 'family')
                ->withCount(['children', 'members', 'calendarEvents'])
                ->orderBy('name')
                ->get(['workspaces.id', 'name', 'type', 'timezone']),
            'calendar' => $buildMonthCalendar->handle($workspace, $month),
            'recentActivity' => $buildRecentActivityFeed->handle($workspace),
        ]);
    }

    public function store(
        StoreCalendarEventRequest $request,
        Workspace $workspace,
        CreateCalendarEvent $createCalendarEvent
    ): RedirectResponse {
        $event = $createCalendarEvent->handle($workspace, $request->user(), $request->validated());

        return to_route('dashboard', [
            'workspace' => $workspace->id,
            'month' => CarbonImmutable::instance($event->starts_at)->setTimezone($workspace->timezone)->format('Y-m'),
        ])->with('status', 'Event added to the family calendar.');
    }

    protected function resolveWorkspace(Request $request): ?Workspace
    {
        $workspaceId = $request->integer('workspace');

        return $request->user()->workspaces()
            ->where('type', 'family')
            ->when($workspaceId > 0, fn ($query) => $query->where('workspaces.id', $workspaceId))
            ->withCount(['children', 'members', 'calendarEvents'])
            ->with([
                'children:id,workspace_id,name,color,birthdate,created_at',
                'members.user:id,name,email',
                'owner:id,name,email',
                'calendarEvents:id,workspace_id,creator_id,title,recurrence_type,created_at',
            ])
            ->orderBy('name')
            ->first();
    }

    protected function resolveMonth(?string $month, string $timezone): CarbonImmutable
    {
        if (! is_string($month) || ! preg_match('/^\d{4}-\d{2}$/', $month)) {
            return now($timezone)->toImmutable()->startOfMonth();
        }

        try {
            return CarbonImmutable::parse($month.'-01', $timezone)->startOfMonth();
        } catch (\Throwable) {
            return now($timezone)->toImmutable()->startOfMonth();
        }
    }
}
