<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BillingPortalController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->hasStripeId()) {
            return response()->json([
                'message' => 'No Stripe customer exists for this account yet.',
            ], 422);
        }

        return response()->json([
            'url' => $user->billingPortalUrl(route('billing')),
        ]);
    }
}
