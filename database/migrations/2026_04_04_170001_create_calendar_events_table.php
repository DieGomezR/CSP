<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('creator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 120);
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('timezone', 64);
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at')->nullable();
            $table->boolean('is_all_day')->default(false);
            $table->string('color', 7)->default('#4DBFAE');
            $table->string('recurrence_type', 24)->nullable();
            $table->unsignedSmallInteger('recurrence_interval')->nullable();
            $table->json('recurrence_days_of_week')->nullable();
            $table->timestampTz('recurrence_until')->nullable();
            $table->string('status', 24)->default('confirmed');
            $table->string('source', 24)->default('manual');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'starts_at']);
            $table->index(['workspace_id', 'recurrence_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
