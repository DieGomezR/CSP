<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Notifications\WorkspaceInvitationNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function makeOwnedWorkspace(): array
{
    $owner = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $owner->assignRole('family-owner');

    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
    ]);

    return [$owner, $workspace];
}

test('owners can create workspace invitations and send an email', function () {
    Notification::fake();

    [$owner, $workspace] = makeOwnedWorkspace();

    $response = $this->actingAs($owner)->post(route('workspace.members.store', ['workspace' => $workspace->id]), [
        'first_name' => 'Casey',
        'last_name' => 'Parent',
        'email' => 'casey@example.com',
        'role' => 'coparent',
        'send_invite' => true,
    ]);

    $response->assertRedirect(route('dashboard', ['workspace' => $workspace->id], false));

    $invitation = WorkspaceInvitation::query()->where('email', 'casey@example.com')->firstOrFail();

    expect($invitation->status)->toBe('pending')
        ->and($invitation->role)->toBe('coparent')
        ->and($invitation->token)->not->toBe('');

    Notification::assertSentOnDemand(WorkspaceInvitationNotification::class, function ($notification, $channels, $notifiable) {
        return ($notifiable->routes['mail'] ?? null) === 'casey@example.com';
    });
});

test('invited users can register and accept a workspace invitation', function () {
    Notification::fake();

    [$owner, $workspace] = makeOwnedWorkspace();

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'invited_by_user_id' => $owner->id,
        'email' => 'invitee@example.com',
        'role' => 'coparent',
        'status' => 'pending',
        'token' => 'invite-register-token',
        'expires_at' => now()->addDays(7),
    ]);

    $response = $this->post('/signup', [
        'name' => 'Invited User',
        'email' => 'invitee@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'phone_number' => '+1 (555) 987-6543',
        'sms_opt_in' => true,
        'invite_token' => $invitation->token,
    ]);

    $response->assertRedirect(route('verification.notice', absolute: false));
    $this->assertAuthenticated();

    $invitee = User::query()->where('email', 'invitee@example.com')->firstOrFail();

    $this->assertDatabaseHas('workspace_members', [
        'workspace_id' => $workspace->id,
        'user_id' => $invitee->id,
        'role' => 'coparent',
        'status' => 'active',
    ]);

    $this->assertDatabaseHas('workspace_invitations', [
        'id' => $invitation->id,
        'status' => 'accepted',
    ]);

    expect($invitee->fresh()->hasRole('family-coparent'))->toBeTrue();
});

test('existing users can accept a workspace invitation during login', function () {
    [$owner, $workspace] = makeOwnedWorkspace();

    $invitee = User::factory()->create([
        'email' => 'member@example.com',
    ]);

    $invitation = WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'invited_by_user_id' => $owner->id,
        'email' => $invitee->email,
        'role' => 'member',
        'status' => 'pending',
        'token' => 'invite-login-token',
        'expires_at' => now()->addDays(7),
    ]);

    $response = $this->post('/login', [
        'email' => $invitee->email,
        'password' => 'password',
        'invite_token' => $invitation->token,
    ]);

    $this->assertAuthenticatedAs($invitee);
    $response->assertRedirect(route('dashboard', ['workspace' => $workspace->id], false));

    $this->assertDatabaseHas('workspace_members', [
        'workspace_id' => $workspace->id,
        'user_id' => $invitee->id,
        'role' => 'member',
        'status' => 'active',
    ]);

    $this->assertDatabaseHas('workspace_invitations', [
        'id' => $invitation->id,
        'status' => 'accepted',
    ]);

    expect($invitee->fresh()->hasRole('family-member'))->toBeTrue();
});
