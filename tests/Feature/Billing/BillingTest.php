<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Stripe\Checkout\Session;
use Stripe\StripeClient;
use Stripe\Subscription as StripeSubscription;

uses(RefreshDatabase::class);

function fakeStripeClient(
    string $checkoutUrl = 'https://checkout.stripe.test/session_123',
    string $portalUrl = 'https://billing.stripe.test/session_456',
    string $currentPriceId = 'price_1TKeneGVa0O4LKuhqZWStD8q',
): object {
    return new class($checkoutUrl, $portalUrl, $currentPriceId)
    {
        public object $checkout;
        public object $billingPortal;
        public object $customers;
        public object $subscriptions;

        public function __construct(string $checkoutUrl, string $portalUrl, string $currentPriceId)
        {
            $this->customers = new class
            {
                public function create(array $options = [], array $requestOptions = []): object
                {
                    return (object) ['id' => 'cus_test_123'];
                }

                public function retrieve(string $id, array $options = []): object
                {
                    return (object) ['id' => $id];
                }
            };

            $this->checkout = (object) [
                'sessions' => new class($checkoutUrl)
                {
                    public function __construct(private readonly string $checkoutUrl)
                    {
                    }

                    public function create(array $payload): object
                    {
                        return Session::constructFrom([
                            'url' => $this->checkoutUrl,
                            'id' => 'cs_test_123',
                        ]);
                    }
                },
            ];

            $this->billingPortal = (object) [
                'sessions' => new class($portalUrl)
                {
                    public function __construct(private readonly string $portalUrl)
                    {
                    }

                    public function create(array $payload): array
                    {
                        return [
                            'url' => $this->portalUrl,
                        ];
                    }
                },
            ];

            $this->subscriptions = new class($currentPriceId)
            {
                public function __construct(private string $currentPriceId)
                {
                }

                public function retrieve(string $id, array $options = []): object
                {
                    return StripeSubscription::constructFrom($this->subscriptionPayload($id, $this->currentPriceId, 'trialing'));
                }

                public function update(string $id, array $payload): object
                {
                    $nextPriceId = $payload['items'][0]['price'] ?? $this->currentPriceId;
                    $this->currentPriceId = $nextPriceId;

                    return StripeSubscription::constructFrom($this->subscriptionPayload($id, $nextPriceId, 'active'));
                }

                private function subscriptionPayload(string $id, string $priceId, string $status): array
                {
                    return [
                        'id' => $id,
                        'object' => 'subscription',
                        'status' => $status,
                        'items' => [
                            'object' => 'list',
                            'data' => [[
                                'id' => 'si_test_123',
                                'object' => 'subscription_item',
                                'quantity' => 1,
                                'price' => [
                                    'id' => $priceId,
                                    'object' => 'price',
                                    'product' => 'prod_test_123',
                                    'recurring' => [
                                        'usage_type' => 'licensed',
                                    ],
                                ],
                            ]],
                        ],
                    ];
                }
            };
        }
    };
}

beforeEach(function () {
    config()->set('cashier.key', 'pk_test_example');
    config()->set('cashier.secret', 'sk_test_example');
});

test('billing page requires authentication', function () {
    $this->get('/billing')->assertRedirect('/login');
});

test('billing page requires verified email', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get('/billing')
        ->assertRedirect(route('verification.notice', absolute: false));
});

test('verified users can view the billing page', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->get('/billing')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/index')
            ->has('billingModes', 2)
            ->has('plans', 3)
            ->where('planActions.parent.plus.kind', 'new')
            ->where('trialDays', 60)
            ->where('stripe.webhookPath', '/stripe/webhook'));
});

test('billing page defaults the selected plan and mode to the current subscription when present', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_existing',
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_1TKeobGVa0O4LKuhllpTSD4i',
        'quantity' => 1,
        'trial_ends_at' => now()->addDays(12),
    ]);

    $this->actingAs($user)
        ->get('/billing')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('selectedPlan', 'plus')
            ->where('selectedMode', 'family')
            ->where('subscription.currentPlan.plan', 'plus')
            ->where('subscription.currentPlan.billing_mode', 'family'));
});

