<?php

declare(strict_types=1);

namespace App\Enums;

enum MediationSessionStatus: string
{
    case Active = 'active';
    case Resolved = 'resolved';
    case Canceled = 'canceled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Resolved => 'Resolved',
            self::Canceled => 'Canceled',
        };
    }

    public function isClosed(): bool
    {
        return $this !== self::Active;
    }
}
