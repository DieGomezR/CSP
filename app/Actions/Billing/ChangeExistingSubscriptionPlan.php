<?php

declare(strict_types=1);

namespace App\Actions\Billing;

use App\Models\User;
use App\Support\Billing\BillingPlanCatalog;
use App\Support\Billing\SubscriptionPlanChangeResolver;
use Illuminate\Validation\ValidationException;
use Laravel\Cashier\Exceptions\IncompletePayment;
use Laravel\Cashier\Exceptions\SubscriptionUpdateFailure;

final class ChangeExistingSubscriptionPlan
{
    public function __construct(
        private readonly BillingPlanCatalog $billingPlanCatalog,
        private readonly SubscriptionPlanChangeResolver $subscriptionPlanChangeResolver,
    ) {
    }

    /**
     * @return array{kind:'upgrade',message:string}
     */
    public function handle(User $user, string $plan, string $billingMode): array
    {
        $subscriptionName = $this->billingPlanCatalog->getSubscriptionName();
        $subscription = $user->subscription($subscriptionName);

        if ($subscription === null || $subscription->ended()) {
            throw ValidationException::withMessages([
                'plan' => 'No active subscription was found for this account.',
            ]);
        }

        if ($subscription->onGracePeriod()) {
            throw ValidationException::withMessages([
                'plan' => 'This subscription is already scheduled to end. Resume or manage it in Stripe before changing plans.',
            ]);
        }

        $currentPlan = $this->billingPlanCatalog->findByPriceId($subscription->stripe_price);
        $transition = $this->subscriptionPlanChangeResolver->resolve($currentPlan, $plan, $billingMode);

        if ($transition['kind'] === 'current') {
            throw ValidationException::withMessages([
                'plan' => 'You are already on this plan.',
            ]);
        }

        if ($transition['kind'] !== 'upgrade') {
            throw ValidationException::withMessages([
                'plan' => 'Lower-cost or reduced-coverage changes are managed in Stripe so they can take effect at renewal.',
            ]);
        }

        $targetPriceId = $this->billingPlanCatalog->getPriceId($plan, $billingMode);

        try {
            $subscription->swapAndInvoice($targetPriceId);
        } catch (IncompletePayment|SubscriptionUpdateFailure $exception) {
            throw ValidationException::withMessages([
                'plan' => 'Stripe could not apply the upgrade right now. Please retry or manage the subscription in Stripe.',
            ]);
        }

        return [
            'kind' => 'upgrade',
            'message' => sprintf(
                'Subscription upgraded to %s (%s). Stripe will handle any immediate proration.',
                $transition['target']['label'],
                $transition['target']['billing_mode_label'],
            ),
        ];
    }
}
