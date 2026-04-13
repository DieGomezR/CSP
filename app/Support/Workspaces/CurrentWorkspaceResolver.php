<?php

declare(strict_types=1);

namespace App\Support\Workspaces;

use App\Models\Expense;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;

final class CurrentWorkspaceResolver
{
    public function resolve(Request $request): ?Workspace
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return null;
        }

        $workspaceId = $this->resolveWorkspaceId($request);
        $query = $user->workspaces()->where('type', 'family');

        if ($workspaceId !== null) {
            return $query->where('workspaces.id', $workspaceId)->first();
        }

        return $query
            ->orderByRaw('CASE WHEN workspaces.owner_id = ? THEN 0 ELSE 1 END', [$user->id])
            ->orderBy('workspaces.id')
            ->first();
    }

    private function resolveWorkspaceId(Request $request): ?int
    {
        $routeWorkspace = $request->route('workspace');

        if ($routeWorkspace instanceof Workspace) {
            return $routeWorkspace->id;
        }

        if (is_numeric($routeWorkspace)) {
            return (int) $routeWorkspace;
        }

        $routeExpense = $request->route('expense');

        if ($routeExpense instanceof Expense) {
            return $routeExpense->workspace_id;
        }

        $workspaceId = $request->integer('workspace');

        return $workspaceId > 0 ? $workspaceId : null;
    }
}
