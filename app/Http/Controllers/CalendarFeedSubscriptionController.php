<?php

namespace App\Http\Controllers;

use App\Models\CalendarFeed;
use App\Support\Calendar\BuildCalendarFeedIcs;
use Illuminate\Http\Response;

class CalendarFeedSubscriptionController extends Controller
{
    public function show(string $token, BuildCalendarFeedIcs $buildCalendarFeedIcs): Response
    {
        $calendarFeed = CalendarFeed::query()
            ->where('token', $token)
            ->whereNull('revoked_at')
            ->with('workspace.calendarEvents.children')
            ->firstOrFail();

        if ($calendarFeed->last_accessed_at === null || $calendarFeed->last_accessed_at->lt(now()->subMinutes(10))) {
            $calendarFeed->forceFill([
                'last_accessed_at' => now(),
            ])->save();
        }

        return response($buildCalendarFeedIcs->handle($calendarFeed), 200, [
            'Content-Type' => 'text/calendar; charset=UTF-8',
            'Content-Disposition' => 'inline; filename="kidschedule-family.ics"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }
}
