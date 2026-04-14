<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspace_messages', function (Blueprint $table): void {
            $table->foreignId('workspace_message_thread_id')->nullable()->after('workspace_id')->constrained()->cascadeOnDelete();
            $table->index(['workspace_message_thread_id', 'created_at'], 'workspace_message_thread_created_at_index');
        });

        $existingWorkspaceIds = DB::table('workspace_messages')
            ->select('workspace_id')
            ->distinct()
            ->pluck('workspace_id');

        foreach ($existingWorkspaceIds as $workspaceId) {
            $ownerMemberId = DB::table('workspace_members')
                ->where('workspace_id', $workspaceId)
                ->orderByRaw("CASE WHEN role = 'owner' THEN 0 ELSE 1 END")
                ->value('id');

            if ($ownerMemberId === null) {
                continue;
            }

            $threadId = DB::table('workspace_message_threads')->insertGetId([
                'workspace_id' => $workspaceId,
                'created_by_member_id' => $ownerMemberId,
                'subject' => 'General',
                'last_message_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $memberIds = DB::table('workspace_members')
                ->where('workspace_id', $workspaceId)
                ->pluck('id');

            foreach ($memberIds as $memberId) {
                DB::table('workspace_message_thread_members')->insert([
                    'workspace_message_thread_id' => $threadId,
                    'workspace_member_id' => $memberId,
                    'last_read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('workspace_messages')
                ->where('workspace_id', $workspaceId)
                ->update(['workspace_message_thread_id' => $threadId]);
        }
    }

    public function down(): void
    {
        Schema::table('workspace_messages', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('workspace_message_thread_id');
            $table->dropIndex('workspace_message_thread_created_at_index');
        });
    }
};
