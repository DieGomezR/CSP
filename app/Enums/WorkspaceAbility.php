<?php

declare(strict_types=1);

namespace App\Enums;

enum WorkspaceAbility: string
{
    case BillingManage = 'billing.manage';
    case ExpensesView = 'expenses.view';
    case ExpensesCreate = 'expenses.create';
    case ExpensesAccept = 'expenses.accept';
    case ExpensesReopen = 'expenses.reopen';
    case CustodyManage = 'custody.manage';
}
