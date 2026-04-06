<?php

namespace App\Actions\Calendar;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Models\Workspace;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class CreateCalendarEvent
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function handle(Workspace $workspace, User $user, array $validated): CalendarEvent
    {
        $timezone = $validated['timezone'];
        $startsAt = CarbonImmutable::parse($validated['starts_at'], $timezone);
        $endsAt = filled($validated['ends_at'] ?? null)
            ? CarbonImmutable::parse($validated['ends_at'], $timezone)
            : null;

        $recurrenceType = ($validated['recurrence_type'] ?? 'none') === 'none'
            ? null
            : $validated['recurrence_type'];

        $recurrenceDays = collect($validated['recurrence_days_of_week'] ?? [])
            ->map(fn ($value) => (int) $value)
            ->unique()
            ->sort()
            ->values();

        if ($recurrenceType === 'weekly' && $recurrenceDays->isEmpty()) {
            $recurrenceDays = collect([$startsAt->dayOfWeek]);
        }

        $recurrenceUntil = filled($validated['recurrence_until'] ?? null)
            ? CarbonImmutable::parse($validated['recurrence_until'], $timezone)->endOfDay()
            : null;

        /** @var CalendarEvent $event */
        $event = DB::transaction(function () use (
            $workspace,
            $user,
            $validated,
            $timezone,
            $startsAt,
            $endsAt,
            $recurrenceType,
            $recurrenceDays,
            $recurrenceUntil
        ) {
            $event = $workspace->calendarEvents()->create([
                'creator_id' => $user->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'location' => $validated['location'] ?? null,
                'timezone' => $timezone,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'is_all_day' => (bool) ($validated['is_all_day'] ?? false),
                'color' => $validated['color'],
                'recurrence_type' => $recurrenceType,
                'recurrence_interval' => $recurrenceType ? (int) ($validated['recurrence_interval'] ?? 1) : null,
                'recurrence_days_of_week' => $recurrenceType === 'weekly' ? $recurrenceDays->all() : null,
                'recurrence_until' => $recurrenceUntil,
                'meta' => [
                    'created_via' => 'dashboard',
                ],
            ]);

            $event->children()->sync($this->filterChildIds($workspace, $validated['child_ids'] ?? []));

            return $event;
        });

        return $event->load('children:id,workspace_id,name,color');
    }

    /**
     * @param  array<int, int>  $childIds
     * @return array<int, int>
     */
    protected function filterChildIds(Workspace $workspace, array $childIds): array
    {
        return $workspace->children()
            ->whereIn('id', $childIds)
            ->pluck('id')
            ->all();
    }
}
