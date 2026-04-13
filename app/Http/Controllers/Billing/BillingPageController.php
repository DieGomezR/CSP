<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Billing\BillingPlanCatalog;
use App\Support\Billing\SubscriptionPlanChangeResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BillingPageController extends Controller
{
    public function __construct(
        private readonly BillingPlanCatalog $billingPlanCatalog,
        private readonly SubscriptionPlanChangeResolver $subscriptionPlanChangeResolver,
    ) {
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

        $requestedMode = $request->string('mode')->toString();
        $requestedPlan = $request->string('plan')->toString();

        $selectedMode = in_array($requestedMode, ['parent', 'family'], true)
            ? $requestedMode
            : ($currentPlan['billing_mode'] ?? 'parent');

        $selectedPlan = in_array($requestedPlan, ['essential', 'plus', 'complete'], true)
            ? $requestedPlan
            : ($currentPlan['plan'] ?? 'plus');

        $planActions = [];
        foreach (['parent', 'family'] as $billingMode) {
            foreach (['essential', 'plus', 'complete'] as $planKey) {
                $transition = $this->subscriptionPlanChangeResolver->resolve($currentPlan, $planKey, $billingMode);
                $planActions[$billingMode][$planKey] = [
                    'kind' => $transition['kind'],
                ];
            }
        }

        return Inertia::render('billing/index', [
            'trialDays' => $this->billingPlanCatalog->getTrialDays(),
            'billingModes' => $this->billingPlanCatalog->getBillingModesForUi(),
            'plans' => $this->billingPlanCatalog->getPlansForUi(),
            'selectedMode' => $selectedMode,
            'selectedPlan' => $selectedPlan,
            'planActions' => $planActions,
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
