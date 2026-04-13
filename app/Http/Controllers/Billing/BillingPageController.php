<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Billing\BillingPlanCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BillingPageController extends Controller
{
    public function __construct(private readonly BillingPlanCatalog $billingPlanCatalog)
    {
    }

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $stripeSecretConfigured = filled(config('cashier.secret'));
        $stripePublishableConfigured = filled(config('cashier.key'));
        $stripeWebhookConfigured = filled(config('cashier.webhook.secret'));

        $subscriptionName = $this->billingPlanCatalog->getSubscriptionName();
        $subscription = $user->subscription($subscriptionName);
        $currentPlan = $this->billingPlanCatalog->findByPriceId($subscription?->stripe_price);

        $selectedMode = $request->string('mode')->toString();
        $selectedPlan = $request->string('plan')->toString();

        return Inertia::render('billing/index', [
            'trialDays' => $this->billingPlanCatalog->getTrialDays(),
            'billingModes' => $this->billingPlanCatalog->getBillingModesForUi(),
            'plans' => $this->billingPlanCatalog->getPlansForUi(),
            'selectedMode' => in_array($selectedMode, ['parent', 'family'], true) ? $selectedMode : 'parent',
            'selectedPlan' => in_array($selectedPlan, ['essential', 'plus', 'complete'], true) ? $selectedPlan : 'plus',
            'subscription' => [
                'exists' => $subscription !== null,
                'active' => $subscription !== null && ! $subscription->ended(),
                'onTrial' => $user->onTrial($subscriptionName),
                'trialEndsAt' => $subscription?->trial_ends_at?->toIso8601String(),
                'status' => $subscription?->stripe_status,
                'currentPlan' => $currentPlan,
                'stripeId' => $user->stripe_id,
            ],
            'stripe' => [
                'configured' => $stripeSecretConfigured,
                'publishableConfigured' => $stripePublishableConfigured,
                'webhookConfigured' => $stripeWebhookConfigured,
                'missingConfiguration' => array_values(array_filter([
                    $stripeSecretConfigured ? null : 'STRIPE_SECRET',
                    $stripePublishableConfigured ? null : 'STRIPE_KEY',
                    $stripeWebhookConfigured ? null : 'STRIPE_WEBHOOK_SECRET',
                ])),
                'webhookPath' => '/'.trim((string) config('cashier.path', 'stripe'), '/').'/webhook',
                'portalAvailable' => $stripeSecretConfigured && $user->hasStripeId(),
            ],
        ]);
    }
}
