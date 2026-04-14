<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Access\WorkspaceEntitlementResolver;
use App\Support\Notifications\NotificationFeedBuilder;
use App\Support\Workspaces\CurrentWorkspaceResolver;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $workspaceAccess = null;
        $notificationFeed = [
            'unread_count' => 0,
            'items' => [],
        ];

        if ($request->user() instanceof User) {
            $workspace = app(CurrentWorkspaceResolver::class)->resolve($request);

            if ($workspace !== null) {
                $workspaceAccess = app(WorkspaceEntitlementResolver::class)
                    ->snapshot($request->user(), $workspace)
                    ->toArray();
            }

            $notificationFeed = app(NotificationFeedBuilder::class)->buildForUser($request->user());
        }

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'appearance' => [
                'theme' => data_get($request->user()?->preferences ?: [], 'appearance.theme', 'warm'),
            ],
            'security' => [
                'csrf_token' => csrf_token(),
            ],
            'flash' => [
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
            'notifications' => $notificationFeed,
            'workspaceAccess' => $workspaceAccess,
        ]);
    }
}
