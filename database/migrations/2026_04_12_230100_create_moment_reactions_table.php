<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moment_reactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('moment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workspace_member_id')->constrained()->cascadeOnDelete();
            $table->string('reaction', 32);
            $table->timestamps();

            $table->unique(['moment_id', 'workspace_member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moment_reactions');
    }
};
