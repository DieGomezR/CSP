<?php

declare(strict_types=1);

use App\Models\MediationMessage;
use App\Models\MediationSession;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('cache.default', 'array');
    $this->seed(RolesAndPermissionsSeeder::class);
});

function makeWorkspaceWithCompleteFamilyPlan(): array
{
    $owner = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
    ]);

    $ownerMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();

    $coparent = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $coparentMember = WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $coparent->id,
        'role' => 'coparent',
    ]);

    $owner->forceFill([
        'stripe_id' => 'cus_test_'.$owner->id,
    ])->save();

    DB::table('subscriptions')->insert([
        'user_id' => $owner->id,
        'type' => 'default',
        'stripe_id' => 'sub_test_'.$owner->id,
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_1TKeouGVa0O4LKuhObats41S',
        'quantity' => 1,
        'trial_ends_at' => now()->addDays(30),
        'ends_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return [$workspace, $owner, $ownerMember, $coparent, $coparentMember];
}

test('mediation center renders for covered workspace members', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)
        ->get(route('mediation.index', ['workspace' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('mediation/index')
            ->where('workspace.id', $workspace->id)
            ->where('stats.sessionsCount', 0));
});

test('only one active mediation session can exist per workspace', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)
        ->post(route('mediation.store', ['workspace' => $workspace->id]), [
            'subject' => 'Summer schedule handoff concerns',
        ])
        ->assertRedirect();

    $this->actingAs($owner)
        ->from(route('mediation.index', ['workspace' => $workspace->id]))
        ->post(route('mediation.store', ['workspace' => $workspace->id]), [
            'subject' => 'Second topic that should be blocked',
        ])
        ->assertRedirect(route('mediation.index', ['workspace' => $workspace->id], false))
        ->assertSessionHasErrors('subject');

    expect(MediationSession::query()->count())->toBe(1);
});

test('message sending is idempotent for duplicate client request ids', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Speech therapy scheduling',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $payload = [
        'message' => 'I need a calmer way to explain the therapy schedule.',
        'client_request_id' => '20b4e25b-bbbb-4c6e-9e3d-1cb6d11f0f01',
    ];

    $this->actingAs($owner)
        ->post(route('mediation.messages.store', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), $payload)
        ->assertRedirect();

    $this->actingAs($owner)
        ->post(route('mediation.messages.store', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), $payload)
        ->assertRedirect();

    expect(MediationMessage::query()->where('mediation_session_id', $session->id)->where('role', 'user')->count())->toBe(1)
        ->and(MediationMessage::query()->where('mediation_session_id', $session->id)->where('role', 'assistant')->count())->toBe(2);
});

test('ask ai for help adds an alternate assistant response', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'School pickup disagreements',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $this->actingAs($owner)
        ->post(route('mediation.help', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
            'client_request_id' => '20b4e25b-bbbb-4c6e-9e3d-1cb6d11f0f02',
        ])
        ->assertRedirect();

    expect(MediationMessage::query()->where('mediation_session_id', $session->id)->where('kind', 'ai_help_request')->count())->toBe(1)
        ->and(MediationMessage::query()->where('mediation_session_id', $session->id)->where('role', 'assistant')->count())->toBe(2);
});

test('resolve and need-more-help flows require reasons and archive the session', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Weekend exchange logistics',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $this->actingAs($owner)
        ->from(route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $workspace->id]))
        ->post(route('mediation.resolve', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
            'reason' => '',
        ])
        ->assertRedirect(route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $workspace->id], false))
        ->assertSessionHasErrors('reason');

    $this->actingAs($owner)
        ->post(route('mediation.resolve', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
            'reason' => 'We agreed to confirm exchange timing 24 hours in advance.',
        ])
        ->assertRedirect();

    expect($session->fresh()->status->value)->toBe('resolved');

    $this->actingAs($owner)
        ->get(route('mediation.index', ['workspace' => $workspace->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('history.0.status', 'resolved'));

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Unexpected homework conflict',
    ]);

    $secondSession = MediationSession::query()->latest('id')->firstOrFail();

    $this->actingAs($owner)
        ->from(route('mediation.show', ['mediationSession' => $secondSession->id, 'workspace' => $workspace->id]))
        ->post(route('mediation.cancel', ['mediationSession' => $secondSession->id, 'workspace' => $workspace->id]), [
            'reason' => '',
        ])
        ->assertRedirect(route('mediation.show', ['mediationSession' => $secondSession->id, 'workspace' => $workspace->id], false))
        ->assertSessionHasErrors('reason');

    $this->actingAs($owner)
        ->post(route('mediation.cancel', ['mediationSession' => $secondSession->id, 'workspace' => $workspace->id]), [
            'reason' => 'We are not making progress and need a human mediator.',
        ])
        ->assertRedirect();

    expect($secondSession->fresh()->status->value)->toBe('canceled');
});

