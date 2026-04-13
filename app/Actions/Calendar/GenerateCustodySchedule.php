<?php

declare(strict_types=1);

namespace App\Actions\Calendar;

use App\Models\Child;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class GenerateCustodySchedule
{
    /**
     * @param array{
     *     pattern:string,
     *     children_ids:array<int, int>,
     *     starting_parent_member_id:int,
     *     start_date:string,
     *     end_date:string,
     *     exchange_time:string
     * } $validated
     */
    public function handle(Workspace $workspace, User $user, array $validated): void
    {
        $members = $workspace->members()
            ->with('user:id,name,email')
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        $startingMember = $members->firstWhere('id', $validated['starting_parent_member_id']);

        if (! $startingMember instanceof WorkspaceMember) {
            throw new InvalidArgumentException('Starting parent member is invalid.');
        }

        $children = $workspace->children()
            ->whereIn('id', $validated['children_ids'])
            ->orderBy('id')
            ->get();

        if ($children->isEmpty()) {
            throw new InvalidArgumentException('At least one child is required to generate custody events.');
        }

        $timezone = $workspace->timezone;
        $startAt = CarbonImmutable::parse(
            $validated['start_date'].' '.$validated['exchange_time'],
            $timezone,
        );
        $endBoundary = CarbonImmutable::parse(
            $validated['end_date'].' '.$validated['exchange_time'],
            $timezone,
        );

        DB::transaction(function () use ($workspace, $user, $validated, $members, $startingMember, $children, $startAt, $endBoundary): void {
            $workspace->calendarEvents()
                ->where('source', 'custody_wizard')
                ->delete();

            $blocks = $this->buildBlocks(
                members: $members,
                startingMember: $startingMember,
                pattern: $validated['pattern'],
            );

            $cursor = $startAt;
            $index = 0;

            while ($cursor->lessThan($endBoundary)) {
                $block = $blocks[$index % count($blocks)];
                $nextCursor = $cursor->addDays($block['days']);

                if ($nextCursor->greaterThan($endBoundary)) {
                    $nextCursor = $endBoundary;
                }

                $event = $workspace->calendarEvents()->create([
                    'creator_id' => $user->id,
                    'title' => 'Custody Time: '.$block['member']->user?->name,
                    'description' => 'Generated from the custody schedule wizard.',
                    'timezone' => $workspace->timezone,
                    'starts_at' => $cursor->utc(),
                    'ends_at' => $nextCursor->utc(),
                    'is_all_day' => false,
                    'color' => $block['color'],
                    'status' => 'confirmed',
                    'source' => 'custody_wizard',
                    'meta' => [
                        'generated_by' => 'schedule_wizard',
                        'pattern' => $validated['pattern'],
                        'assigned_member_id' => $block['member']->id,
                        'assigned_member_name' => $block['member']->user?->name,
                        'days' => $block['days'],
                    ],
                ]);

                $event->children()->sync($children->pluck('id')->all());

                $cursor = $nextCursor;
                $index++;
            }
        });
    }

    /**
     * @param Collection<int, WorkspaceMember> $members
     * @return list<array{member:WorkspaceMember,days:int,color:string}>
     */
    private function buildBlocks(Collection $members, WorkspaceMember $startingMember, string $pattern): array
    {
        $orderedMembers = $this->orderMembers($members, $startingMember);
        $primary = $orderedMembers[0];
        $secondary = $orderedMembers[1] ?? $orderedMembers[0];
        $palette = [
            $primary->id => '#5B8DEF',
            $secondary->id => '#FF7D7D',
        ];

        return match ($pattern) {
            'alternating-weeks' => [
                ['member' => $primary, 'days' => 7, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 7, 'color' => $palette[$secondary->id]],
            ],
            '2-2-3' => [
                ['member' => $primary, 'days' => 2, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 2, 'color' => $palette[$secondary->id]],
                ['member' => $primary, 'days' => 3, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 2, 'color' => $palette[$secondary->id]],
                ['member' => $primary, 'days' => 2, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 3, 'color' => $palette[$secondary->id]],
            ],
            '3-4-4-3' => [
                ['member' => $primary, 'days' => 3, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 4, 'color' => $palette[$secondary->id]],
                ['member' => $primary, 'days' => 4, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 3, 'color' => $palette[$secondary->id]],
            ],
            '5-2-2-5' => [
                ['member' => $primary, 'days' => 5, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 2, 'color' => $palette[$secondary->id]],
                ['member' => $primary, 'days' => 2, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 5, 'color' => $palette[$secondary->id]],
            ],
            'every-other-weekend' => [
                ['member' => $primary, 'days' => 12, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 2, 'color' => $palette[$secondary->id]],
            ],
            'every-other-weekend-midweek' => [
                ['member' => $primary, 'days' => 6, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 1, 'color' => $palette[$secondary->id]],
                ['member' => $primary, 'days' => 5, 'color' => $palette[$primary->id]],
                ['member' => $secondary, 'days' => 2, 'color' => $palette[$secondary->id]],
            ],
            default => throw new InvalidArgumentException('Custody pattern is invalid.'),
        };
    }

    /**
     * @param Collection<int, WorkspaceMember> $members
     * @return list<WorkspaceMember>
     */
    private function orderMembers(Collection $members, WorkspaceMember $startingMember): array
    {
        $ordered = $members
            ->reject(fn (WorkspaceMember $member): bool => $member->id === $startingMember->id)
            ->prepend($startingMember)
            ->values()
            ->all();

        return $ordered;
    }
}
