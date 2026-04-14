<?php

declare(strict_types=1);

namespace Tests\Feature\Messages;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessage;
use App\Models\WorkspaceMessageThread;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

final class MessageModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_plus_family_members_can_view_and_send_workspace_messages(): void
    {
        [$workspace, $owner, $ownerMember] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');
        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        $thread = $this->createThread($workspace, $ownerMember, 'Handoffs');

        WorkspaceMessage::query()->create([
            'workspace_id' => $workspace->id,
            'workspace_message_thread_id' => $thread->id,
            'workspace_member_id' => $ownerMember->id,
            'body' => 'Please remember the handoff is at 5 PM.',
        ]);

        $this->actingAs($member)->get(route('messages.index', ['workspace' => $workspace->id, 'thread' => $thread->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('messages/index')
                ->where('workspace.id', $workspace->id)
                ->has('threads', 1)
                ->where('selectedThread.subject', 'Handoffs')
                ->has('selectedThread.messages', 1)
                ->where('selectedThread.messages.0.body', 'Please remember the handoff is at 5 PM.'));

        $this->actingAs($member)->post(route('messages.store', ['workspace' => $workspace->id]), [
            'workspace_id' => $workspace->id,
            'thread_id' => $thread->id,
            'message' => 'Thanks, I will be there on time.',
            'client_request_id' => 'msg-1',
        ])->assertRedirect(route('messages.index', ['workspace' => $workspace->id, 'thread' => $thread->id]));

        $this->assertDatabaseHas('workspace_messages', [
            'workspace_id' => $workspace->id,
            'workspace_message_thread_id' => $thread->id,
            'body' => 'Thanks, I will be there on time.',
        ]);
    }

    public function test_message_send_is_idempotent_for_duplicate_client_request_ids(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i');
        $ownerMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();
        $thread = $this->createThread($workspace, $ownerMember, 'School');

        $payload = [
            'workspace_id' => $workspace->id,
            'thread_id' => $thread->id,
            'message' => 'Checking in about tomorrow morning.',
            'client_request_id' => 'duplicate-123',
        ];

        $this->actingAs($owner)->post(route('messages.store', ['workspace' => $workspace->id]), $payload)
            ->assertRedirect();

        $this->actingAs($owner)->post(route('messages.store', ['workspace' => $workspace->id]), $payload)
            ->assertRedirect();

        $this->assertSame(1, WorkspaceMessage::query()->count());
    }

    public function test_essential_plan_owners_are_redirected_to_billing_for_messages(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        $this->createSubscription($owner, 'price_1TKej9GVa0O4LKuhUlBciGoq');

        $this->actingAs($owner)->get(route('messages.index', ['workspace' => $workspace->id]))
            ->assertRedirect(route('billing', ['plan' => 'plus', 'mode' => 'family']));
    }

    public function test_users_can_create_multiple_conversations_and_unread_counts_are_exposed(): void
    {
        [$workspace, $owner, $ownerMember] = $this->makeWorkspace();
        [$member, $memberRecord] = $this->attachMember($workspace, 'Family Member', 'member');
        $this->createSubscription($owner, 'price_1TKeobGVa0O4LKuhllpTSD4i');

        $existingThread = $this->createThread($workspace, $ownerMember, 'School');

        WorkspaceMessage::query()->create([
            'workspace_id' => $workspace->id,
            'workspace_message_thread_id' => $existingThread->id,
            'workspace_member_id' => $ownerMember->id,
            'body' => 'School pickup changed to 3 PM.',
        ]);

        $this->actingAs($member)->post(route('messages.threads.store', ['workspace' => $workspace->id]), [
            'workspace_id' => $workspace->id,
            'subject' => 'Expenses',
        ])->assertRedirect();

        $this->assertDatabaseHas('workspace_message_threads', [
            'workspace_id' => $workspace->id,
            'subject' => 'Expenses',
        ]);

        $this->actingAs($member)->get(route('messages.index', ['workspace' => $workspace->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('threads', 2)
                ->where('threads.0.subject', 'Expenses')
                ->where('threads.1.subject', 'School')
                ->where('threads.1.unread_count', 1));

        $this->assertDatabaseHas('workspace_message_thread_members', [
            'workspace_message_thread_id' => $existingThread->id,
            'workspace_member_id' => $memberRecord->id,
        ]);
    }

    public function test_parent_mode_plus_does_not_cover_non_owner_members_for_messages(): void
    {
        [$workspace, $owner] = $this->makeWorkspace();
        [$member] = $this->attachMember($workspace, 'Family Member', 'member');
        $this->createSubscription($owner, 'price_1TKeneGVa0O4LKuhqZWStD8q');

        $this->actingAs($member)->get(route('messages.index', ['workspace' => $workspace->id]))
            ->assertForbidden();
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
