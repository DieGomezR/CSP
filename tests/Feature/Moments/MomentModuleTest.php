<?php

declare(strict_types=1);

use App\Enums\MomentVisibility;
use App\Models\Moment;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function makeFamilyWorkspaceWithCoparent(): array
{
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create([
        'owner_id' => $owner->id,
    ]);
    $ownerMember = $workspace->members()->where('user_id', $owner->id)->firstOrFail();

    $coparent = User::factory()->create();
    $coparentMember = WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $coparent->id,
        'role' => 'coparent',
    ]);

    activateMomentsSubscription($owner);

    return [$workspace, $owner, $ownerMember, $coparent, $coparentMember];
}

function activateMomentsSubscription(User $user, string $priceId = 'price_1TKeobGVa0O4LKuhllpTSD4i'): void
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

function createMomentWithImage(Workspace $workspace, WorkspaceMember $member, string $visibility, string $filename): Moment
{
    $file = UploadedFile::fake()->image($filename);
    $path = $file->store("moments/{$workspace->id}", 'local');

    return Moment::query()->create([
        'workspace_id' => $workspace->id,
        'created_by_member_id' => $member->id,
        'visibility' => $visibility,
        'photo_path' => $path,
        'photo_original_name' => $filename,
        'photo_mime_type' => 'image/jpeg',
        'photo_size_bytes' => $file->getSize() ?? 0,
        'caption' => null,
        'taken_on' => now()->toDateString(),
    ]);
}

test('members can upload a moment and it is stored on the private disk', function () {
    Storage::fake('local');

    [$workspace, $owner, $ownerMember] = makeFamilyWorkspaceWithCoparent();

    $response = $this->actingAs($owner)->post(route('moments.store'), [
        'workspace_id' => $workspace->id,
        'visibility' => MomentVisibility::Private->value,
        'caption' => 'Quiet memory',
        'taken_on' => now()->subDay()->toDateString(),
        'photo' => UploadedFile::fake()->image('quiet-memory.jpg'),
    ]);

    $response->assertRedirect(route('moments.index', ['workspace' => $workspace->id], false));

    $moment = Moment::query()->firstOrFail();

    expect($moment->created_by_member_id)->toBe($ownerMember->id)
        ->and($moment->visibility)->toBe(MomentVisibility::Private);

    Storage::disk('local')->assertExists($moment->photo_path);
});

test('members only see family moments plus their own private moments', function () {
    Storage::fake('local');

    [$workspace, $owner, $ownerMember, $coparent, $coparentMember] = makeFamilyWorkspaceWithCoparent();

    $familyMoment = createMomentWithImage($workspace, $ownerMember, MomentVisibility::Family->value, 'family.jpg');
    $ownerPrivateMoment = createMomentWithImage($workspace, $ownerMember, MomentVisibility::Private->value, 'owner-private.jpg');
    $coparentPrivateMoment = createMomentWithImage($workspace, $coparentMember, MomentVisibility::Private->value, 'coparent-private.jpg');

    $this->actingAs($coparent)
        ->get(route('moments.index', ['workspace' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('moments/index')
            ->where('moments', fn ($moments): bool => collect($moments)->pluck('id')->sort()->values()->all() === collect([
                $familyMoment->id,
                $coparentPrivateMoment->id,
            ])->sort()->values()->all()));

    $this->actingAs($owner)
        ->get(route('moments.index', ['workspace' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('moments/index')
            ->where('moments', fn ($moments): bool => collect($moments)->pluck('id')->contains($ownerPrivateMoment->id)));
});

test('private moment images are forbidden to other family members', function () {
    Storage::fake('local');

    [$workspace, $owner, $ownerMember, $coparent] = makeFamilyWorkspaceWithCoparent();
    $privateMoment = createMomentWithImage($workspace, $ownerMember, MomentVisibility::Private->value, 'private-locked.jpg');

    $this->actingAs($owner)
        ->get(route('moments.image', ['moment' => $privateMoment->id]))
        ->assertOk();

    $this->actingAs($coparent)
        ->get(route('moments.image', ['moment' => $privateMoment->id]))
        ->assertForbidden();
});

test('creators can delete their moments and the stored file is removed', function () {
    Storage::fake('local');

    [$workspace, $owner, $ownerMember] = makeFamilyWorkspaceWithCoparent();
    $moment = createMomentWithImage($workspace, $ownerMember, MomentVisibility::Family->value, 'delete-me.jpg');

    Storage::disk('local')->assertExists($moment->photo_path);

    $this->actingAs($owner)
        ->delete(route('moments.destroy', ['moment' => $moment->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('moments', [
        'id' => $moment->id,
    ]);
    Storage::disk('local')->assertMissing($moment->photo_path);
});

test('reactions toggle for visible moments and stay blocked on hidden private ones', function () {
    Storage::fake('local');

    [$workspace, $owner, $ownerMember, $coparent, $coparentMember] = makeFamilyWorkspaceWithCoparent();
    $familyMoment = createMomentWithImage($workspace, $ownerMember, MomentVisibility::Family->value, 'reaction-family.jpg');
    $privateMoment = createMomentWithImage($workspace, $ownerMember, MomentVisibility::Private->value, 'reaction-private.jpg');

    $this->actingAs($coparent)
        ->post(route('moments.reactions.store', ['moment' => $familyMoment->id]), [
            'reaction' => 'heart',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('moment_reactions', [
        'moment_id' => $familyMoment->id,
        'workspace_member_id' => $coparentMember->id,
        'reaction' => 'heart',
    ]);

    $this->actingAs($coparent)
        ->post(route('moments.reactions.store', ['moment' => $familyMoment->id]), [
            'reaction' => 'heart',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('moment_reactions', [
        'moment_id' => $familyMoment->id,
        'workspace_member_id' => $coparentMember->id,
    ]);

    $this->actingAs($coparent)
        ->post(route('moments.reactions.store', ['moment' => $privateMoment->id]), [
            'reaction' => 'smile',
        ])
        ->assertForbidden();
});
