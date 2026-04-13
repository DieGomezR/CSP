<?php

declare(strict_types=1);

return [
    'trial_days' => 60,

    'subscription_name' => 'default',

    'plan_order' => [
        'essential',
        'plus',
        'complete',
    ],

    'feature_labels' => [
        'family_calendar' => 'Shared family calendar',
        'school_calendar_sync' => 'School calendar sync',
        'webcal_sync' => 'Calendar export and sync',
        'email_reminders' => 'Email reminders',
        'caregiver_guest_access' => 'Caregiver guest access',
        'ai_calendar_import' => 'AI calendar import',
        'activity_tracking' => 'Activity and sports tracking',
        'sms_reminders' => 'SMS reminders',
        'expense_tracking' => 'Expense tracking',
        'secure_messaging' => 'Secure family messaging',
        'custody_schedule_templates' => 'Custody schedule templates',
        'court_ready_exports' => 'Court-ready exports',
        'ai_tone_analysis' => 'AI tone analysis',
        'change_request_workflow' => 'Change request workflow',
        'audit_trail' => 'Tamper-proof audit trail',
    ],

    'billing_modes' => [
        'parent' => [
            'label' => 'Per Parent',
            'coverage' => 'owner_only',
        ],
        'family' => [
            'label' => 'Full Family',
            'coverage' => 'all_members',
        ],
    ],

    'plans' => [
        'essential' => [
            'label' => 'Essential',
            'subtitle' => 'For everyday families',
            'featured' => false,
            'badge' => null,
            'features' => [
                'Shared family calendar',
                'School calendar sync',
                'Webcal feeds for any app',
                'Email reminders',
                'Caregiver guest access',
            ],
            'entitlements' => [
                'family_calendar',
                'school_calendar_sync',
                'webcal_sync',
                'email_reminders',
                'caregiver_guest_access',
            ],
            'prices' => [
                'parent' => [
                    'amount' => 599,
                    'display' => '$5.99',
                    'stripe_price' => env('STRIPE_PRICE_PARENT_ESSENTIAL', 'price_1TKej9GVa0O4LKuhUlBciGoq'),
                ],
                'family' => [
                    'amount' => 1199,
                    'display' => '$11.99',
                    'stripe_price' => env('STRIPE_PRICE_FAMILY_ESSENTIAL', 'price_1TKeo9GVa0O4LKuhWTs0g3FQ'),
                ],
            ],
        ],
        'plus' => [
            'label' => 'Plus',
            'subtitle' => 'For active families',
            'featured' => true,
            'badge' => 'Most Popular',
            'features' => [
                'Everything in Essential',
                'AI calendar import (photo)',
                'Activity and sports tracking',
                'SMS reminders',
                'Expense tracking',
                'Secure family messaging',
            ],
            'entitlements' => [
                'family_calendar',
                'school_calendar_sync',
                'webcal_sync',
                'email_reminders',
                'caregiver_guest_access',
                'ai_calendar_import',
                'activity_tracking',
                'sms_reminders',
                'expense_tracking',
                'secure_messaging',
            ],
            'prices' => [
                'parent' => [
                    'amount' => 899,
                    'display' => '$8.99',
                    'stripe_price' => env('STRIPE_PRICE_PARENT_PLUS', 'price_1TKeneGVa0O4LKuhqZWStD8q'),
                ],
                'family' => [
                    'amount' => 1799,
                    'display' => '$17.99',
                    'stripe_price' => env('STRIPE_PRICE_FAMILY_PLUS', 'price_1TKeobGVa0O4LKuhllpTSD4i'),
                ],
            ],
        ],
        'complete' => [
            'label' => 'Complete',
            'subtitle' => 'For complex situations',
            'featured' => false,
            'badge' => null,
            'features' => [
                'Everything in Plus',
                'Custody schedule templates',
                'Court-ready exports',
                'AI tone analysis',
                'Change request workflow',
                'Tamper-proof audit trail',
            ],
            'entitlements' => [
                'family_calendar',
                'school_calendar_sync',
                'webcal_sync',
                'email_reminders',
                'caregiver_guest_access',
                'ai_calendar_import',
                'activity_tracking',
                'sms_reminders',
                'expense_tracking',
                'secure_messaging',
                'custody_schedule_templates',
                'court_ready_exports',
                'ai_tone_analysis',
                'change_request_workflow',
                'audit_trail',
            ],
            'prices' => [
                'parent' => [
                    'amount' => 1199,
                    'display' => '$11.99',
                    'stripe_price' => env('STRIPE_PRICE_PARENT_COMPLETE', 'price_1TKenvGVa0O4LKuh4RyLRiZA'),
                ],
                'family' => [
                    'amount' => 2399,
                    'display' => '$23.99',
                    'stripe_price' => env('STRIPE_PRICE_FAMILY_COMPLETE', 'price_1TKeouGVa0O4LKuhObats41S'),
                ],
            ],
        ],
    ],
];
