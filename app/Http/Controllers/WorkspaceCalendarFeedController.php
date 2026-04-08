<?php

namespace App\Http\Controllers;

use App\Models\CalendarFeed;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkspaceCalendarFeedController extends Controller
{
    public function store(Request $request, Workspace $workspace): RedirectResponse
    {
        abort_unless(
            $request->user() !== null && $workspace->users()->whereKey($request->user()->id)->exists(),
            403
        );

        $workspace->calendarFeeds()
            ->whereNull('revoked_at')
            ->firstOr(fn () => $workspace->calendarFeeds()->create([
                'name' => 'Full Family Calendar',
                'token' => Str::random(64),
            ]));

        return back()->with('status', 'Family sync link created.');
    }

    public function destroy(Request $request, Workspace $workspace, CalendarFeed $calendarFeed): RedirectResponse
    {
        abort_unless(
            $request->user() !== null
            && $workspace->users()->whereKey($request->user()->id)->exists()
            && $calendarFeed->workspace_id === $workspace->id,
            403
        );

        $calendarFeed->forceFill([
            'revoked_at' => now(),
        ])->save();

        return back()->with('status', 'Family sync link removed.');
    }
}
