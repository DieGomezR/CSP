<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WorkspaceInvitation;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Notifications\WorkspaceInvitationNotification;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceInvitationController extends Controller
{
    public function index(Request $request, Workspace $workspace): Response
    {
        $this->ensureOwner($request, $workspace, 'view members.');

        $members = $workspace->members()
            ->with('user')
            ->latest()
            ->get()
            ->map(fn (WorkspaceMember $member) => [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
                'role' => $member->role,
                'joined_at' => ($member->joined_at ?? $member->created_at)?->toIso8601String(),
            ]);

        $pendingInvitations = $workspace->invitations()
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->get()
            ->map(fn (WorkspaceInvitation $invitation) => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'invited_at' => $invitation->created_at->toIso8601String(),
                'expires_at' => $invitation->expires_at?->toIso8601String(),
            ]);

        return Inertia::render('workspace/members', [
            'workspace' => $workspace->only(['id', 'name']),
            'members' => $members,
            'pendingInvitations' => $pendingInvitations,
        ]);
    }

    public function store(Request $request, Workspace $workspace): RedirectResponse
    {
        $this->ensureOwner($request, $workspace, 'invite members.');

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', Rule::in(['coparent', 'member', 'caregiver'])],
            'send_invite' => ['boolean'],
        ]);

        $email = strtolower($validated['email']);
        $fullName = "{$validated['first_name']} {$validated['last_name']}";

        $existingUser = User::where('email', $email)->first();

        if ($existingUser !== null && $workspace->members()->where('user_id', $existingUser->id)->exists()) {
            return back()->withErrors(['email' => 'This user is already a member of the workspace.']);
        }

        if (
            $workspace->invitations()
                ->where('email', $email)
                ->where('status', 'pending')
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->exists()
        ) {
            return back()->withErrors(['email' => 'There is already a pending invitation for this email address.']);
        }

        $invitation = WorkspaceInvitation::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'email' => $email,
            ],
            [
                'role' => $validated['role'],
                'invited_by_user_id' => $request->user()->id,
                'status' => 'pending',
                'token' => Str::random(48),
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
            ],
        );

        if ($validated['send_invite'] ?? true) {
            $this->sendInvitationEmail($invitation);
        }

        return to_route('dashboard', ['workspace' => $workspace->id])
            ->with('status', ($validated['send_invite'] ?? true)
                ? "Invitation sent to {$fullName}!"
                : "Invitation created for {$fullName}. You can resend the email from the dashboard.");
    }

    public function update(Request $request, Workspace $workspace, WorkspaceMember $member): RedirectResponse
    {
        $this->ensureOwner($request, $workspace, 'edit members.');
        $this->ensureMemberBelongsToWorkspace($workspace, $member);

        $validated = $request->validate([
            'role' => ['required', Rule::in(['coparent', 'member', 'caregiver'])],
        ]);

        $member->update($validated);

        return back()->with('status', 'Member role updated successfully!');
    }

    public function destroy(Request $request, Workspace $workspace, WorkspaceMember $member): RedirectResponse
    {
        $this->ensureOwner($request, $workspace, 'remove members.');
        $this->ensureMemberBelongsToWorkspace($workspace, $member);

        if ($member->user_id === $request->user()->id) {
            return back()->withErrors(['error' => 'You cannot remove yourself from the workspace.']);
        }

        $memberName = $member->user?->name ?? 'Unknown member';
        $member->delete();

        return back()->with('status', "{$memberName} has been removed from the workspace.");
    }

    public function cancelInvitation(Request $request, Workspace $workspace, WorkspaceInvitation $invitation): RedirectResponse
    {
        $this->ensureOwner($request, $workspace, 'cancel invitations.');
        $this->ensureInvitationBelongsToWorkspace($workspace, $invitation);

        $invitation->delete();

        return back()->with('status', 'Invitation cancelled.');
    }

    public function resendInvitation(Request $request, Workspace $workspace, WorkspaceInvitation $invitation): RedirectResponse
    {
        $this->ensureOwner($request, $workspace, 'resend invitations.');
        $this->ensureInvitationBelongsToWorkspace($workspace, $invitation);

        $invitation->forceFill([
            'token' => Str::random(48),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
            'accepted_at' => null,
        ])->save();

        $this->sendInvitationEmail($invitation);

        return back()->with('status', 'Invitation resent successfully!');
    }

    private function ensureOwner(Request $request, Workspace $workspace, string $context): void
    {
        if (! $workspace->users()->where('user_id', $request->user()->id)->wherePivot('role', 'owner')->exists()) {
            throw new AuthorizationException("Only workspace owners can {$context}");
        }
    }

    private function ensureMemberBelongsToWorkspace(Workspace $workspace, WorkspaceMember $member): void
    {
        if ($member->workspace_id !== $workspace->id) {
            throw new AuthorizationException('Member does not belong to this workspace.');
        }
    }

    private function ensureInvitationBelongsToWorkspace(Workspace $workspace, WorkspaceInvitation $invitation): void
    {
        if ($invitation->workspace_id !== $workspace->id) {
            throw new AuthorizationException('Invitation does not belong to this workspace.');
        }
    }

    private function sendInvitationEmail(WorkspaceInvitation $invitation): void
    {
        $invitation->loadMissing(['workspace', 'invitedBy']);

        Notification::route('mail', $invitation->email)
            ->notify(new WorkspaceInvitationNotification($invitation));
    }
}
