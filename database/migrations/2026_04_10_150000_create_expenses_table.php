<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('child_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by_member_id')->constrained('workspace_members')->cascadeOnDelete();
            $table->foreignId('shared_with_member_id')->constrained('workspace_members')->cascadeOnDelete();
            $table->foreignId('accepted_by_member_id')->nullable()->constrained('workspace_members')->nullOnDelete();
            $table->string('currency', 3)->default('USD');
            $table->unsignedInteger('amount_cents');
            $table->string('category', 40);
            $table->date('expense_date');
            $table->string('description', 255)->nullable();
            $table->unsignedTinyInteger('other_party_share_percentage')->default(50);
            $table->string('status', 20)->default('pending');
            $table->string('receipt_path')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->index(['workspace_id', 'status']);
            $table->index(['workspace_id', 'expense_date']);
            $table->index(['created_by_member_id', 'shared_with_member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
