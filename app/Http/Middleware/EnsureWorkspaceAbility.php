<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\WorkspaceAbility;
use App\Support\Access\WorkspaceEntitlementResolver;
use App\Support\Workspaces\CurrentWorkspaceResolver;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureWorkspaceAbility
{
    public function __construct(
        private readonly CurrentWorkspaceResolver $currentWorkspaceResolver,
        private readonly WorkspaceEntitlementResolver $workspaceEntitlementResolver,
    ) {
    }

    public function handle(Request $request, Closure $next, string $ability): Response
    {
        $user = $request->user();
        $workspace = $this->currentWorkspaceResolver->resolve($request);

        if ($user === null || $workspace === null) {
            throw new AuthorizationException('Workspace context is required.');
        }

        if (! $this->workspaceEntitlementResolver->hasAbility($user, $workspace, WorkspaceAbility::from($ability))) {
            // If the user is an owner, redirect them to billing to upgrade
            if ($this->workspaceEntitlementResolver->hasAbility($user, $workspace, WorkspaceAbility::BillingManage)) {
                return to_route('billing')->with('error', 'You need owner permissions to access this section.');
            }

            // For non-owners, show a friendly message
            throw new AuthorizationException('Only workspace owners can access this section. Please contact the workspace owner.');
        }

        return $next($request);
    }
}
