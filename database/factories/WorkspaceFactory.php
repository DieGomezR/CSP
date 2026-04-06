<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Workspace>
 */
class WorkspaceFactory extends Factory
{
    public function configure(): static
    {
        return $this->afterCreating(function (Workspace $workspace) {
            WorkspaceMember::query()->firstOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'user_id' => $workspace->owner_id,
                ],
                [
                    'role' => 'owner',
                    'status' => 'active',
                    'notification_preferences' => [
                        'email' => true,
                        'sms' => false,
                    ],
                    'joined_at' => now(),
                    'last_seen_at' => now(),
                ]
            );
        });
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'slug' => fake()->unique()->slug(2),
            'type' => 'family',
            'timezone' => fake()->randomElement(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']),
            'owner_id' => User::factory(),
            'settings' => [
                'source' => 'factory',
            ],
        ];
    }
}
