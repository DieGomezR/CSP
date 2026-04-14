<?php

declare(strict_types=1);

namespace App\Support\Notifications;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

final class NotificationFeedBuilder
{
    /**
     * @return array{unread_count:int,items:list<array<string,mixed>>}
     */
    public function buildForUser(User $user, int $limit = 8): array
    {
        $items = $user->notifications()
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (DatabaseNotification $notification): array => $this->serialize($notification))
            ->all();

        return [
            'unread_count' => $user->unreadNotifications()->count(),
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function serialize(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'kind' => data_get($notification->data, 'kind', 'general'),
            'title' => data_get($notification->data, 'title', 'Notification'),
            'body' => data_get($notification->data, 'body', ''),
            'href' => data_get($notification->data, 'href'),
            'workspace_id' => data_get($notification->data, 'workspace_id'),
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
            'created_at_label' => $notification->created_at?->diffForHumans(),
        ];
    }
}
