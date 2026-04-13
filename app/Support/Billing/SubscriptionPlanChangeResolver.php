<?php

declare(strict_types=1);

namespace App\Support\Billing;

final class SubscriptionPlanChangeResolver
{
    public function __construct(
        private readonly BillingPlanCatalog $billingPlanCatalog,
    ) {
    }

    /**
     * @param array{
     *     plan:string,
     *     billing_mode:string,
     *     label:string,
     *     billing_mode_label:string,
     *     price_display:string,
     *     price_amount:int
     * }|null $currentPlan
     * @return array{
     *     kind:'new'|'current'|'upgrade'|'downgrade',
     *     current: array<string, mixed>|null,
     *     target: array<string, mixed>
     * }
     */
    public function resolve(?array $currentPlan, string $targetPlan, string $targetBillingMode): array
    {
        $target = $this->billingPlanCatalog->getPlan($targetPlan, $targetBillingMode);

        if ($currentPlan === null) {
            return [
                'kind' => 'new',
                'current' => null,
                'target' => $target,
            ];
        }

        if (
            $currentPlan['plan'] === $targetPlan
            && $currentPlan['billing_mode'] === $targetBillingMode
        ) {
            return [
                'kind' => 'current',
                'current' => $currentPlan,
                'target' => $target,
            ];
        }

        return [
            'kind' => $this->compareSelections($currentPlan, $target) < 0 ? 'upgrade' : 'downgrade',
            'current' => $currentPlan,
            'target' => $target,
        ];
    }

    /**
     * @param array{
     *     plan:string,
     *     billing_mode:string,
     *     price_amount:int
     * } $currentPlan
     * @param array{
     *     key:string,
     *     billing_mode:string,
     *     price:array{amount:int}
     * } $targetPlan
     */
    private function compareSelections(array $currentPlan, array $targetPlan): int
    {
        $currentScore = [
            (int) $currentPlan['price_amount'],
            $this->planRank((string) $currentPlan['plan']),
            $this->billingModeRank((string) $currentPlan['billing_mode']),
        ];

        $targetScore = [
            (int) $targetPlan['price']['amount'],
            $this->planRank($targetPlan['key']),
            $this->billingModeRank($targetPlan['billing_mode']),
        ];

        return $currentScore <=> $targetScore;
    }

    private function planRank(string $plan): int
    {
        $order = $this->billingPlanCatalog->getPlanOrder();
        $index = array_search($plan, $order, true);

        return is_int($index) ? $index : -1;
    }

    private function billingModeRank(string $billingMode): int
    {
        return match ($billingMode) {
            'family' => 1,
            default => 0,
        };
    }
}
