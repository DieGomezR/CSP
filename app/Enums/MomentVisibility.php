<?php

declare(strict_types=1);

namespace App\Enums;

enum MomentVisibility: string
{
    case Family = 'family';
    case Private = 'private';

    public function label(): string
    {
        return match ($this) {
            self::Family => 'Whole Family',
            self::Private => 'Just Me',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Family => 'Share with the whole family workspace.',
            self::Private => 'Keep this memory visible only to you.',
        };
    }

    /**
     * @return list<array{value:string,label:string,description:string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $visibility): array => [
                'value' => $visibility->value,
                'label' => $visibility->label(),
                'description' => $visibility->description(),
            ],
            self::cases(),
        );
    }
}
