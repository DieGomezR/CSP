<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Moments\ToggleMomentReaction;
use App\Http\Requests\Moments\ToggleMomentReactionRequest;
use App\Models\Moment;
use App\Models\Workspace;
use App\Support\Moments\MomentAccess;
use App\Support\Notifications\WorkspaceNotificationDispatcher;
use App\Support\Realtime\WorkspaceRealtimeDispatcher;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class MomentReactionController extends Controller
{
    public function __construct(
        private readonly MomentAccess $momentAccess,
        private readonly ToggleMomentReaction $toggleMomentReaction,
        private readonly WorkspaceNotificationDispatcher $workspaceNotificationDispatcher,
        private readonly WorkspaceRealtimeDispatcher $workspaceRealtimeDispatcher,
    ) {
    }

    public function store(ToggleMomentReactionRequest $request, Moment $moment): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($moment->workspace_id);
        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->momentAccess->canReact($moment, $viewer)) {
            throw new AuthorizationException('You cannot react to this moment.');
        }

        $result = $this->toggleMomentReaction->handle($moment, $viewer, (string) $request->validated('reaction'));

        $moment->loadMissing('createdByMember.user:id,name,email');

        if (
            $result['status'] === 'added'
            && $moment->createdByMember->user_id !== $viewer->user_id
        ) {
            $this->workspaceNotificationDispatcher->dispatch(
                collect([$moment->createdByMember->user]),
                'moment_reacted',
                'New reaction on your moment',
                sprintf('%s reacted %s to your moment.', $viewer->user->name, $result['reaction']->emoji()),
                route('moments.index', ['workspace' => $workspace->id]),
                $workspace,
            );
        }

        if ($moment->visibility->value === 'family') {
            $this->workspaceRealtimeDispatcher->dispatch(
                $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
                'moments',
                'reaction_updated',
                $workspace->id,
                $viewer->user_id,
                ['moment_id' => $moment->id],
            );
        }

        return back();
    }
}
