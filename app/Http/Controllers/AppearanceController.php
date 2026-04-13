<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppearanceController extends Controller
{
    /**
     * Save the user's appearance preference.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'theme' => ['required', Rule::in(['warm', 'modern', 'minimal'])],
        ]);

        // Save to user preferences
        $preferences = $user->preferences ?? [];
        $preferences['appearance']['theme'] = $validated['theme'];

        $user->forceFill([
            'preferences' => $preferences,
        ])->save();

        return back()->with('status', 'Appearance preference saved!');
    }

    /**
     * Get the current appearance preference.
     */
    public function show(Request $request): array
    {
        /** @var User $user */
        $user = $request->user();

        return [
            'theme' => data_get($user->preferences ?? [], 'appearance.theme', 'warm'),
        ];
    }
}
