<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Actions\Billing\ChangeExistingSubscriptionPlan;
use App\Actions\Billing\CreateSubscriptionCheckout;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Billing\BillingPlanCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class BillingCheckoutController extends Controller
{
    public function __construct(
        private readonly CreateSubscriptionCheckout $createSubscriptionCheckout,
        private readonly ChangeExistingSubscriptionPlan $changeExistingSubscriptionPlan,
        private readonly BillingPlanCatalog $billingPlanCatalog,
    ) {
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'plan' => ['required', 'in:essential,plus,complete'],
            'billing_mode' => ['required', 'in:parent,family'],
        ]);

        $subscription = $user->subscription($this->billingPlanCatalog->getSubscriptionName());

        if ($subscription !== null && ! $subscription->ended()) {
            $result = $this->changeExistingSubscriptionPlan->handle($user, $validated['plan'], $validated['billing_mode']);

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'url' => route('billing'),
                    'message' => $result['message'],
                    'kind' => $result['kind'],
                    'internal' => true,
                ]);
            }

            return to_route('billing')->with('status', $result['message']);
        }

        $checkout = $this->createSubscriptionCheckout
            ->handle($user, $validated['plan'], $validated['billing_mode']);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'url' => $checkout->asStripeCheckoutSession()->url,
                'internal' => false,
            ]);
        }

        return $checkout->redirect();
    }
}