test('court report print view renders archived mediation data', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Communication boundaries',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $this->actingAs($owner)->post(route('mediation.messages.store', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
        'message' => 'We keep arguing in front of the child.',
        'client_request_id' => '20b4e25b-bbbb-4c6e-9e3d-1cb6d11f0f03',
    ]);

    $this->actingAs($owner)->post(route('mediation.resolve', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
        'reason' => 'We agreed to pause heated conversations and move them to writing.',
    ]);

    $response = $this->actingAs($owner)
        ->get(route('mediation.report.print', [
            'workspace' => $workspace->id,
            'start' => now()->subMonth()->toDateString(),
            'end' => now()->toDateString(),
        ]));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('mediation can queue AI replies when async mode is enabled', function () {
    Queue::fake();
    config()->set('mediation.ai.queue_replies', true);

    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Homework coordination',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $this->actingAs($owner)
        ->post(route('mediation.messages.store', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
            'message' => 'We need a calmer handoff for homework updates.',
            'client_request_id' => '20b4e25b-bbbb-4c6e-9e3d-1cb6d11f0f04',
        ])
        ->assertRedirect();

    Queue::assertPushed(\App\Jobs\GenerateMediationAssistantReply::class);
});

test('mediation rate limiting blocks excessive ai help requests', function () {
    config()->set('mediation.ai.help_requests_per_hour', 1);

    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Pickup timing',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $this->actingAs($owner)
        ->post(route('mediation.help', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
            'client_request_id' => '20b4e25b-bbbb-4c6e-9e3d-1cb6d11f0f05',
        ])
        ->assertRedirect();

    $this->actingAs($owner)
        ->from(route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $workspace->id]))
        ->post(route('mediation.help', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
            'client_request_id' => '20b4e25b-bbbb-4c6e-9e3d-1cb6d11f0f06',
        ])
        ->assertRedirect(route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $workspace->id], false))
        ->assertSessionHasErrors('message');
});

test('complete family members can access mediation but plus owners cannot', function () {
    [$workspace, $owner, , $coparent] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($coparent)
        ->get(route('mediation.index', ['workspace' => $workspace->id]))
        ->assertOk();

    DB::table('subscriptions')->where('user_id', $owner->id)->delete();
    DB::table('subscriptions')->insert([
        'user_id' => $owner->id,
        'type' => 'default',
        'stripe_id' => 'sub_test_plus_'.$owner->id,
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_1TKeobGVa0O4LKuhllpTSD4i',
        'quantity' => 1,
        'trial_ends_at' => now()->addDays(30),
        'ends_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($owner)
        ->get(route('mediation.index', ['workspace' => $workspace->id]))
        ->assertRedirect(route('billing', ['plan' => 'complete', 'mode' => 'family']));
});

test('parent mode complete plan does not cover coparents for mediation', function () {
    [$workspace, $owner, , $coparent] = makeWorkspaceWithCompleteFamilyPlan();

    DB::table('subscriptions')->where('user_id', $owner->id)->delete();
    DB::table('subscriptions')->insert([
        'user_id' => $owner->id,
        'type' => 'default',
        'stripe_id' => 'sub_test_parent_complete_'.$owner->id,
        'stripe_status' => 'trialing',
        'stripe_price' => 'price_1TKenvGVa0O4LKuh4RyLRiZA',
        'quantity' => 1,
        'trial_ends_at' => now()->addDays(30),
        'ends_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($coparent)
        ->get(route('mediation.index', ['workspace' => $workspace->id]))
        ->assertForbidden();
});

test('admin escalation tooling lists canceled sessions', function () {
    [$workspace, $owner] = makeWorkspaceWithCompleteFamilyPlan();

    $this->actingAs($owner)->post(route('mediation.store', ['workspace' => $workspace->id]), [
        'subject' => 'Escalated disagreement',
    ]);

    $session = MediationSession::query()->firstOrFail();

    $this->actingAs($owner)->post(route('mediation.cancel', ['mediationSession' => $session->id, 'workspace' => $workspace->id]), [
        'reason' => 'We need a human mediator to continue.',
    ]);

    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('admin.mediation.escalations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/mediation-escalations')
            ->where('sessions.0.subject', 'Escalated disagreement'));
});
