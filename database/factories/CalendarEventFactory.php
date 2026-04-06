<?php

namespace Database\Factories;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CalendarEvent>
 */
class CalendarEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('-1 week', '+2 weeks');
        $endsAt = (clone $startsAt)->modify('+1 hour');

        return [
            'workspace_id' => Workspace::factory()->state([
                'type' => 'family',
            ]),
            'creator_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'location' => fake()->optional()->company(),
            'timezone' => 'America/New_York',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'is_all_day' => false,
            'color' => fake()->randomElement(['#4DBFAE', '#FF8A5B', '#5B8DEF', '#9B6BFF', '#F2C94C']),
            'recurrence_type' => null,
            'recurrence_interval' => null,
            'recurrence_days_of_week' => null,
            'recurrence_until' => null,
            'status' => 'confirmed',
            'source' => 'manual',
            'meta' => [
                'source' => 'factory',
            ],
        ];
    }
}
