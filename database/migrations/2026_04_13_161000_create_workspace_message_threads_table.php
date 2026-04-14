<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_message_threads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by_member_id')->constrained('workspace_members')->cascadeOnDelete();
            $table->string('subject', 140);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'last_message_at']);
        });

        Schema::create('workspace_message_thread_members', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_message_thread_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workspace_member_id')->constrained()->cascadeOnDelete();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['workspace_message_thread_id', 'workspace_member_id'], 'workspace_message_thread_member_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_message_thread_members');
        Schema::dropIfExists('workspace_message_threads');
    }
};
