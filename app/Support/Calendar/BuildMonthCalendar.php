<?php

namespace App\Support\Calendar;

use App\Models\CalendarEvent;
use App\Models\Workspace;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class BuildMonthCalendar
{
    public function handle(Workspace $workspace, CarbonImmutable $month): array
    {
        $timezone = $workspace->timezone;
        $monthStart = $month->setTimezone($timezone)->startOfMonth();
        $monthEnd = $monthStart->endOfMonth();
        $gridStart = $monthStart->startOfWeek(CarbonInterface::SUNDAY);
        $gridEnd = $monthEnd->endOfWeek(CarbonInterface::SATURDAY);

        $events = $workspace->calendarEvents()
            ->with('children:id,workspace_id,name,color')
            ->where(function ($query) use ($gridStart, $gridEnd) {
                $query
                    ->where(function ($singleEvents) use ($gridStart, $gridEnd) {
                        $singleEvents
                            ->whereNull('recurrence_type')
                            ->where('starts_at', '<=', $gridEnd->endOfDay()->utc())
                            ->where(function ($overlap) use ($gridStart) {
                                $overlap
                                    ->whereNull('ends_at')
                                    ->orWhere('ends_at', '>=', $gridStart->startOfDay()->utc());
                            });
                    })
                    ->orWhere(function ($recurringEvents) use ($gridStart, $gridEnd) {
                        $recurringEvents
                            ->whereNotNull('recurrence_type')
                            ->where('starts_at', '<=', $gridEnd->endOfDay()->utc())
                            ->where(function ($activeRecurrence) use ($gridStart) {
                                $activeRecurrence
                                    ->whereNull('recurrence_until')
                                    ->orWhere('recurrence_until', '>=', $gridStart->startOfDay()->utc());
                            });
                    });
            })
            ->orderBy('starts_at')
            ->get();

        $occurrences = $events
            ->flatMap(fn (CalendarEvent $event) => $this->expandEvent($event, $gridStart, $gridEnd))
            ->sortBy('starts_at')
            ->values();

        $occurrencesByDate = $occurrences->groupBy('date');
        $days = collect();
        $cursor = $gridStart;

        while ($cursor->lessThanOrEqualTo($gridEnd)) {
            $dayKey = $cursor->toDateString();

            $days->push([
                'date' => $dayKey,
                'label' => $cursor->day,
                'is_current_month' => $cursor->isSameMonth($monthStart),
                'is_today' => $cursor->isSameDay(now($timezone)),
                'occurrences' => $occurrencesByDate->get($dayKey, collect())->values()->all(),
            ]);

            $cursor = $cursor->addDay();
        }

        return [
            'month' => $monthStart->format('Y-m'),
            'month_label' => $monthStart->isoFormat('MMMM YYYY'),
            'previous_month' => $monthStart->subMonth()->format('Y-m'),
            'next_month' => $monthStart->addMonth()->format('Y-m'),
            'weekday_labels' => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            'weeks' => $days->chunk(7)->map->values()->values()->all(),
            'occurrences' => $occurrences->all(),
            'upcoming' => $occurrences
                ->filter(fn (array $occurrence) => CarbonImmutable::parse($occurrence['starts_at'])->greaterThanOrEqualTo(now($timezone)->startOfDay()))
                ->take(6)
                ->values()
                ->all(),
            'summary' => [
                'occurrences_count' => $occurrences->count(),
                'series_count' => $events->whereNotNull('recurrence_type')->count(),
                'children_count' => $events
                    ->flatMap(fn (CalendarEvent $event) => $event->children->pluck('id'))
                    ->unique()
                    ->count(),
            ],
            'form_defaults' => [
                'starts_at' => now($timezone)->setTime(9, 0)->format('Y-m-d\TH:i'),
                'ends_at' => now($timezone)->setTime(10, 0)->format('Y-m-d\TH:i'),
                'color' => '#4DBFAE',
            ],
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function expandEvent(CalendarEvent $event, CarbonImmutable $rangeStart, CarbonImmutable $rangeEnd): Collection
    {
        $eventStart = CarbonImmutable::instance($event->starts_at)->setTimezone($event->timezone);
        $eventEnd = $event->ends_at
            ? CarbonImmutable::instance($event->ends_at)->setTimezone($event->timezone)
            : null;

        if ($event->recurrence_type === null) {
            if ($eventStart->greaterThan($rangeEnd->endOfDay()) || ($eventEnd && $eventEnd->lessThan($rangeStart->startOfDay()))) {
                return collect();
            }

            return collect([$this->serializeOccurrence($event, $eventStart, $eventEnd)]);
        }

        $durationInSeconds = $eventEnd ? $eventEnd->diffInSeconds($eventStart) : 0;
        $occurrences = collect();
        $cursor = $rangeStart;

        while ($cursor->lessThanOrEqualTo($rangeEnd)) {
            if ($this->eventOccursOnDate($event, $eventStart, $cursor)) {
                $occurrenceStart = $cursor->setTimeFrom($eventStart);
                $occurrenceEnd = $eventEnd ? $occurrenceStart->addSeconds($durationInSeconds) : null;

                $occurrences->push($this->serializeOccurrence($event, $occurrenceStart, $occurrenceEnd));
            }

            $cursor = $cursor->addDay();
        }

        return $occurrences;
    }

    protected function eventOccursOnDate(CalendarEvent $event, CarbonImmutable $eventStart, CarbonImmutable $date): bool
    {
        if ($date->lessThan($eventStart->startOfDay())) {
            return false;
        }

        $recurrenceUntil = $event->recurrence_until
            ? CarbonImmutable::instance($event->recurrence_until)->setTimezone($event->timezone)->endOfDay()
            : null;

        if ($recurrenceUntil && $date->greaterThan($recurrenceUntil)) {
            return false;
        }

        $interval = max(1, (int) ($event->recurrence_interval ?? 1));

        return match ($event->recurrence_type) {
            'daily' => $eventStart->startOfDay()->diffInDays($date) % $interval === 0,
            'weekly' => $this->matchesWeeklyRecurrence($event, $eventStart, $date, $interval),
            'monthly' => $this->matchesMonthlyRecurrence($eventStart, $date, $interval),
            default => false,
        };
    }

    protected function matchesWeeklyRecurrence(
        CalendarEvent $event,
        CarbonImmutable $eventStart,
        CarbonImmutable $date,
        int $interval
    ): bool {
        $days = collect($event->recurrence_days_of_week ?? [$eventStart->dayOfWeek])
            ->map(fn ($value) => (int) $value)
            ->unique()
            ->values();

        if (! $days->contains($date->dayOfWeek)) {
            return false;
        }

        $eventWeekStart = $eventStart->startOfWeek(CarbonInterface::SUNDAY);
        $currentWeekStart = $date->startOfWeek(CarbonInterface::SUNDAY);
        $weeksDifference = intdiv($eventWeekStart->diffInDays($currentWeekStart), 7);

        return $weeksDifference % $interval === 0;
    }

    protected function matchesMonthlyRecurrence(CarbonImmutable $eventStart, CarbonImmutable $date, int $interval): bool
    {
        if ($eventStart->day !== $date->day) {
            return false;
        }

        $monthsDifference = ($date->year - $eventStart->year) * 12 + ($date->month - $eventStart->month);

        return $monthsDifference >= 0 && $monthsDifference % $interval === 0;
    }

    protected function serializeOccurrence(
        CalendarEvent $event,
        CarbonImmutable $occurrenceStart,
        ?CarbonImmutable $occurrenceEnd
    ): array {
        $children = $event->children
            ->map(fn ($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'color' => $child->color,
            ])
            ->values()
            ->all();

        return [
            'id' => $event->id,
            'occurrence_key' => sprintf('%s:%s', $event->id, $occurrenceStart->toDateString()),
            'title' => $event->title,
            'description' => $event->description,
            'location' => $event->location,
            'date' => $occurrenceStart->toDateString(),
            'starts_at' => $occurrenceStart->toIso8601String(),
            'ends_at' => $occurrenceEnd?->toIso8601String(),
            'display_time' => $this->formatTimeRange($event, $occurrenceStart, $occurrenceEnd),
            'color' => $event->color ?: ($children[0]['color'] ?? '#4DBFAE'),
            'is_recurring' => $event->recurrence_type !== null,
            'recurrence_label' => $this->formatRecurrenceLabel($event),
            'children' => $children,
        ];
    }

    protected function formatTimeRange(
        CalendarEvent $event,
        CarbonImmutable $occurrenceStart,
        ?CarbonImmutable $occurrenceEnd
    ): string {
        if ($event->is_all_day) {
            return 'All day';
        }

        if (! $occurrenceEnd) {
            return $occurrenceStart->format('g:i A');
        }

        return sprintf('%s - %s', $occurrenceStart->format('g:i A'), $occurrenceEnd->format('g:i A'));
    }

    protected function formatRecurrenceLabel(CalendarEvent $event): ?string
    {
        if ($event->recurrence_type === null) {
            return null;
        }

        $interval = max(1, (int) ($event->recurrence_interval ?? 1));

        return match ($event->recurrence_type) {
            'daily' => $interval === 1 ? 'Every day' : sprintf('Every %d days', $interval),
            'weekly' => $this->formatWeeklyLabel($event, $interval),
            'monthly' => $interval === 1 ? 'Every month' : sprintf('Every %d months', $interval),
            default => null,
        };
    }

    protected function formatWeeklyLabel(CalendarEvent $event, int $interval): string
    {
        $dayLabels = collect($event->recurrence_days_of_week ?? [])
            ->map(fn ($day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(int) $day] ?? null)
            ->filter()
            ->implode(', ');

        if ($interval === 1) {
            return $dayLabels ? sprintf('Every week on %s', $dayLabels) : 'Every week';
        }

        return $dayLabels
            ? sprintf('Every %d weeks on %s', $interval, $dayLabels)
            : sprintf('Every %d weeks', $interval);
    }
}
