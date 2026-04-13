<?php

declare(strict_types=1);

namespace App\Actions\Moments;

use App\Enums\MomentReactionType;
use App\Models\Moment;
use App\Models\MomentReaction;
use App\Models\WorkspaceMember;

final class ToggleMomentReaction
{
    public function handle(Moment $moment, WorkspaceMember $viewer, string $reaction): void
    {
        $reactionType = MomentReactionType::from($reaction);
        $existingReaction = $moment->reactions()
            ->where('workspace_member_id', $viewer->id)
            ->first();

        if ($existingReaction instanceof MomentReaction && $existingReaction->reaction === $reactionType) {
            $existingReaction->delete();
            return;
        }

        $moment->reactions()->updateOrCreate(
            [
                'workspace_member_id' => $viewer->id,
            ],
            [
                'reaction' => $reactionType,
            ],
        );
    }
}
