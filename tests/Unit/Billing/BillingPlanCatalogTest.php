<?php

declare(strict_types=1);

use App\Support\Billing\BillingPlanCatalog;
use Tests\TestCase;

uses(TestCase::class);

test('billing plan catalog resolves all configured prices', function () {
    $catalog = app(BillingPlanCatalog::class);

    expect($catalog->getTrialDays())->toBe(60)
        ->and($catalog->getSubscriptionName())->toBe('default')
        ->and($catalog->getPriceId('essential', 'parent'))->toBe('price_1TKej9GVa0O4LKuhUlBciGoq')
        ->and($catalog->getPriceId('plus', 'parent'))->toBe('price_1TKeneGVa0O4LKuhqZWStD8q')
        ->and($catalog->getPriceId('complete', 'parent'))->toBe('price_1TKenvGVa0O4LKuh4RyLRiZA')
        ->and($catalog->getPriceId('essential', 'family'))->toBe('price_1TKeo9GVa0O4LKuhWTs0g3FQ')
        ->and($catalog->getPriceId('plus', 'family'))->toBe('price_1TKeobGVa0O4LKuhllpTSD4i')
        ->and($catalog->getPriceId('complete', 'family'))->toBe('price_1TKeouGVa0O4LKuhObats41S');
});

test('billing plan catalog exposes normalized plans for ui', function () {
    $catalog = app(BillingPlanCatalog::class);

    $plans = $catalog->getPlansForUi();
    $billingModes = $catalog->getBillingModesForUi();
    $currentPlan = $catalog->findByPriceId('price_1TKeobGVa0O4LKuhllpTSD4i');

    expect($billingModes)->toHaveCount(2)
        ->and($plans)->toHaveCount(3)
        ->and($plans[1]['key'])->toBe('plus')
        ->and($plans[1]['prices']['family']['display'])->toBe('$17.99')
        ->and($plans[1]['prices']['family']['configured'])->toBeTrue()
        ->and($currentPlan)->toMatchArray([
            'plan' => 'plus',
            'billing_mode' => 'family',
            'label' => 'Plus',
            'billing_mode_label' => 'Full Family',
            'price_display' => '$17.99',
        ]);
});
