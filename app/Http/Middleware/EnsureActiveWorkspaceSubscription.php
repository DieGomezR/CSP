<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Access\WorkspaceEntitlementResolver;
use App\Support\Workspaces\CurrentWorkspaceResolver;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureActiveWorkspaceSubscription
{
    public function __construct(
        private readonly CurrentWorkspaceResolver $currentWorkspaceResolver,
        private readonly WorkspaceEntitlementResolver $workspaceEntitlementResolver,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return $next($request);
        }

        if ($user->hasRole('admin') || $user->can('admin.access')) {
            return $next($request);
        }

        $workspace = $this->currentWorkspaceResolver->resolve($request);

        if ($workspace === null || ! $user->workspaces()->exists()) {
            return $next($request);
        }

        if ($this->workspaceEntitlementResolver->workspaceHasActiveSubscription($workspace)) {
            return $next($request);
        }

        if ($this->workspaceEntitlementResolver->hasAbility($user, $workspace, 'billing.manage')) {
            return to_route('billing', ['workspace' => $workspace->id])
                ->with('error', 'Complete billing setup before using the rest of the workspace.');
        }

        throw new AuthorizationException('Workspace billing setup is still pending. Please ask the workspace owner to complete subscription setup first.');
    }
}
