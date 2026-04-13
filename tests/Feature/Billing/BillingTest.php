<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Stripe\Checkout\Session;
use Stripe\StripeClient;

uses(RefreshDatabase::class);

function fakeStripeClient(
    string $checkoutUrl = 'https://checkout.stripe.test/session_123',
    string $portalUrl = 'https://billing.stripe.test/session_456',
): object {
    return new class($checkoutUrl, $portalUrl)
    {
        public object $checkout;
        public object $billingPortal;
        public object $customers;

        public function __construct(string $checkoutUrl, string $portalUrl)
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
            ->where('trialDays', 60)
            ->where('stripe.webhookPath', '/stripe/webhook'));
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
