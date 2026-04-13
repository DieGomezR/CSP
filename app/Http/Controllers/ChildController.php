<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Workspace;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    public function index(Request $request, Workspace $workspace): Response
    {
        $children = $workspace->children()->latest()->get()->map(fn (Child $child) => [
            'id' => $child->id,
            'name' => $child->name,
            'color' => $child->color,
            'birthdate' => $child->birthdate?->toDateString(),
            'notes' => $child->notes,
        ]);

        return Inertia::render('children/index', [
            'workspace' => $workspace->only(['id', 'name']),
            'children' => $children,
        ]);
    }

    public function create(Request $request, Workspace $workspace): Response
    {
        return Inertia::render('children/create', [
            'workspace' => $workspace->only(['id', 'name']),
            'colors' => $this->colorPalette(),
        ]);
    }

    public function store(Request $request, Workspace $workspace): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $child = $workspace->children()->create([
            'name' => $validated['name'],
            'color' => $validated['color'],
            'birthdate' => $validated['birthdate'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return to_route('dashboard', ['workspace' => $workspace->id])
            ->with('status', "Child {$child->name} added successfully!");
    }

    public function edit(Request $request, Workspace $workspace, Child $child): Response
    {
        if ($child->workspace_id !== $workspace->id) {
            throw new AuthorizationException('Child does not belong to this workspace.');
        }

        return Inertia::render('children/edit', [
            'workspace' => $workspace->only(['id', 'name']),
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'color' => $child->color,
                'birthdate' => $child->birthdate?->toDateString(),
                'notes' => $child->notes,
            ],
            'colors' => $this->colorPalette(),
        ]);
    }

    public function update(Request $request, Workspace $workspace, Child $child): RedirectResponse
    {
        if ($child->workspace_id !== $workspace->id) {
            throw new AuthorizationException('Child does not belong to this workspace.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $child->update($validated);

        return to_route('dashboard', ['workspace' => $workspace->id])
            ->with('status', "Child {$child->name} updated successfully!");
    }

    public function destroy(Request $request, Workspace $workspace, Child $child): RedirectResponse
    {
        if ($child->workspace_id !== $workspace->id) {
            throw new AuthorizationException('Child does not belong to this workspace.');
        }

        $childName = $child->name;
        $child->delete();

        return to_route('dashboard', ['workspace' => $workspace->id])
            ->with('status', "Child {$childName} removed successfully!");
    }

    /**
     * @return string[]
     */
    private function colorPalette(): array
    {
        return [
            '#67d2c3', '#5B8DEF', '#FF7D7D', '#9B6BFF',
            '#FFB86C', '#50FA7B', '#8BE9FD', '#FF79C6',
            '#BD93F9', '#F1FA8C', '#FF5555', '#6272A4',
        ];
    }
}
