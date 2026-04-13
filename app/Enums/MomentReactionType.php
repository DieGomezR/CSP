<?php

declare(strict_types=1);

namespace App\Enums;

enum MomentReactionType: string
{
    case Heart = 'heart';
    case Smile = 'smile';
    case Celebrate = 'celebrate';

    public function emoji(): string
    {
        return match ($this) {
            self::Heart => '💗',
            self::Smile => '😊',
            self::Celebrate => '🎉',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Heart => 'Love',
            self::Smile => 'Smile',
            self::Celebrate => 'Celebrate',
        };
    }

    /**
     * @return list<array{value:string,emoji:string,label:string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $reaction): array => [
                'value' => $reaction->value,
                'emoji' => $reaction->emoji(),
                'label' => $reaction->label(),
            ],
            self::cases(),
        );
    }
}
