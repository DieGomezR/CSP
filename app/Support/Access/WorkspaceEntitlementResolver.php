<?php

declare(strict_types=1);

namespace App\Support\Access;

use App\DTO\Access\WorkspaceAccessSnapshot;
use App\Enums\WorkspaceAbility;
use App\Enums\WorkspaceFeature;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Billing\BillingPlanCatalog;
use Illuminate\Auth\Access\AuthorizationException;
use Laravel\Cashier\Subscription;

final class WorkspaceEntitlementResolver
{
    public function __construct(
        private readonly BillingPlanCatalog $billingPlanCatalog,
    ) {
    }

    public function snapshot(User $user, Workspace $workspace): WorkspaceAccessSnapshot
    {
        $membership = $this->resolveMembership($workspace, $user);
        $subscriptionState = $this->resolveSubscriptionState($workspace);

        $features = [];
        foreach (WorkspaceFeature::cases() as $feature) {
            $features[$feature->value] = $this->allowsFeature($user, $membership, $subscriptionState, $feature);
        }

        $abilities = [];
        foreach (WorkspaceAbility::cases() as $ability) {
            $abilities[$ability->value] = $this->allowsAbility($user, $membership, $ability);
        }

        return new WorkspaceAccessSnapshot(
            workspaceId: $workspace->id,
            membershipRole: $membership->role,
            isOwner: $membership->role === 'owner',
            features: $features,
            abilities: $abilities,
            subscription: [
                'active' => $subscriptionState['active'],
                'on_trial' => $subscriptionState['on_trial'],
                'status' => $subscriptionState['status'],
                'plan' => $subscriptionState['plan'],
                'plan_label' => $subscriptionState['plan_label'],
                'billing_mode' => $subscriptionState['billing_mode'],
                'billing_mode_label' => $subscriptionState['billing_mode_label'],
                'covered' => $this->isCoveredBySubscription($membership, $subscriptionState['billing_mode']),
            ],
        );
    }

    public function hasFeature(User $user, Workspace $workspace, WorkspaceFeature|string $feature): bool
    {
        $feature = $feature instanceof WorkspaceFeature ? $feature : WorkspaceFeature::from($feature);
        $membership = $this->resolveMembership($workspace, $user);

        return $this->allowsFeature($user, $membership, $this->resolveSubscriptionState($workspace), $feature);
    }

    public function hasAbility(User $user, Workspace $workspace, WorkspaceAbility|string $ability): bool
    {
        $ability = $ability instanceof WorkspaceAbility ? $ability : WorkspaceAbility::from($ability);
        $membership = $this->resolveMembership($workspace, $user);

        return $this->allowsAbility($user, $membership, $ability);
    }

    public function getUpgradePlanForFeature(WorkspaceFeature|string $feature): ?string
    {
        $feature = $feature instanceof WorkspaceFeature ? $feature : WorkspaceFeature::from($feature);

        return $this->billingPlanCatalog->getMinimumPlanForFeature($feature->value);
    }

    public function getFeatureLabel(WorkspaceFeature|string $feature): string
    {
        $feature = $feature instanceof WorkspaceFeature ? $feature : WorkspaceFeature::from($feature);

        return $this->billingPlanCatalog->getFeatureLabel($feature->value);
    }

    public function resolveMembership(Workspace $workspace, User $user): WorkspaceMember
    {
        $membership = $workspace->members()
            ->where('user_id', $user->id)
            ->first();

        if (! $membership instanceof WorkspaceMember) {
            throw new AuthorizationException('You are not part of this workspace.');
        }

        return $membership;
    }

    /**
     * @return array{
     *     active: bool,
     *     on_trial: bool,
     *     status: ?string,
     *     plan: ?string,
     *     plan_label: ?string,
     *     billing_mode: ?string,
     *     billing_mode_label: ?string,
     *     subscription: ?Subscription
     * }
     */
    private function resolveSubscriptionState(Workspace $workspace): array
    {
        $owner = $workspace->owner()->first();

        if (! $owner instanceof User) {
            return [
                'active' => false,
                'on_trial' => false,
                'status' => null,
                'plan' => null,
                'plan_label' => null,
                'billing_mode' => null,
                'billing_mode_label' => null,
                'subscription' => null,
            ];
        }

        $subscription = $owner->subscription($this->billingPlanCatalog->getSubscriptionName());
        $active = $subscription instanceof Subscription && ! $subscription->ended();
        $plan = $this->billingPlanCatalog->findByPriceId($subscription?->stripe_price);

        return [
            'active' => $active,
            'on_trial' => $subscription?->onTrial() ?? false,
            'status' => $subscription?->stripe_status,
            'plan' => $plan['plan'] ?? null,
            'plan_label' => $plan['label'] ?? null,
            'billing_mode' => $plan['billing_mode'] ?? null,
            'billing_mode_label' => $plan['billing_mode_label'] ?? null,
            'subscription' => $subscription,
        ];
    }

    /**
     * @param array{
     *     active: bool,
     *     on_trial: bool,
     *     status: ?string,
     *     plan: ?string,
     *     plan_label: ?string,
     *     billing_mode: ?string,
     *     billing_mode_label: ?string,
     *     subscription: ?Subscription
     * } $subscriptionState
     */
    private function allowsFeature(User $user, WorkspaceMember $membership, array $subscriptionState, WorkspaceFeature $feature): bool
    {
        if ($this->hasAdminOverride($user)) {
            return true;
        }

        if (! $subscriptionState['active'] || ! is_string($subscriptionState['plan'])) {
            return false;
        }

        if (! $this->isCoveredBySubscription($membership, $subscriptionState['billing_mode'])) {
            return false;
        }

        return $this->billingPlanCatalog->planHasEntitlement($subscriptionState['plan'], $feature->value);
    }

    private function allowsAbility(User $user, WorkspaceMember $membership, WorkspaceAbility $ability): bool
    {
        if ($this->hasAdminOverride($user)) {
            return true;
        }

        $abilities = (array) config('workspace-access.abilities', []);
        $allowedRoles = $abilities[$ability->value] ?? [];

        return in_array($membership->role, $allowedRoles, true);
    }

    private function hasAdminOverride(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        foreach ((array) config('workspace-access.admin_override_permissions', []) as $permission) {
            if ($user->can($permission)) {
                return true;
            }
        }

        return false;
    }

    private function isCoveredBySubscription(WorkspaceMember $membership, ?string $billingMode): bool
    {
        return match ($billingMode) {
            'family' => true,
            'parent' => $membership->role === 'owner',
            default => false,
        };
    }
}
