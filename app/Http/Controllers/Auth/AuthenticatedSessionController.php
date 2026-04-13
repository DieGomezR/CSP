<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\AcceptWorkspaceInvitation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\AuthRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request, AcceptWorkspaceInvitation $acceptWorkspaceInvitation): Response
    {
        $invitation = $acceptWorkspaceInvitation->resolvePendingInvitation(
            $request->string('invite')->toString(),
        );

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'invitation' => $invitation ? [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'family_name' => Arr::get($invitation->getRelation('workspace')->toArray(), 'name'),
            ] : null,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request, AcceptWorkspaceInvitation $acceptWorkspaceInvitation): RedirectResponse
    {
        $invitation = $acceptWorkspaceInvitation->resolvePendingInvitation(
            $request->string('invite_token')->toString(),
        );

        if (
            $invitation !== null
            && ! hash_equals(strtolower($invitation->email), strtolower($request->string('email')->toString()))
        ) {
            throw ValidationException::withMessages([
                'email' => 'Use the invited email address to accept this family invitation.',
            ]);
        }

        $request->authenticate();

        $request->session()->regenerate();

        if ($invitation !== null) {
            $acceptedInvitation = $acceptWorkspaceInvitation->handle(
                $request->user(),
                $invitation,
                (bool) $request->user()?->sms_opt_in,
            );

            return to_route('dashboard', ['workspace' => $acceptedInvitation->workspace_id])
                ->with('status', "You've joined ".(Arr::get($acceptedInvitation->getRelation('workspace')->toArray(), 'name', 'the family workspace')).'.');
        }

        return redirect()->intended(AuthRedirect::path($request->user()));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
