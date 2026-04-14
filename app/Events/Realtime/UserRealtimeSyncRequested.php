<?php

declare(strict_types=1);

namespace App\Events\Realtime;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class UserRealtimeSyncRequested implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * @param array<string, int|string|null> $context
     */
    public function __construct(
        public readonly int $targetUserId,
        public readonly string $domain,
        public readonly string $action,
        public readonly int $workspaceId,
        public readonly ?int $actorUserId = null,
        public readonly array $context = [],
    ) {
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("App.Models.User.{$this->targetUserId}");
    }

    public function broadcastAs(): string
    {
        return 'workspace.ui.sync';
    }

    /**
     * @return array<string, int|string|null>
     */
    public function broadcastWith(): array
    {
        return [
            'domain' => $this->domain,
            'action' => $this->action,
            'workspace_id' => $this->workspaceId,
            'actor_user_id' => $this->actorUserId,
            ...$this->context,
        ];
    }
}
