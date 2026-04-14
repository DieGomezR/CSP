<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Actions\Onboarding\CreateInitialFamilyWorkspace;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\WelcomeToKidScheduleNotification;
use App\Notifications\WorkspaceInvitationNotification;
use App\Support\Auth\EnsureApplicationRoles;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class RegisterFamilyAccount
{
    public function __construct(
        private readonly AcceptWorkspaceInvitation $acceptWorkspaceInvitation,
        private readonly EnsureApplicationRoles $ensureApplicationRoles,
    ) {
    }

    /**
     * @param array{
     *   name:string,
     *   email:string,
     *   password:string,
     *   phone_number:string,
     *   sms_opt_in:bool,
     *   family_name?:string|null,
     *   timezone?:string|null,
     *   coparent_email?:string|null,
     *   invite_token?:string|null
     * } $payload
     */
    public function handle(array $payload): User
    {
        return DB::transaction(function () use ($payload) {
            $invitation = $this->acceptWorkspaceInvitation->resolvePendingInvitation($payload['invite_token'] ?? null);

            $user = User::create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'phone_number' => $payload['phone_number'],
                'sms_opt_in' => $payload['sms_opt_in'],
                'password' => Hash::make($payload['password']),
            ]);

            if ($invitation) {
                $this->acceptWorkspaceInvitation->handle($user, $invitation, $payload['sms_opt_in']);
            } else {
                $workspace = app(CreateInitialFamilyWorkspace::class)->handle($user, [
                    'family_name' => $payload['family_name'] ?? "{$payload['name']}'s Family",
                    'timezone' => $payload['timezone'] ?? config('app.timezone'),
                    'children' => [],
                    'notification_preferences' => [
                        'email' => true,
                        'sms' => $payload['sms_opt_in'],
                    ],
                ]);

                $this->ensureApplicationRoles->handle();
                $user->assignRole('family-owner');
                $this->sendOptionalCoParentInvitation($workspace->fresh('owner') ?? $workspace->load('owner'), $user, $payload['coparent_email'] ?? null);
            }

            $user->notify(new WelcomeToKidScheduleNotification());

            return $user;
        });
    }

    private function sendOptionalCoParentInvitation(Workspace $workspace, User $user, ?string $coparentEmail): void
    {
        if (! $coparentEmail) {
            return;
        }

        $invitation = WorkspaceInvitation::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'email' => strtolower($coparentEmail),
            ],
            [
                'invited_by_user_id' => $user->id,
                'role' => 'coparent',
                'status' => 'pending',
                'token' => Str::random(48),
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
            ],
        );

        $invitation->loadMissing(['workspace', 'invitedBy']);

        Notification::route('mail', $invitation->email)->notify(new WorkspaceInvitationNotification($invitation));
    }
}
