<?php

declare(strict_types=1);

return [
    'abilities' => [
        'billing.manage' => ['owner'],
        'expenses.view' => ['owner', 'coparent', 'member'],
        'expenses.create' => ['owner', 'coparent', 'member'],
        'expenses.accept' => ['owner'],
        'expenses.reopen' => ['owner'],
        'custody.manage' => ['owner'],
    ],

    'admin_override_permissions' => [
        'admin.access',
    ],
];
