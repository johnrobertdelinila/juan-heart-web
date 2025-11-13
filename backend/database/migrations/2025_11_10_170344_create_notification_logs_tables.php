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
        // SMS delivery logs (for mock and production drivers)
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('phone', 20);
            $table->string('subject');
            $table->text('message');
            $table->json('data')->nullable();
            $table->enum('driver', ['mock', 'twilio'])->default('mock');
            $table->enum('status', ['queued', 'sent', 'delivered', 'failed'])->default('sent');
            $table->string('external_id')->nullable(); // Twilio SID or other provider ID
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('external_id');
        });

        // Push notification delivery logs (for mock and production drivers)
        Schema::create('push_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->enum('driver', ['mock', 'firebase'])->default('mock');
            $table->enum('status', ['queued', 'sent', 'delivered', 'failed'])->default('sent');
            $table->enum('platform', ['web', 'ios', 'android'])->default('web');
            $table->string('device_token')->nullable();
            $table->string('external_id')->nullable(); // Firebase message ID or other provider ID
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index(['platform', 'created_at']);
            $table->index('external_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_notification_logs');
        Schema::dropIfExists('sms_logs');
    }
};
