<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Workspace;
use App\Support\Access\WorkspaceEntitlementResolver;
use App\Models\User;

class AuthRedirect
{
    /**
     * @param array<string, mixed> $parameters
     */
    public static function path(User $user, array $parameters = []): string
    {
        if (! $user->workspaces()->exists()) {
            return route('onboarding.family.create', $parameters, false);
        }

        $workspace = Workspace::query()
            ->where('type', 'family')
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->orderByRaw('CASE WHEN owner_id = ? THEN 0 ELSE 1 END', [$user->id])
            ->orderBy('id')
            ->first();

        if ($workspace !== null) {
            $entitlements = app(WorkspaceEntitlementResolver::class);

            if (
                ! $entitlements->workspaceHasActiveSubscription($workspace)
                && $entitlements->hasAbility($user, $workspace, 'billing.manage')
            ) {
                return route('billing', $parameters, false);
            }
        }

        return route('dashboard', $parameters, false);
    }
}
