<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

final class NotificationController extends Controller
{
    public function read(Request $request, string $notification): RedirectResponse
    {
        /** @var DatabaseNotification|null $record */
        $record = $request->user()?->notifications()->find($notification);
        abort_unless($record instanceof DatabaseNotification, 404);

        if ($record->read_at === null) {
            $record->markAsRead();
        }

        $redirectTo = $request->string('redirect_to')->toString();

        return $redirectTo !== '' ? redirect()->to($redirectTo) : back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()?->unreadNotifications->markAsRead();

        return back()->with('status', 'Notifications marked as read.');
    }
}
