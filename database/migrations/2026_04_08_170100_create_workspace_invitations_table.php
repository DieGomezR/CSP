<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('email');
            $table->string('role')->default('coparent');
            $table->string('status')->default('pending');
            $table->string('token', 80)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'status']);
            $table->unique(['workspace_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_invitations');
    }
};
