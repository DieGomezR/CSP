<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Child>
 */
class ChildFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory()->state([
                'type' => 'family',
            ]),
            'name' => fake()->firstName(),
            'color' => fake()->randomElement(['#4DBFAE', '#FF8A5B', '#5B8DEF', '#9B6BFF', '#F2C94C']),
            'birthdate' => fake()->dateTimeBetween('-14 years', '-2 years'),
            'notes' => null,
            'meta' => [
                'source' => 'factory',
            ],
        ];
    }
}
