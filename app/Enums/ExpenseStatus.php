<?php

declare(strict_types=1);

namespace App\Enums;

enum ExpenseStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Accepted => 'Settled',
        };
    }
}
