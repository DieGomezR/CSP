<?php

namespace App\Support\Workspaces;

use App\Models\CalendarEvent;
use App\Models\Child;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class BuildRecentActivityFeed
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function handle(Workspace $workspace): array
    {
        $workspace->loadMissing([
            'owner',
            'children',
            'members.user',
            'calendarEvents.creator',
        ]);

        $items = collect()
            ->push($this->workspaceCreatedItem($workspace))
            ->merge($this->memberItems($workspace))
            ->merge($this->childItems($workspace))
            ->merge($this->calendarItems($workspace))
            ->filter()
            ->sortByDesc('timestamp_sort')
            ->take(12)
            ->values();

        return $items->map(function (array $item, int $index) {
            unset($item['timestamp_sort']);

            $item['highlighted'] = $index === 1;

            return $item;
        })->all();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function memberItems(Workspace $workspace): Collection
    {
        return $workspace->members
            ->filter(fn (WorkspaceMember $member) => $member->user !== null)
            ->map(fn (WorkspaceMember $member) => $this->makeItem(
                id: sprintf('member-%s', $member->id),
                icon: 'member',
                title: sprintf('%s joined the family workspace', $member->user->name),
                detail: ucfirst($member->role),
                timestamp: $member->joined_at ?? $member->created_at,
            ));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function childItems(Workspace $workspace): Collection
    {
        return $workspace->children
            ->map(fn (Child $child) => $this->makeItem(
                id: sprintf('child-%s', $child->id),
                icon: 'child',
                title: sprintf('%s was added to the schedule', $child->name),
                detail: 'Child profile created',
                timestamp: $child->created_at,
            ));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function calendarItems(Workspace $workspace): Collection
    {
        return $workspace->calendarEvents
            ->sortByDesc('created_at')
            ->take(8)
            ->map(fn (CalendarEvent $event) => $this->makeItem(
                id: sprintf('event-%s', $event->id),
                icon: 'calendar',
                title: sprintf('%s was scheduled', $event->title),
                detail: $event->recurrence_type ? 'Recurring event' : 'One-time event',
                timestamp: $event->created_at,
            ));
    }

    /**
     * @return array<string, mixed>
     */
    protected function workspaceCreatedItem(Workspace $workspace): array
    {
        return $this->makeItem(
            id: sprintf('workspace-%s', $workspace->id),
            icon: 'workspace',
            title: sprintf('%s workspace was created', $workspace->name),
            detail: 'Family setup started',
            timestamp: $workspace->created_at,
        );
    }

    /**
     * @return array<string, mixed>
     */
    protected function makeItem(string $id, string $icon, string $title, string $detail, ?CarbonInterface $timestamp): array
    {
        $safeTimestamp = $timestamp ?? now();

        return [
            'id' => $id,
            'icon' => $icon,
            'title' => $title,
            'detail' => $detail,
            'relative_time' => $safeTimestamp->diffForHumans(),
            'timestamp_iso' => $safeTimestamp->toIso8601String(),
            'timestamp_sort' => $safeTimestamp->timestamp,
        ];
    }
}
