<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseStatus;
use App\Models\Expense;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        $workspace = Workspace::factory()->create();
        $ownerMember = $workspace->members()->firstOrFail();
        $sharedWithMember = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'role' => 'member',
        ]);

        return [
            'workspace_id' => $workspace->id,
            'child_id' => null,
            'created_by_member_id' => $ownerMember->id,
            'shared_with_member_id' => $sharedWithMember->id,
            'accepted_by_member_id' => null,
            'currency' => 'USD',
            'amount_cents' => fake()->numberBetween(1000, 25000),
            'category' => fake()->randomElement(array_map(static fn (ExpenseCategory $category): string => $category->value, ExpenseCategory::cases())),
            'expense_date' => now()->toDateString(),
            'description' => fake()->sentence(3),
            'other_party_share_percentage' => fake()->numberBetween(10, 90),
            'status' => ExpenseStatus::Pending,
            'receipt_path' => null,
            'accepted_at' => null,
        ];
    }
}
