<?php

namespace App\Http\Controllers;

use App\Actions\Calendar\CreateCalendarEvent;
use App\Http\Requests\Calendar\StoreCalendarEventRequest;
use App\Models\Workspace;
use App\Support\Calendar\BuildCalendarFeedLinks;
use App\Support\Calendar\BuildMonthCalendar;
use App\Support\Workspaces\BuildRecentActivityFeed;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class FamilyCalendarController extends Controller
{
    public function index(
        Request $request,
        BuildRecentActivityFeed $buildRecentActivityFeed
    ): Response|RedirectResponse {
        $workspace = $this->resolveWorkspaceModel($request);

        if (! $request->user()->workspaces()->exists() || ! $workspace) {
            return to_route('onboarding.family.create');
        }

        return Inertia::render('dashboard', [
            'workspace' => $this->serializeWorkspace($workspace),
            'workspaces' => $this->resolveFamilyWorkspaces($request),
            'recentActivity' => $buildRecentActivityFeed->handle($workspace),
        ]);
    }

    public function calendar(
        Request $request,
        BuildMonthCalendar $buildMonthCalendar,
        BuildCalendarFeedLinks $buildCalendarFeedLinks
    ): Response|RedirectResponse {
        $workspace = $this->resolveWorkspaceModel($request);

        if (! $request->user()->workspaces()->exists() || ! $workspace) {
            return to_route('onboarding.family.create');
        }

        $month = $this->resolveMonth($request->query('month'), $workspace->timezone);

        return Inertia::render('calendar', [
            'workspace' => $this->serializeWorkspace($workspace),
            'workspaces' => $this->resolveFamilyWorkspaces($request),
            'calendar' => $buildMonthCalendar->handle($workspace, $month),
            'syncFeeds' => $this->buildCalendarFeeds($workspace, $buildCalendarFeedLinks),
        ]);
    }

    public function scheduleWizard(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspaceModel($request);

        if (! $request->user()->workspaces()->exists() || ! $workspace) {
            return to_route('onboarding.family.create');
        }

        return Inertia::render('calendar/schedule-wizard', [
            'workspace' => $this->serializeWorkspace($workspace),
            'workspaces' => $this->resolveFamilyWorkspaces($request),
            'schoolCalendarOptions' => $this->schoolCalendarOptions(),
        ]);
    }

    public function store(
        StoreCalendarEventRequest $request,
        Workspace $workspace,
        CreateCalendarEvent $createCalendarEvent
    ): RedirectResponse {
        $event = $createCalendarEvent->handle($workspace, $request->user(), $request->validated());

        return to_route('calendar', [
            'workspace' => $workspace->id,
            'month' => CarbonImmutable::instance($event->starts_at)->setTimezone($workspace->timezone)->format('Y-m'),
        ])->with('status', 'Event added to the family calendar.');
    }

    public function storeScheduleWizard(Request $request, Workspace $workspace): RedirectResponse
    {
        abort_unless(
            $request->user() !== null && $workspace->users()->whereKey($request->user()->id)->exists(),
            403
        );

        $validated = $request->validate([
            'children_ids' => ['required', 'array', 'min:1'],
            'children_ids.*' => [
                'integer',
                Rule::exists('children', 'id')->where(
                    fn ($query) => $query->where('workspace_id', $workspace->id)
                ),
            ],
            'starting_parent_member_id' => [
                'required',
                'integer',
                Rule::exists('workspace_members', 'id')->where(
                    fn ($query) => $query->where('workspace_id', $workspace->id)
                ),
            ],
            'start_date' => ['required', 'date'],
            'generate_until' => ['required', Rule::in(['6 months', '1 year', '2 years'])],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'exchange_day' => ['required', Rule::in(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])],
            'exchange_time' => ['required', 'date_format:H:i'],
            'school_calendar' => ['nullable', 'string', 'max:160'],
        ]);

        $settings = $workspace->settings ?? [];
        $settings['custody_schedule'] = [
            'completed_at' => now()->toIso8601String(),
            'children_ids' => array_values($validated['children_ids']),
            'starting_parent_member_id' => $validated['starting_parent_member_id'],
            'start_date' => $validated['start_date'],
            'generate_until' => $validated['generate_until'],
            'end_date' => $validated['end_date'],
            'exchange_day' => $validated['exchange_day'],
            'exchange_time' => $validated['exchange_time'],
            'school_calendar' => $validated['school_calendar'] ?: null,
        ];

        $workspace->forceFill(['settings' => $settings])->save();

        return to_route('calendar', [
            'workspace' => $workspace->id,
            'month' => CarbonImmutable::parse($validated['start_date'], $workspace->timezone)->format('Y-m'),
        ])->with('status', 'Custody schedule setup saved.');
    }

    protected function resolveFamilyWorkspaces(Request $request)
    {
        return $request->user()->workspaces()
            ->where('type', 'family')
            ->withCount(['children', 'members', 'calendarEvents'])
            ->orderBy('name')
            ->get(['workspaces.id', 'name', 'type', 'timezone']);
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeWorkspace(Workspace $workspace): array
    {
        $custodySchedule = array_merge([
            'completed_at' => null,
            'children_ids' => [],
            'starting_parent_member_id' => null,
            'start_date' => null,
            'generate_until' => '1 year',
            'end_date' => null,
            'exchange_day' => 'Sunday',
            'exchange_time' => '18:00',
            'school_calendar' => null,
        ], data_get($workspace->settings ?? [], 'custody_schedule', []));

        return [
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
            'setup' => [
                'custody_schedule_completed' => filled($custodySchedule['completed_at']),
                'custody_schedule_completed_at' => $custodySchedule['completed_at'],
            ],
            'custody_schedule' => $custodySchedule,
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function buildCalendarFeeds(Workspace $workspace, BuildCalendarFeedLinks $buildCalendarFeedLinks)
    {
        return $workspace->calendarFeeds()
            ->whereNull('revoked_at')
            ->latest()
            ->get()
            ->map(fn ($calendarFeed) => $buildCalendarFeedLinks->handle($calendarFeed))
            ->values();
    }

    protected function resolveWorkspaceModel(Request $request): ?Workspace
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

    /**
     * @return array<int, array{name:string, region:string}>
     */
    protected function schoolCalendarOptions(): array
    {
        return [
            ['name' => 'Houston ISD 2025-2026', 'region' => 'Texas'],
            ['name' => 'Dallas ISD 2025-2026', 'region' => 'Texas'],
            ['name' => 'Los Angeles Unified 2025-2026', 'region' => 'California'],
            ['name' => 'San Diego Unified 2025-2026', 'region' => 'California'],
            ['name' => 'NYC Department of Education 2025-2026', 'region' => 'New York'],
            ['name' => 'Chicago Public Schools 2025-2026', 'region' => 'Illinois'],
            ['name' => 'Clark County (Las Vegas) 2025-2026', 'region' => 'Nevada'],
        ];
    }
}
