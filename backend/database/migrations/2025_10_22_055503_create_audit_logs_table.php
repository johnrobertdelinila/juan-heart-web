<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates audit_logs table for comprehensive tracking of all user actions,
     * data access, and system events for compliance and security monitoring.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // User & Session Information
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->string('user_email')->nullable(); // Stored for historical record
            $table->string('user_role')->nullable(); // Role at time of action
            $table->string('session_id')->nullable();

            // Action Details
            $table->string('event_type'); // create, read, update, delete, login, logout, export, etc.
            $table->string('event_category'); // authentication, assessment, referral, facility, user_management, etc.
            $table->string('action_description'); // Human-readable description
            $table->string('ip_address', 45)->nullable(); // IPv4 or IPv6
            $table->text('user_agent')->nullable();

            // Resource Information
            $table->string('model_type')->nullable(); // e.g., "App\Models\Assessment"
            $table->unsignedBigInteger('model_id')->nullable(); // ID of the affected resource
            $table->json('old_values')->nullable(); // Before state for updates/deletes
            $table->json('new_values')->nullable(); // After state for creates/updates

            // Request Information
            $table->string('http_method')->nullable(); // GET, POST, PUT, DELETE, etc.
            $table->text('url')->nullable();
            $table->json('request_data')->nullable(); // Sanitized request payload
            $table->integer('response_code')->nullable(); // HTTP status code
            $table->text('response_message')->nullable();

            // Security & Compliance
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->boolean('is_sensitive')->default(false); // Patient data access
            $table->boolean('is_suspicious')->default(false); // Flagged for review
            $table->boolean('requires_review')->default(false);
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');

            // Data Privacy Tracking
            $table->boolean('contains_pii')->default(false); // Personally Identifiable Information
            $table->boolean('contains_phi')->default(false); // Protected Health Information
            $table->string('data_classification')->nullable(); // public, internal, confidential, restricted

            // Performance Metrics
            $table->integer('execution_time_ms')->nullable();
            $table->integer('memory_usage_mb')->nullable();
            $table->integer('query_count')->nullable();

            // Context
            $table->string('facility_id')->nullable(); // Facility context if applicable
            $table->json('tags')->nullable(); // For categorization and searching
            $table->json('metadata')->nullable(); // Additional context

            // Timestamps
            $table->timestamp('created_at')->nullable();

            // Indexes for performance
            $table->index('user_id');
            $table->index('event_type');
            $table->index('event_category');
            $table->index(['model_type', 'model_id']);
            $table->index('created_at');
            $table->index('ip_address');
            $table->index('severity');
            $table->index('is_suspicious');
            $table->index('requires_review');
            $table->index(['contains_pii', 'contains_phi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
