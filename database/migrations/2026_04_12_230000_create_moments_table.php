<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by_member_id')->constrained('workspace_members')->cascadeOnDelete();
            $table->string('visibility', 24);
            $table->string('photo_path');
            $table->string('photo_original_name');
            $table->string('photo_mime_type', 120);
            $table->unsignedBigInteger('photo_size_bytes')->default(0);
            $table->text('caption')->nullable();
            $table->date('taken_on')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'visibility']);
            $table->index(['workspace_id', 'created_by_member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moments');
    }
};
