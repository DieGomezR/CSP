<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkspaceMessage>
 */
final class WorkspaceMessageFactory extends Factory
{
    protected $model = WorkspaceMessage::class;

    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'workspace_member_id' => WorkspaceMember::factory(),
            'client_request_id' => fake()->uuid(),
            'body' => fake()->paragraph(),
        ];
    }
}
