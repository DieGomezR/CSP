<?php

namespace App\Support\Calendar;

use App\Models\CalendarEvent;
use App\Models\CalendarFeed;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class BuildCalendarFeedIcs
{
    public function handle(CalendarFeed $calendarFeed): string
    {
        $workspace = $calendarFeed->workspace->loadMissing([
            'calendarEvents.children',
            'owner',
        ]);

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//KidSchedule//Family Calendar//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:'.$this->escape($calendarFeed->name),
            'X-WR-TIMEZONE:'.$workspace->timezone,
        ];

        $eventBlocks = $workspace->calendarEvents
            ->sortBy('starts_at')
            ->flatMap(fn (CalendarEvent $event) => $this->buildEventLines($event, $workspace->timezone))
            ->all();

        $lines = [...$lines, ...$eventBlocks, 'END:VCALENDAR'];

        return implode("\r\n", $lines)."\r\n";
    }

    /**
     * @return array<int, string>
     */
    protected function buildEventLines(CalendarEvent $event, string $fallbackTimezone): array
    {
        $timezone = $event->timezone ?: $fallbackTimezone;
        $startsAt = CarbonImmutable::instance($event->starts_at)->setTimezone($timezone);
        $endsAt = $event->ends_at
            ? CarbonImmutable::instance($event->ends_at)->setTimezone($timezone)
            : ($event->is_all_day ? $startsAt : $startsAt->addHour());

        $children = $event->children
            ->pluck('name')
            ->filter()
            ->implode(', ');

        $lines = [
            'BEGIN:VEVENT',
            sprintf('UID:event-%d@kidschedule.com', $event->id),
            'DTSTAMP:'.CarbonImmutable::instance($event->updated_at ?? $event->created_at)->utc()->format('Ymd\THis\Z'),
            'LAST-MODIFIED:'.CarbonImmutable::instance($event->updated_at ?? $event->created_at)->utc()->format('Ymd\THis\Z'),
            'SUMMARY:'.$this->escape($event->title),
            'STATUS:CONFIRMED',
        ];

        if ($event->is_all_day) {
            $lines[] = 'DTSTART;VALUE=DATE:'.$startsAt->format('Ymd');
            $lines[] = 'DTEND;VALUE=DATE:'.$endsAt->addDay()->format('Ymd');
        } else {
            $lines[] = sprintf('DTSTART;TZID=%s:%s', $timezone, $startsAt->format('Ymd\THis'));
            $lines[] = sprintf('DTEND;TZID=%s:%s', $timezone, $endsAt->format('Ymd\THis'));
        }

        if (filled($event->description)) {
            $lines[] = 'DESCRIPTION:'.$this->escape((string) $event->description);
        }

        if (filled($event->location)) {
            $lines[] = 'LOCATION:'.$this->escape((string) $event->location);
        }

        if ($children !== '') {
            $lines[] = 'CATEGORIES:'.$this->escape($children);
        }

        if ($rrule = $this->buildRrule($event)) {
            $lines[] = 'RRULE:'.$rrule;
        }

        $lines[] = 'END:VEVENT';

        return $lines;
    }

    protected function buildRrule(CalendarEvent $event): ?string
    {
        if ($event->recurrence_type === null) {
            return null;
        }

        $parts = ['FREQ='.strtoupper($event->recurrence_type)];
        $interval = max(1, (int) ($event->recurrence_interval ?? 1));

        if ($interval > 1) {
            $parts[] = 'INTERVAL='.$interval;
        }

        if ($event->recurrence_type === 'weekly') {
            $dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            $days = Collection::make($event->recurrence_days_of_week ?? [])
                ->map(fn ($day) => $dayMap[(int) $day] ?? null)
                ->filter()
                ->implode(',');

            if ($days !== '') {
                $parts[] = 'BYDAY='.$days;
            }
        }

        if ($event->recurrence_until) {
            $parts[] = 'UNTIL='.CarbonImmutable::instance($event->recurrence_until)->utc()->format('Ymd\THis\Z');
        }

        return implode(';', $parts);
    }

    protected function escape(string $value): string
    {
        return str_replace(
            ['\\', ';', ',', "\r\n", "\n", "\r"],
            ['\\\\', '\;', '\,', '\n', '\n', '\n'],
            trim($value)
        );
    }
}
