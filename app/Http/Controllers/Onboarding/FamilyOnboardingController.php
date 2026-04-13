<?php

namespace App\Http\Controllers\Onboarding;

use App\Actions\Onboarding\CreateInitialFamilyWorkspace;
use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\StoreFamilyOnboardingRequest;
use App\Support\AuthRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FamilyOnboardingController extends Controller
{
    /**
     * Show the family onboarding flow for first-time users.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->workspaces()->exists()) {
            return redirect()->to(AuthRedirect::path($request->user()));
        }

        return Inertia::render('onboarding/family', [
            'timezones' => $this->timezones(),
        ]);
    }

    /**
     * Create the user's first family workspace.
     */
    public function store(StoreFamilyOnboardingRequest $request, CreateInitialFamilyWorkspace $createWorkspace): RedirectResponse
    {
        if ($request->user()->workspaces()->exists()) {
            return redirect()->to(AuthRedirect::path($request->user()));
        }

        $createWorkspace->handle($request->user(), $request->validated());

        return redirect()->to(AuthRedirect::path($request->user()))->with('status', 'family-workspace-created');
    }

    /**
     * @return array<int, array{label:string, value:string}>
     */
    private function timezones(): array
    {
        return [
            ['label' => 'Eastern Time (ET)', 'value' => 'America/New_York'],
            ['label' => 'Central Time (CT)', 'value' => 'America/Chicago'],
            ['label' => 'Mountain Time (MT)', 'value' => 'America/Denver'],
            ['label' => 'Pacific Time (PT)', 'value' => 'America/Los_Angeles'],
            ['label' => 'Alaska Time (AKT)', 'value' => 'America/Anchorage'],
            ['label' => 'Hawaii Time (HST)', 'value' => 'Pacific/Honolulu'],
            ['label' => 'Bogota Time (COT)', 'value' => 'America/Bogota'],
            ['label' => 'UK Time (GMT/BST)', 'value' => 'Europe/London'],
            ['label' => 'Central Europe (CET)', 'value' => 'Europe/Paris'],
            ['label' => 'Australia Eastern (AEST)', 'value' => 'Australia/Sydney'],
        ];
    }
}
