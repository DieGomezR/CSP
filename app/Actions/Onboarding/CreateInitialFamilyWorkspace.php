<?php

namespace App\Actions\Onboarding;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateInitialFamilyWorkspace
{
    /**
     * @param  array{
     *     family_name:string,
     *     timezone:string,
     *     children:array<int, array{name:string, birthdate?:string|null, color:string}>
     * }  $payload
     */
    public function handle(User $user, array $payload): Workspace
    {
        return DB::transaction(function () use ($user, $payload) {
            $workspace = Workspace::create([
                'name' => $payload['family_name'],
                'slug' => $this->generateUniqueSlug($payload['family_name']),
                'type' => 'family',
                'timezone' => $payload['timezone'],
                'owner_id' => $user->id,
                'settings' => [
                    'onboarding_version' => 1,
                    'onboarding_completed_at' => now()->toIso8601String(),
                    'household_name' => $payload['family_name'],
                    'custody_schedule' => [
                        'completed_at' => null,
                        'children_ids' => [],
                        'starting_parent_member_id' => null,
                        'start_date' => null,
                        'generate_until' => '1 year',
                        'end_date' => null,
                        'exchange_day' => 'Sunday',
                        'exchange_time' => '18:00',
                        'school_calendar' => null,
                    ],
                ],
            ]);

            WorkspaceMember::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'active',
                'notification_preferences' => [
                    'email' => true,
                    'sms' => false,
                ],
                'joined_at' => now(),
                'last_seen_at' => now(),
            ]);

            foreach ($payload['children'] as $child) {
                $workspace->children()->create([
                    'name' => $child['name'],
                    'color' => $child['color'],
                    'birthdate' => $child['birthdate'] ?: null,
                ]);
            }

            return $workspace;
        });
    }

    private function generateUniqueSlug(string $familyName): string
    {
        $baseSlug = Str::slug($familyName);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'family';
        $slug = $baseSlug;
        $suffix = 2;

        while (Workspace::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
