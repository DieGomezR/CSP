<?php

declare(strict_types=1);

namespace App\Actions\Moments;

use App\Enums\MomentReactionType;
use App\Models\Moment;
use App\Models\MomentReaction;
use App\Models\WorkspaceMember;

final class ToggleMomentReaction
{
    /**
     * @return array{status:'added'|'removed',reaction:MomentReactionType}
     */
    public function handle(Moment $moment, WorkspaceMember $viewer, string $reaction): array
    {
        $reactionType = MomentReactionType::from($reaction);
        $existingReaction = $moment->reactions()
            ->where('workspace_member_id', $viewer->id)
            ->first();

        if ($existingReaction instanceof MomentReaction && $existingReaction->reaction === $reactionType) {
            $existingReaction->delete();
            return [
                'status' => 'removed',
                'reaction' => $reactionType,
            ];
        }

        $moment->reactions()->updateOrCreate(
            [
                'workspace_member_id' => $viewer->id,
            ],
            [
                'reaction' => $reactionType,
            ],
        );

        return [
            'status' => 'added',
            'reaction' => $reactionType,
        ];
    }
}
