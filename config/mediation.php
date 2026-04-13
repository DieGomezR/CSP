<?php

declare(strict_types=1);

return [
    'history_window_messages' => (int) env('MEDIATION_HISTORY_WINDOW_MESSAGES', 12),
    'report_lookback_months' => (int) env('MEDIATION_REPORT_LOOKBACK_MONTHS', 6),
    'ai' => [
        'queue_replies' => (bool) env('MEDIATION_AI_QUEUE_REPLIES', false),
        'messages_per_hour' => (int) env('MEDIATION_AI_MESSAGES_PER_HOUR', 20),
        'help_requests_per_hour' => (int) env('MEDIATION_AI_HELP_REQUESTS_PER_HOUR', 8),
        'daily_token_limit' => (int) env('MEDIATION_AI_DAILY_TOKEN_LIMIT', 40000),
    ],
];
