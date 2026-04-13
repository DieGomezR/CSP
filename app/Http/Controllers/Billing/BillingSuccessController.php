<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class BillingSuccessController extends Controller
{
    public function show(Request $request): RedirectResponse
    {
        $sessionId = $request->string('session_id')->toString();

        return to_route('billing')->with(
            'status',
            $sessionId !== ''
                ? "Checkout completed. Stripe session {$sessionId} is being synchronized through the webhook."
                : 'Checkout completed. Stripe is synchronizing your subscription through the webhook.'
        );
    }
}
