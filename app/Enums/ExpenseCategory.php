<?php

declare(strict_types=1);

namespace App\Enums;

enum ExpenseCategory: string
{
    case Medical = 'medical';
    case School = 'school';
    case Sports = 'sports';
    case Childcare = 'childcare';
    case Activities = 'activities';
    case Transportation = 'transportation';
    case Clothing = 'clothing';
    case Food = 'food';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Medical => 'Medical',
            self::School => 'School',
            self::Sports => 'Sports',
            self::Childcare => 'Childcare',
            self::Activities => 'Activities',
            self::Transportation => 'Transportation',
            self::Clothing => 'Clothing',
            self::Food => 'Food',
            self::Other => 'Other',
        };
    }

    /**
     * @return list<array{value:string,label:string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ],
            self::cases(),
        );
    }
}
