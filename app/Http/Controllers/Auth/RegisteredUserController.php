<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\RegisterFamilyAccount;
use App\Http\Controllers\Controller;
use App\Support\AuthRedirect;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        $invitation = $this->findInvitation(request('invite'));
        $familyName = $invitation?->workspace()->value('name');

        return Inertia::render('auth/register', [
            'timezones' => collect([
                'America/New_York',
                'America/Chicago',
                'America/Denver',
                'America/Los_Angeles',
                'America/Bogota',
                'UTC',
            ])->map(fn (string $timezone) => [
                'value' => $timezone,
                'label' => str_replace('_', ' ', str_replace('America/', '', $timezone)),
            ])->values(),
            'invitation' => $invitation ? [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'family_name' => $familyName,
            ] : null,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request, RegisterFamilyAccount $registerFamilyAccount): RedirectResponse
    {
        $invitation = $this->findInvitation($request->string('invite_token')->toString());

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone_number' => 'required|string|max:40',
            'sms_opt_in' => 'nullable|boolean',
            'invite_token' => 'nullable|string',
        ];

        if ($invitation) {
            $rules['family_name'] = 'nullable|string|max:120';
            $rules['timezone'] = 'nullable|timezone';
            $rules['coparent_email'] = 'nullable|string|lowercase|email|max:255|different:email';
        } else {
            $rules['family_name'] = 'required|string|max:120';
            $rules['timezone'] = 'required|timezone';
            $rules['coparent_email'] = 'nullable|string|lowercase|email|max:255|different:email';
        }

        $validated = $request->validate($rules);

        if ($invitation && strtolower($validated['email']) !== strtolower($invitation->email)) {
            throw ValidationException::withMessages([
                'email' => 'Use the invited email address to accept this family invitation.',
            ]);
        }

        $user = $registerFamilyAccount->handle([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone_number' => $validated['phone_number'],
            'sms_opt_in' => (bool) ($validated['sms_opt_in'] ?? false),
            'family_name' => $validated['family_name'] ?? null,
            'timezone' => $validated['timezone'] ?? null,
            'coparent_email' => $validated['coparent_email'] ?? null,
            'invite_token' => $validated['invite_token'] ?? null,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('verification.notice'));
    }

    private function findInvitation(?string $token): ?WorkspaceInvitation
    {
        if (! $token) {
            return null;
        }

        return WorkspaceInvitation::query()
            ->where('token', $token)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->with('workspace')
            ->first();
    }
}
