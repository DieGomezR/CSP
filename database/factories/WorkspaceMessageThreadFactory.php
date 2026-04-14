<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessageThread;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkspaceMessageThread>
 */
final class WorkspaceMessageThreadFactory extends Factory
{
    protected $model = WorkspaceMessageThread::class;

    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'created_by_member_id' => WorkspaceMember::factory(),
            'subject' => fake()->sentence(3),
            'last_message_at' => now(),
        ];
    }
}
