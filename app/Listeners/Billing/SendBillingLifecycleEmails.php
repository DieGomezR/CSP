<?php

declare(strict_types=1);

namespace App\Listeners\Billing;

use App\Models\User;
use App\Notifications\Billing\SubscriptionCanceledNotification;
use App\Notifications\Billing\SubscriptionChangedNotification;
use App\Notifications\Billing\SubscriptionConfirmedNotification;
use App\Support\Billing\BillingPlanCatalog;
use App\Support\Notifications\WorkspaceNotificationDispatcher;
use App\Support\Realtime\WorkspaceRealtimeDispatcher;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Arr;
use App\Models\Workspace;
use Laravel\Cashier\Events\WebhookHandled;

final class SendBillingLifecycleEmails implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private readonly BillingPlanCatalog $billingPlanCatalog,
        private readonly WorkspaceNotificationDispatcher $workspaceNotificationDispatcher,
        private readonly WorkspaceRealtimeDispatcher $workspaceRealtimeDispatcher,
    )
    {
    }

    public function handle(WebhookHandled $event): void
    {
        $type = (string) Arr::get($event->payload, 'type', '');

        match ($type) {
            'customer.subscription.created' => $this->handleCreated($event->payload),
            'customer.subscription.updated' => $this->handleUpdated($event->payload),
            'customer.subscription.deleted' => $this->handleDeleted($event->payload),
            default => null,
        };
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function handleCreated(array $payload): void
    {
        $user = $this->resolveUser($payload);

        if (! $user) {
            return;
        }

        $currentPlan = $this->resolvePlanDetails(
            Arr::get($payload, 'data.object.items.data.0.price.id')
        );

        if ($currentPlan === null) {
            return;
        }

        $trialEndsAt = $this->resolveTimestamp(Arr::get($payload, 'data.object.trial_end'));

        $user->notify(new SubscriptionConfirmedNotification(
            plan: $currentPlan,
            trialEndsAt: $trialEndsAt,
        ));

        $this->workspaceNotificationDispatcher->dispatch(
            collect([$user]),
            'billing_confirmed',
            'Subscription confirmed',
            sprintf('Your %s plan is active.', $currentPlan['label']),
            route('billing'),
        );

        foreach ($this->resolveOwnedFamilyWorkspaces($user) as $workspace) {
            $this->workspaceNotificationDispatcher->dispatch(
                $this->workspaceNotificationDispatcher->workspaceUsers($workspace),
                'billing_confirmed',
                'Family subscription confirmed',
                sprintf('The workspace is now on %s.', $currentPlan['label']),
                route('billing'),
                $workspace,
            );

            $this->workspaceRealtimeDispatcher->dispatch(
                $this->workspaceRealtimeDispatcher->workspaceUsers($workspace),
                'billing',
                'subscription_confirmed',
                $workspace->id,
                $user->id,
            );
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function handleUpdated(array $payload): void
    {
        $user = $this->resolveUser($payload);

        if (! $user) {
            return;
        }

        $currentPlan = $this->resolvePlanDetails(
            Arr::get($payload, 'data.object.items.data.0.price.id')
        );

        $previousPlan = $this->resolvePlanDetails(
            Arr::get($payload, 'data.previous_attributes.items.data.0.price.id')
        );

        if ($currentPlan === null || $previousPlan === null) {
            return;
        }

        if (
            $currentPlan['plan'] === $previousPlan['plan']
            && $currentPlan['billing_mode'] === $previousPlan['billing_mode']
        ) {
            return;
        }

        $user->notify(new SubscriptionChangedNotification(
            previousPlan: $previousPlan,
            currentPlan: $currentPlan,
        ));

        $this->workspaceNotificationDispatcher->dispatch(
            collect([$user]),
            'billing_changed',
            'Subscription updated',
            sprintf('Your plan changed from %s to %s.', $previousPlan['label'], $currentPlan['label']),
            route('billing'),
        );

        foreach ($this->resolveOwnedFamilyWorkspaces($user) as $workspace) {
            $this->workspaceNotificationDispatcher->dispatch(
                $this->workspaceNotificationDispatcher->workspaceUsers($workspace),
                'billing_changed',
                'Family subscription updated',
                sprintf('The workspace plan changed from %s to %s.', $previousPlan['label'], $currentPlan['label']),
                route('billing'),
                $workspace,
            );

            $this->workspaceRealtimeDispatcher->dispatch(
                $this->workspaceRealtimeDispatcher->workspaceUsers($workspace),
                'billing',
                'subscription_changed',
                $workspace->id,
                $user->id,
            );
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function handleDeleted(array $payload): void
    {
        $user = $this->resolveUser($payload);

        if (! $user) {
            return;
        }

        $currentPlan = $this->resolvePlanDetails(
            Arr::get($payload, 'data.object.items.data.0.price.id')
        );

        if ($currentPlan === null) {
            return;
        }

        $endedAt = $this->resolveTimestamp(Arr::get($payload, 'data.object.ended_at'))
            ?? $this->resolveTimestamp(Arr::get($payload, 'created'));

        $user->notify(new SubscriptionCanceledNotification(
            plan: $currentPlan,
            endedAt: $endedAt,
        ));

        $this->workspaceNotificationDispatcher->dispatch(
            collect([$user]),
            'billing_canceled',
            'Subscription canceled',
            sprintf('Your %s plan was canceled.', $currentPlan['label']),
            route('billing'),
        );

        foreach ($this->resolveOwnedFamilyWorkspaces($user) as $workspace) {
            $this->workspaceNotificationDispatcher->dispatch(
                $this->workspaceNotificationDispatcher->workspaceUsers($workspace),
                'billing_canceled',
                'Family subscription canceled',
                sprintf('The workspace %s plan was canceled.', $currentPlan['label']),
                route('billing'),
                $workspace,
            );

            $this->workspaceRealtimeDispatcher->dispatch(
                $this->workspaceRealtimeDispatcher->workspaceUsers($workspace),
                'billing',
                'subscription_canceled',
                $workspace->id,
                $user->id,
            );
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function resolveUser(array $payload): ?User
    {
        $customerId = Arr::get($payload, 'data.object.customer');

        if (! is_string($customerId) || $customerId === '') {
            return null;
        }

        return User::query()
            ->where('stripe_id', $customerId)
            ->first();
    }

    /**
     * @return array{
     *     plan:string,
     *     billing_mode:string,
     *     label:string,
     *     billing_mode_label:string,
     *     price_display:string
     * }|null
     */
    private function resolvePlanDetails(mixed $priceId): ?array
    {
        return is_string($priceId) ? $this->billingPlanCatalog->findByPriceId($priceId) : null;
    }

    private function resolveTimestamp(mixed $timestamp): ?CarbonImmutable
    {
        if (! is_int($timestamp) && ! ctype_digit((string) $timestamp)) {
            return null;
        }

        return CarbonImmutable::createFromTimestamp((int) $timestamp);
    }

    /**
     * @return \Illuminate\Support\Collection<int, Workspace>
     */
    private function resolveOwnedFamilyWorkspaces(User $user): \Illuminate\Support\Collection
    {
        /** @var \Illuminate\Support\Collection<int, Workspace> $workspaces */
        $workspaces = $user->ownedWorkspaces()
            ->where('type', 'family')
            ->with('members.user:id,name,email')
            ->get();

        return $workspaces;
    }
}
