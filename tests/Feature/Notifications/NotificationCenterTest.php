<?php

declare(strict_types=1);

namespace Tests\Feature\Notifications;

use App\Models\User;
use App\Models\Moment;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessageThread;
use App\Notifications\AppWorkspaceNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Cashier\Events\WebhookHandled;
use Tests\TestCase;
use App\Listeners\Billing\SendBillingLifecycleEmails;

final class NotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_send_creates_a_database_notification_for_other_members(): void
    {
        [$workspace, $owner, $ownerMember] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');
        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        $thread = $this->createThread($workspace, $ownerMember, 'School');

        $this->actingAs($owner)->post(route('messages.store', ['workspace' => $workspace->id]), [
            'workspace_id' => $workspace->id,
            'thread_id' => $thread->id,
            'message' => 'Please review the school note tonight.',
            'client_request_id' => 'notify-1',
        ])->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $member->id,
        ]);
    }

    public function test_users_can_mark_notifications_as_read_and_read_all(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $user->notify(new AppWorkspaceNotification([
            'kind' => 'general',
            'title' => 'Test notification',
            'body' => 'Something happened.',
            'href' => route('dashboard'),
        ]));

        $user->notify(new AppWorkspaceNotification([
            'kind' => 'general',
            'title' => 'Another notification',
            'body' => 'Another thing happened.',
            'href' => route('dashboard'),
        ]));

        $first = $user->notifications()->oldest('created_at')->firstOrFail();

        $this->actingAs($user)->post(route('notifications.read', ['notification' => $first->id]), [
            'redirect_to' => route('dashboard'),
        ])->assertRedirect(route('dashboard'));

        $this->assertNotNull($first->fresh()->read_at);
        $this->assertSame(1, $user->fresh()->unreadNotifications()->count());

        $this->actingAs($user)->post(route('notifications.read-all'))
            ->assertRedirect();

        $this->assertSame(0, $user->fresh()->unreadNotifications()->count());
    }

    public function test_family_members_receive_billing_change_notifications_when_owner_plan_changes(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');

        $owner->forceFill([
            'stripe_id' => 'cus_billing_workspace',
        ])->save();

        app(SendBillingLifecycleEmails::class)->handle(new WebhookHandled([
            'type' => 'customer.subscription.updated',
            'data' => [
                'object' => [
                    'customer' => 'cus_billing_workspace',
                    'items' => [
                        'data' => [[
                            'price' => ['id' => 'price_1TKeouGVa0O4LKuhObats41S'],
                        ]],
                    ],
                ],
                'previous_attributes' => [
                    'items' => [
                        'data' => [[
                            'price' => ['id' => 'price_1TKeneGVa0O4LKuhqZWStD8q'],
                        ]],
                    ],
                ],
            ],
        ]));

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $member->id,
            'type' => AppWorkspaceNotification::class,
        ]);
    }

    public function test_moment_reactions_notify_the_moment_creator(): void
    {
        Storage::fake('local');

        [$workspace, $owner, $ownerMember] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');
        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        $file = UploadedFile::fake()->image('family-memory.jpg');
        $path = $file->store("moments/{$workspace->id}", 'local');

        $moment = Moment::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $ownerMember->id,
            'visibility' => 'family',
            'photo_path' => $path,
            'photo_original_name' => 'family-memory.jpg',
            'photo_mime_type' => 'image/jpeg',
            'photo_size_bytes' => $file->getSize(),
            'caption' => 'Beach day',
            'taken_on' => now()->toDateString(),
        ]);

        $this->actingAs($member)->post(route('moments.reactions.store', ['moment' => $moment->id]), [
            'reaction' => 'heart',
        ])->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $owner->id,
            'type' => AppWorkspaceNotification::class,
        ]);
    }

    /**
     * @return array{0: Workspace, 1: User, 2: WorkspaceMember}
     */
    private function makeWorkspace(): array
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $workspace = Workspace::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $ownerMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();

        return [$workspace, $owner, $ownerMember];
    }

    /**
     * @return array{0: User, 1: WorkspaceMember}
     */
    private function attachMember(Workspace $workspace, string $name, string $role): array
    {
        $user = User::factory()->create([
            'name' => $name,
            'email_verified_at' => now(),
        ]);

        $membership = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => $role,
        ]);

        return [$user, $membership];
    }

    private function createSubscription(User $user, string $priceId): void
    {
        $user->forceFill([
            'stripe_id' => 'cus_test_'.$user->id,
        ])->save();

        DB::table('subscriptions')->insert([
            'user_id' => $user->id,
            'type' => 'default',
            'stripe_id' => 'sub_test_'.$user->id.'_'.md5($priceId),
            'stripe_status' => 'trialing',
            'stripe_price' => $priceId,
            'quantity' => 1,
            'trial_ends_at' => now()->addDays(30),
            'ends_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createThread(Workspace $workspace, WorkspaceMember $creator, string $subject): WorkspaceMessageThread
    {
        $thread = WorkspaceMessageThread::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $creator->id,
            'subject' => $subject,
            'last_message_at' => now(),
        ]);

        foreach ($workspace->members as $member) {
            DB::table('workspace_message_thread_members')->insert([
                'workspace_message_thread_id' => $thread->id,
                'workspace_member_id' => $member->id,
                'last_read_at' => $member->id === $creator->id ? now() : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $thread;
    }
}
