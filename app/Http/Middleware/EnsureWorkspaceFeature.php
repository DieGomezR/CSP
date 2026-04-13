<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\WorkspaceFeature;
use App\Support\Access\WorkspaceEntitlementResolver;
use App\Support\Workspaces\CurrentWorkspaceResolver;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureWorkspaceFeature
{
    public function __construct(
        private readonly CurrentWorkspaceResolver $currentWorkspaceResolver,
        private readonly WorkspaceEntitlementResolver $workspaceEntitlementResolver,
    ) {
    }

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();
        $workspace = $this->currentWorkspaceResolver->resolve($request);

        if ($user === null || $workspace === null) {
            throw new AuthorizationException('Workspace context is required.');
        }

        $workspaceFeature = WorkspaceFeature::from($feature);

        if ($this->workspaceEntitlementResolver->hasFeature($user, $workspace, $workspaceFeature)) {
            return $next($request);
        }

        $requiredPlan = $this->workspaceEntitlementResolver->getUpgradePlanForFeature($workspaceFeature);
        $featureLabel = $this->workspaceEntitlementResolver->getFeatureLabel($workspaceFeature);

        // If the user is an owner, redirect them to billing with upgrade context
        if ($this->workspaceEntitlementResolver->hasAbility($user, $workspace, 'billing.manage')) {
            $billingMode = $request->query('mode', 'family');

            return to_route('billing', [
                'plan' => $requiredPlan ?? 'plus',
                'mode' => $billingMode,
            ])->with('error', sprintf(
                'This feature requires the "%s" plan. Upgrade your subscription to access %s.',
                ucfirst($requiredPlan ?? 'Plus'),
                $featureLabel
            ));
        }

        // For non-owners, show a friendly message directing them to the owner
        throw new AuthorizationException(sprintf(
            'This workspace does not have access to %s. Please contact the workspace owner to upgrade to the %s plan.',
            $featureLabel,
            ucfirst($requiredPlan ?? 'Plus')
        ));
    }
}
