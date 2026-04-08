<?php

namespace App\Support\Calendar;

use App\Models\CalendarFeed;
use Illuminate\Support\Str;

class BuildCalendarFeedLinks
{
    /**
     * @return array<string, mixed>
     */
    public function handle(CalendarFeed $calendarFeed): array
    {
        $subscriptionUrl = route('calendar-feeds.show', ['token' => $calendarFeed->token]);

        return [
            'id' => $calendarFeed->id,
            'name' => $calendarFeed->name,
            'subscription_url' => $subscriptionUrl,
            'last_accessed_at' => $calendarFeed->last_accessed_at?->toIso8601String(),
            'provider_links' => [
                'apple' => $this->makeAppleUrl($subscriptionUrl),
                'google' => sprintf(
                    'https://calendar.google.com/calendar/u/0/r?cid=%s',
                    rawurlencode($subscriptionUrl)
                ),
                'outlook' => sprintf(
                    'https://outlook.live.com/calendar/0/addfromweb?url=%s&name=%s',
                    rawurlencode($subscriptionUrl),
                    rawurlencode($calendarFeed->name)
                ),
            ],
        ];
    }

    protected function makeAppleUrl(string $subscriptionUrl): string
    {
        if (Str::startsWith($subscriptionUrl, 'https://')) {
            return 'webcal://'.Str::after($subscriptionUrl, 'https://');
        }

        return $subscriptionUrl;
    }
}
