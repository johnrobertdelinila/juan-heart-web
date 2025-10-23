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
        Schema::create('referral_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_id')->constrained('referrals')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Event Details
            $table->enum('action', [
                'created',
                'assigned',
                'accepted',
                'rejected',
                'scheduled',
                'rescheduled',
                'completed',
                'cancelled',
                'escalated',
                'status_changed',
                'priority_changed',
                'notes_added',
                'attachment_added'
            ]);

            $table->string('action_description');
            $table->enum('previous_status', [
                'pending',
                'assigned',
                'accepted',
                'in_progress',
                'scheduled',
                'completed',
                'rejected',
                'cancelled',
                'expired'
            ])->nullable();

            $table->enum('new_status', [
                'pending',
                'assigned',
                'accepted',
                'in_progress',
                'scheduled',
                'completed',
                'rejected',
                'cancelled',
                'expired'
            ])->nullable();

            // Additional Context
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('created_at');

            // Indexes
            $table->index(['referral_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_history');
    }
};
