<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\User;

class AuthRedirect
{
    /**
     * @param array<string, mixed> $parameters
     */
    public static function path(User $user, array $parameters = []): string
    {
        $route = $user->workspaces()->exists() ? 'dashboard' : 'onboarding.family.create';

        return route($route, $parameters, false);
    }
}
