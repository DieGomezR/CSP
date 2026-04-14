<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workspace_member_id')->constrained()->cascadeOnDelete();
            $table->string('client_request_id', 120)->nullable();
            $table->text('body');
            $table->timestamps();

            $table->index(['workspace_id', 'created_at']);
            $table->unique(['workspace_member_id', 'client_request_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_messages');
    }
};
