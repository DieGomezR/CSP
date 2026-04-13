<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Actions\Billing\CreateSubscriptionCheckout;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class BillingCheckoutController extends Controller
{
    public function __construct(private readonly CreateSubscriptionCheckout $createSubscriptionCheckout)
    {
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'plan' => ['required', 'in:essential,plus,complete'],
            'billing_mode' => ['required', 'in:parent,family'],
        ]);

        $checkout = $this->createSubscriptionCheckout
            ->handle($user, $validated['plan'], $validated['billing_mode']);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'url' => $checkout->url,
            ]);
        }

        return $checkout->redirect();
    }
}
