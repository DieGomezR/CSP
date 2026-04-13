<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Moments\ToggleMomentReaction;
use App\Http\Requests\Moments\ToggleMomentReactionRequest;
use App\Models\Moment;
use App\Models\Workspace;
use App\Support\Moments\MomentAccess;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class MomentReactionController extends Controller
{
    public function __construct(
        private readonly MomentAccess $momentAccess,
        private readonly ToggleMomentReaction $toggleMomentReaction,
    ) {
    }

    public function store(ToggleMomentReactionRequest $request, Moment $moment): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($moment->workspace_id);
        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->momentAccess->canReact($moment, $viewer)) {
            throw new AuthorizationException('You cannot react to this moment.');
        }

        $this->toggleMomentReaction->handle($moment, $viewer, (string) $request->validated('reaction'));

        return back();
    }
}
