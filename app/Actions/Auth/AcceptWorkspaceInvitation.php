<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

final class AcceptWorkspaceInvitation
{
    public function handle(User $user, WorkspaceInvitation $invitation, bool $smsOptIn = false): WorkspaceInvitation
    {
        $this->guardInvitationForUser($user, $invitation);

        return DB::transaction(function () use ($user, $invitation, $smsOptIn) {
            WorkspaceMember::updateOrCreate(
                [
                    'workspace_id' => $invitation->workspace_id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $invitation->role,
                    'status' => 'active',
                    'notification_preferences' => [
                        'email' => true,
                        'sms' => $smsOptIn,
                    ],
                    'joined_at' => now(),
                    'last_seen_at' => now(),
                ],
            );

            $invitation->forceFill([
                'status' => 'accepted',
                'accepted_at' => now(),
            ])->save();

            $user->assignRole($this->resolveApplicationRole($invitation->role));

            return $invitation->fresh(['workspace', 'invitedBy']) ?? $invitation->loadMissing(['workspace', 'invitedBy']);
        });
    }

    public function resolvePendingInvitation(?string $token): ?WorkspaceInvitation
    {
        if (! is_string($token) || $token === '') {
            return null;
        }

        return WorkspaceInvitation::query()
            ->where('token', $token)
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->with(['workspace', 'invitedBy'])
            ->first();
    }

    public function guardInvitationForUser(User $user, WorkspaceInvitation $invitation): void
    {
        if (
            $invitation->status !== 'pending'
            || ($invitation->expires_at !== null && Carbon::parse($invitation->expires_at)->isPast())
        ) {
            throw ValidationException::withMessages([
                'email' => 'This invitation is no longer valid. Ask the workspace owner to resend it.',
            ]);
        }

        if (! hash_equals(strtolower($invitation->email), strtolower($user->email))) {
            throw ValidationException::withMessages([
                'email' => 'Sign in with the invited email address to accept this family invitation.',
            ]);
        }
    }

    private function resolveApplicationRole(string $workspaceRole): string
    {
        return match ($workspaceRole) {
            'owner' => 'family-owner',
            'coparent' => 'family-coparent',
            'caregiver' => 'caregiver',
            default => 'family-member',
        };
    }
}
