<?php

namespace App\Support;

use App\Models\User;

class AuthRedirect
{
    public static function path(User $user, array $parameters = []): string
    {
        $route = $user->workspaces()->exists() ? 'dashboard' : 'onboarding.family.create';

        return route($route, $parameters, false);
    }
}