test('checkout rejects an invalid plan', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->from('/billing')
        ->post('/billing/checkout', [
            'plan' => 'invalid',
            'billing_mode' => 'parent',
        ])
        ->assertRedirect('/billing')
        ->assertSessionHasErrors('plan');
});

test('checkout rejects an invalid billing mode', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->from('/billing')
        ->post('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'invalid',
        ])
        ->assertRedirect('/billing')
        ->assertSessionHasErrors('billing_mode');
});

test('checkout rejects missing price configuration', function () {
    config()->set('billing.plans.plus.prices.parent.stripe_price', null);

    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->from('/billing')
        ->post('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'parent',
        ])
        ->assertRedirect('/billing')
        ->assertSessionHasErrors('plan');
});

test('checkout rejects another active subscription', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_1TKeneGVa0O4LKuhqZWStD8q',
        'quantity' => 1,
    ]);

    $this->actingAs($user)
        ->from('/billing')
        ->post('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'parent',
        ])
        ->assertRedirect('/billing')
        ->assertSessionHasErrors('plan');
});

test('checkout rejects selecting the current active plan again', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_123',
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_1TKeneGVa0O4LKuhqZWStD8q',
        'quantity' => 1,
        'trial_ends_at' => now()->addDays(10),
    ]);

    $this->actingAs($user)
        ->from('/billing')
        ->post('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'parent',
        ])
        ->assertRedirect('/billing')
        ->assertSessionHasErrors('plan');
});

test('checkout rejects downgrades and lower-cost coverage changes from the app', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_1TKeouGVa0O4LKuhObats41S',
        'quantity' => 1,
    ]);

    $this->actingAs($user)
        ->from('/billing')
        ->post('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'family',
        ])
        ->assertRedirect('/billing')
        ->assertSessionHasErrors('plan');
});

test('active subscriptions can upgrade immediately from the app', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_existing',
    ]);
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_123',
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_1TKeneGVa0O4LKuhqZWStD8q',
        'quantity' => 1,
        'trial_ends_at' => now()->addDays(20),
    ]);

    app()->bind(StripeClient::class, fn () => fakeStripeClient(
        currentPriceId: 'price_1TKeneGVa0O4LKuhqZWStD8q',
    ));

    $this->actingAs($user)
        ->postJson('/billing/checkout', [
            'plan' => 'complete',
            'billing_mode' => 'family',
        ])
        ->assertOk()
        ->assertJson([
            'url' => route('billing'),
            'kind' => 'upgrade',
            'internal' => true,
        ]);

    expect($user->fresh()->subscription('default')?->stripe_price)->toBe('price_1TKeouGVa0O4LKuhObats41S');
});

test('checkout redirects to stripe checkout when valid', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_existing',
    ]);
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    app()->bind(StripeClient::class, fn () => fakeStripeClient());

    $this->actingAs($user)
        ->post('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'family',
        ])
        ->assertRedirect('https://checkout.stripe.test/session_123');
});

test('checkout endpoint returns a checkout url for json requests', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_existing',
    ]);
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    app()->bind(StripeClient::class, fn () => fakeStripeClient());

    $this->actingAs($user)
        ->postJson('/billing/checkout', [
            'plan' => 'plus',
            'billing_mode' => 'family',
        ])
        ->assertOk()
        ->assertJson([
            'url' => 'https://checkout.stripe.test/session_123',
        ]);
});

test('portal endpoint returns an error when no stripe customer exists', function () {
    $user = User::factory()->create();
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->postJson('/billing/portal')
        ->assertStatus(422)
        ->assertJson([
            'message' => 'No Stripe customer exists for this account yet.',
        ]);
});

test('portal endpoint returns a portal url when stripe customer exists', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_existing',
    ]);
    Workspace::factory()->create([
        'owner_id' => $user->id,
    ]);

    app()->bind(StripeClient::class, fn () => fakeStripeClient());

    $this->actingAs($user)
        ->postJson('/billing/portal')
        ->assertOk()
        ->assertJson([
            'url' => 'https://billing.stripe.test/session_456',
        ]);
});
