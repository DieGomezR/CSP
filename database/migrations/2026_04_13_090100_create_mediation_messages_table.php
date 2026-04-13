<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mediation_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('mediation_session_id')->constrained('mediation_sessions')->cascadeOnDelete();
            $table->foreignId('workspace_member_id')->nullable()->constrained('workspace_members')->nullOnDelete();
            $table->foreignId('response_to_message_id')->nullable()->constrained('mediation_messages')->nullOnDelete();
            $table->string('role', 32);
            $table->string('kind', 64);
            $table->text('body');
            $table->uuid('client_request_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['mediation_session_id', 'client_request_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mediation_messages');
    }
};
