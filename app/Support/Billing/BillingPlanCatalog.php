<?php

declare(strict_types=1);

namespace App\Support\Billing;

use Illuminate\Support\Arr;
use InvalidArgumentException;

final class BillingPlanCatalog
{
    public function getTrialDays(): int
    {
        return (int) config('billing.trial_days', 60);
    }

    public function getSubscriptionName(): string
    {
        return (string) config('billing.subscription_name', 'default');
    }

    /**
     * @return list<string>
     */
    public function getPlanOrder(): array
    {
        /** @var list<string> $order */
        $order = config('billing.plan_order', ['essential', 'plus', 'complete']);

        return $order;
    }

    /**
     * @return array<string, array{label:string}>
     */
    public function getBillingModes(): array
    {
        /** @var array<string, array{label:string, coverage?:string}> $billingModes */
        $billingModes = config('billing.billing_modes', []);

        return $billingModes;
    }

    /**
     * @return array{label:string, coverage?:string}
     */
    public function getBillingMode(string $billingMode): array
    {
        $billingModeConfig = $this->getBillingModes()[$billingMode] ?? null;

        if (! is_array($billingModeConfig)) {
            throw new InvalidArgumentException('Unknown billing mode.');
        }

        return $billingModeConfig;
    }

    /**
     * @return array<int, array{key:string,label:string}>
     */
    public function getBillingModesForUi(): array
    {
        return collect($this->getBillingModes())
            ->map(
                static fn (array $mode, string $key): array => [
                    'key' => $key,
                    'label' => $mode['label'],
                ],
            )
            ->values()
            ->all();
    }

    /**
     * @return array<string, array{
     *     label:string,
     *     subtitle:string,
     *     featured:bool,
     *     badge:?string,
     *     features:array<int, string>,
     *     entitlements:array<int, string>,
     *     prices:array<string, array{amount:int,display:string,stripe_price:?string}>
     * }>
     */
    public function getPlans(): array
    {
        /** @var array<string, array{
         *     label:string,
         *     subtitle:string,
         *     featured:bool,
         *     badge:?string,
         *     features:array<int, string>,
         *     entitlements:array<int, string>,
         *     prices:array<string, array{amount:int,display:string,stripe_price:?string}>
         * }> $plans
         */
        $plans = config('billing.plans', []);

        return $plans;
    }

    /**
     * @return array<int, array{
     *     key:string,
     *     label:string,
     *     subtitle:string,
     *     featured:bool,
     *     badge:?string,
     *     features:array<int, string>,
     *     prices:array<string, array{display:string,configured:bool}>
     * }>
     */
    public function getPlansForUi(): array
    {
        return collect($this->getPlans())
            ->map(function (array $plan, string $key): array {
                $prices = [];

                foreach ($this->getBillingModes() as $billingMode => $billingModeConfig) {
                    $price = $plan['prices'][$billingMode] ?? null;

                    if (! is_array($price)) {
                        continue;
                    }

                    $prices[$billingMode] = [
                        'display' => (string) $price['display'],
                        'configured' => filled($price['stripe_price'] ?? null),
                    ];
                }

                return [
                    'key' => $key,
                    'label' => $plan['label'],
                    'subtitle' => $plan['subtitle'],
                    'featured' => (bool) ($plan['featured'] ?? false),
                    'badge' => $plan['badge'] ?? null,
                    'features' => $plan['features'],
                    'prices' => $prices,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     key:string,
     *     billing_mode:string,
     *     billing_mode_label:string,
     *     label:string,
     *     subtitle:string,
     *     featured:bool,
     *     badge:?string,
     *     features:array<int, string>,
     *     entitlements:array<int, string>,
     *     price:array{amount:int,display:string,stripe_price:?string}
     * }
     */
    public function getPlan(string $plan, string $billingMode): array
    {
        $planConfig = $this->getPlans()[$plan] ?? null;
        $billingModeConfig = $this->getBillingModes()[$billingMode] ?? null;

        if (! is_array($planConfig) || ! is_array($billingModeConfig)) {
            throw new InvalidArgumentException('Unknown billing plan selection.');
        }

        $priceConfig = Arr::get($planConfig, "prices.{$billingMode}");

        if (! is_array($priceConfig)) {
            throw new InvalidArgumentException('Unknown billing price selection.');
        }

        return [
            'key' => $plan,
            'billing_mode' => $billingMode,
            'billing_mode_label' => $billingModeConfig['label'],
            'label' => $planConfig['label'],
            'subtitle' => $planConfig['subtitle'],
            'featured' => (bool) ($planConfig['featured'] ?? false),
            'badge' => $planConfig['badge'] ?? null,
            'features' => $planConfig['features'],
            'entitlements' => $planConfig['entitlements'] ?? [],
            'price' => [
                'amount' => (int) $priceConfig['amount'],
                'display' => (string) $priceConfig['display'],
                'stripe_price' => is_string($priceConfig['stripe_price'] ?? null) ? $priceConfig['stripe_price'] : null,
            ],
        ];
    }

    public function getPriceId(string $plan, string $billingMode): string
    {
        $priceId = $this->getPlan($plan, $billingMode)['price']['stripe_price'];

        if (! is_string($priceId) || $priceId === '') {
            throw new InvalidArgumentException('Stripe price is not configured for this plan.');
        }

        return $priceId;
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
    public function findByPriceId(?string $priceId): ?array
    {
        if (! is_string($priceId) || $priceId === '') {
            return null;
        }

        foreach ($this->getPlans() as $planKey => $plan) {
            foreach ($this->getBillingModes() as $billingMode => $billingModeConfig) {
                $candidatePriceId = Arr::get($plan, "prices.{$billingMode}.stripe_price");

                if ($candidatePriceId !== $priceId) {
                    continue;
                }

                return [
                    'plan' => $planKey,
                    'billing_mode' => $billingMode,
                    'label' => (string) $plan['label'],
                    'billing_mode_label' => $billingModeConfig['label'],
                    'price_display' => (string) Arr::get($plan, "prices.{$billingMode}.display"),
                ];
            }
        }

        return null;
    }

    public function planHasEntitlement(string $plan, string $feature): bool
    {
        $planConfig = $this->getPlans()[$plan] ?? null;

        if (! is_array($planConfig)) {
            return false;
        }

        return in_array($feature, $planConfig['entitlements'] ?? [], true);
    }

    public function getMinimumPlanForFeature(string $feature): ?string
    {
        foreach ($this->getPlanOrder() as $plan) {
            if ($this->planHasEntitlement($plan, $feature)) {
                return $plan;
            }
        }

        return null;
    }

    public function getFeatureLabel(string $feature): string
    {
        return (string) config("billing.feature_labels.{$feature}", $feature);
    }
}
