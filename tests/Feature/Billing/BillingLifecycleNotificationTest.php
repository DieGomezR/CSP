<?php

declare(strict_types=1);

use App\Listeners\Billing\SendBillingLifecycleEmails;
use App\Models\User;
use App\Notifications\Billing\SubscriptionCanceledNotification;
use App\Notifications\Billing\SubscriptionChangedNotification;
use App\Notifications\Billing\SubscriptionConfirmedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Cashier\Events\WebhookHandled;

uses(RefreshDatabase::class);

test('subscription created webhook sends a confirmation notification', function () {
    Notification::fake();

    $user = User::factory()->create([
        'stripe_id' => 'cus_test_created',
    ]);

    app(SendBillingLifecycleEmails::class)->handle(new WebhookHandled([
        'type' => 'customer.subscription.created',
        'data' => [
            'object' => [
                'customer' => 'cus_test_created',
                'trial_end' => now()->addDays(60)->timestamp,
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_1TKeneGVa0O4LKuhqZWStD8q',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ]));

    Notification::assertSentTo($user, SubscriptionConfirmedNotification::class);
});

test('subscription updated webhook sends a plan change notification when price changed', function () {
    Notification::fake();

    $user = User::factory()->create([
        'stripe_id' => 'cus_test_updated',
    ]);

    app(SendBillingLifecycleEmails::class)->handle(new WebhookHandled([
        'type' => 'customer.subscription.updated',
        'data' => [
            'object' => [
                'customer' => 'cus_test_updated',
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_1TKeouGVa0O4LKuhObats41S',
                            ],
                        ],
                    ],
                ],
            ],
            'previous_attributes' => [
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_1TKeneGVa0O4LKuhqZWStD8q',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ]));

    Notification::assertSentTo($user, SubscriptionChangedNotification::class);
});

test('subscription deleted webhook sends a cancellation notification', function () {
    Notification::fake();

    $user = User::factory()->create([
        'stripe_id' => 'cus_test_deleted',
    ]);

    app(SendBillingLifecycleEmails::class)->handle(new WebhookHandled([
        'type' => 'customer.subscription.deleted',
        'created' => now()->timestamp,
        'data' => [
            'object' => [
                'customer' => 'cus_test_deleted',
                'ended_at' => now()->timestamp,
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_1TKeneGVa0O4LKuhqZWStD8q',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ]));

    Notification::assertSentTo($user, SubscriptionCanceledNotification::class);
});
