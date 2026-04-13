<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mediation_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by_member_id')->constrained('workspace_members')->cascadeOnDelete();
            $table->string('subject', 180);
            $table->string('status', 32)->index();
            $table->text('resolved_reason')->nullable();
            $table->text('canceled_reason')->nullable();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('closed_at')->nullable()->index();
            $table->timestamp('last_message_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mediation_sessions');
    }
};
