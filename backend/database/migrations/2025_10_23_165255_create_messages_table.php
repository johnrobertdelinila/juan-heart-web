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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referral_id')->nullable()->constrained('referrals')->onDelete('set null');
            $table->foreignId('assessment_id')->nullable()->constrained('assessments')->onDelete('set null');
            $table->string('subject');
            $table->text('body'); // Encrypted message body
            $table->string('encryption_key')->nullable(); // For end-to-end encryption
            $table->enum('priority', ['normal', 'urgent', 'emergency'])->default('normal');
            $table->enum('type', ['direct', 'referral', 'consultation', 'alert'])->default('direct');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->foreignId('parent_message_id')->nullable()->constrained('messages')->onDelete('cascade');
            $table->boolean('is_archived')->default(false);
            $table->boolean('is_starred')->default(false);
            $table->json('metadata')->nullable(); // Additional metadata (attachments info, etc.)
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better query performance
            $table->index(['sender_id', 'created_at']);
            $table->index(['recipient_id', 'read_at', 'created_at']);
            $table->index(['referral_id']);
            $table->index(['assessment_id']);
            $table->index(['priority', 'created_at']);
        });

        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->onDelete('cascade');
            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->integer('file_size'); // in bytes
            $table->string('storage_path');
            $table->boolean('is_encrypted')->default(true);
            $table->timestamps();

            $table->index('message_id');
        });

        Schema::create('message_read_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('read_at');
            $table->string('read_from_ip')->nullable();
            $table->string('read_from_device')->nullable();
            $table->timestamps();

            $table->unique(['message_id', 'user_id']);
            $table->index('message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_read_receipts');
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('messages');
    }
};
