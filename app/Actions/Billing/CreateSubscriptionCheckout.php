<?php

declare(strict_types=1);

namespace App\Actions\Billing;

use App\Models\User;
use App\Support\Billing\BillingPlanCatalog;
use Illuminate\Validation\ValidationException;
use Laravel\Cashier\Checkout;

final class CreateSubscriptionCheckout
{
    public function __construct(private readonly BillingPlanCatalog $billingPlanCatalog)
    {
    }

    public function handle(User $user, string $plan, string $billingMode): Checkout
    {
        try {
            $planConfig = $this->billingPlanCatalog->getPlan($plan, $billingMode);
        } catch (\InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'plan' => 'The selected billing plan is invalid.',
            ]);
        }

        $priceId = $planConfig['price']['stripe_price'] ?? null;

        if (! is_string($priceId) || $priceId === '') {
            throw ValidationException::withMessages([
                'plan' => 'This Stripe price is not configured yet.',
            ]);
        }

        $subscriptionName = $this->billingPlanCatalog->getSubscriptionName();
        $existingSubscription = $user->subscription($subscriptionName);

        if ($existingSubscription !== null && ! $existingSubscription->ended()) {
            throw ValidationException::withMessages([
                'plan' => 'You already have an active subscription. Manage it from the billing portal.',
            ]);
        }

        return $user->newSubscription($subscriptionName, $priceId)
            ->trialDays($this->billingPlanCatalog->getTrialDays())
            ->withMetadata(array_filter([
                'plan' => $plan,
                'billing_mode' => $billingMode,
                'workspace_id' => $this->resolveWorkspaceId($user),
            ], static fn (mixed $value): bool => $value !== null && $value !== ''))
            ->checkout([
                'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('billing'),
                'client_reference_id' => (string) $user->getKey(),
            ]);
    }

    private function resolveWorkspaceId(User $user): ?string
    {
        $workspaceId = $user->workspaceMemberships()
            ->where('status', 'active')
            ->orderBy('id')
            ->value('workspace_id');

        return $workspaceId !== null ? (string) $workspaceId : null;
    }
}
