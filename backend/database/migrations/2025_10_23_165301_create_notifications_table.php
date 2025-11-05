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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', [
                'message',
                'referral',
                'assessment',
                'appointment',
                'alert',
                'system',
                'reminder'
            ]);
            $table->string('title');
            $table->text('body');
            $table->enum('priority', ['low', 'normal', 'high', 'critical'])->default('normal');
            $table->json('data')->nullable(); // Additional payload data
            $table->string('action_url')->nullable(); // Link to related resource
            $table->timestamp('read_at')->nullable();
            $table->timestamp('acted_upon_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->foreignId('related_message_id')->nullable()->constrained('messages')->onDelete('cascade');
            $table->foreignId('related_referral_id')->nullable()->constrained('referrals')->onDelete('cascade');
            $table->foreignId('related_assessment_id')->nullable()->constrained('assessments')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'read_at', 'created_at']);
            $table->index(['type', 'priority', 'created_at']);
            $table->index('related_message_id');
            $table->index('related_referral_id');
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('channel', ['email', 'sms', 'push', 'in_app'])->default('in_app');
            $table->enum('notification_type', [
                'message',
                'referral',
                'assessment',
                'appointment',
                'alert',
                'system',
                'reminder'
            ]);
            $table->boolean('is_enabled')->default(true);
            $table->json('settings')->nullable(); // Custom settings per type/channel
            $table->timestamps();

            $table->unique(['user_id', 'channel', 'notification_type'], 'notif_pref_user_channel_type_unique');
            $table->index('user_id');
        });

        Schema::create('emergency_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->enum('severity', ['info', 'warning', 'critical', 'emergency'])->default('info');
            $table->enum('target_audience', ['all', 'doctors', 'nurses', 'admins', 'facility_specific']);
            $table->foreignId('target_facility_id')->nullable()->constrained('healthcare_facilities')->onDelete('cascade');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('recipients_count')->default(0);
            $table->integer('acknowledged_count')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'created_at']);
            $table->index('severity');
        });

        Schema::create('emergency_alert_acknowledgments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alert_id')->constrained('emergency_alerts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('acknowledged_at');
            $table->string('acknowledgment_ip')->nullable();
            $table->timestamps();

            $table->unique(['alert_id', 'user_id']);
            $table->index('alert_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_alert_acknowledgments');
        Schema::dropIfExists('emergency_alerts');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notifications');
    }
};
