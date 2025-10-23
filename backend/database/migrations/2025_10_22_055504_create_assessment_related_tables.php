<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates supplementary tables for detailed assessment data tracking.
     * These tables provide normalized storage for clinical validation workflow
     * and detailed tracking of assessment changes.
     */
    public function up(): void
    {
        // Clinical Validations Table
        Schema::create('clinical_validations', function (Blueprint $table) {
            $table->id();

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id');
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Validator Information
            $table->unsignedBigInteger('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');

            // Validation Details
            $table->integer('original_ml_score')->nullable(); // ML model score before validation
            $table->string('original_ml_level')->nullable(); // Low, Moderate, High
            $table->integer('validated_score'); // Clinician's final score
            $table->enum('validated_level', ['Low', 'Moderate', 'High']);

            // Agreement Tracking
            $table->enum('agreement_level', [
                'complete_agreement',     // Clinician fully agrees with ML
                'partial_agreement',      // Minor adjustments
                'significant_difference', // Major score change
                'complete_disagreement'   // Opposite assessment
            ])->nullable();
            $table->integer('score_difference')->nullable(); // Validated - ML score

            // Clinical Assessment
            $table->text('clinical_notes'); // Required notes explaining validation
            $table->json('additional_tests_required')->nullable(); // ["ECG", "Blood Test", "Stress Test"]
            $table->text('recommendations'); // Clinical recommendations
            $table->boolean('requires_immediate_attention')->default(false);

            // Follow-up
            $table->boolean('requires_follow_up')->default(false);
            $table->integer('follow_up_days')->nullable();
            $table->text('follow_up_instructions')->nullable();

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('assessment_id');
            $table->index('doctor_id');
            $table->index('agreement_level');
            $table->index('validated_level');
            $table->index('created_at');
        });

        // Assessment Comments Table
        Schema::create('assessment_comments', function (Blueprint $table) {
            $table->id();

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id');
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Comment Author
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Comment Details
            $table->text('comment');
            $table->enum('comment_type', [
                'general',
                'clinical_note',
                'question',
                'concern',
                'recommendation'
            ])->default('general');
            $table->enum('visibility', ['private', 'internal', 'shared'])->default('internal');

            // Reply Thread
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('assessment_comments')->onDelete('cascade');

            // Status
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('assessment_id');
            $table->index('user_id');
            $table->index('parent_id');
            $table->index('created_at');
        });

        // Assessment Attachments Table
        Schema::create('assessment_attachments', function (Blueprint $table) {
            $table->id();

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id');
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Uploader
            $table->unsignedBigInteger('uploaded_by');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');

            // File Information
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type'); // image, pdf, document, ecg_data, lab_result
            $table->string('mime_type');
            $table->integer('file_size'); // in bytes
            $table->text('description')->nullable();

            // Medical Document Classification
            $table->enum('document_type', [
                'lab_result',
                'ecg_report',
                'imaging',
                'prescription',
                'medical_certificate',
                'referral_letter',
                'other'
            ])->nullable();

            // Privacy
            $table->boolean('is_sensitive')->default(true);
            $table->json('access_permissions')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('assessment_id');
            $table->index('uploaded_by');
            $table->index('file_type');
            $table->index('document_type');
        });

        // Assessment Status History Table
        Schema::create('assessment_status_history', function (Blueprint $table) {
            $table->id();

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id');
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Status Change
            $table->string('old_status')->nullable();
            $table->string('new_status');
            $table->text('change_reason')->nullable();

            // Changed By
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');

            // Additional Context
            $table->json('metadata')->nullable(); // Additional context data

            // Timestamp
            $table->timestamp('changed_at');

            // Indexes
            $table->index('assessment_id');
            $table->index('changed_by');
            $table->index('changed_at');
        });

        // Assessment Notifications Table
        Schema::create('assessment_notifications', function (Blueprint $table) {
            $table->id();

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id');
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Recipient
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Notification Details
            $table->string('notification_type'); // new_assessment, validation_required, high_risk_alert, etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional data

            // Delivery
            $table->enum('channel', ['in_app', 'email', 'sms', 'push'])->default('in_app');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_sent')->default(false);
            $table->timestamp('sent_at')->nullable();

            // Priority
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('assessment_id');
            $table->index('user_id');
            $table->index('is_read');
            $table->index('notification_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_notifications');
        Schema::dropIfExists('assessment_status_history');
        Schema::dropIfExists('assessment_attachments');
        Schema::dropIfExists('assessment_comments');
        Schema::dropIfExists('clinical_validations');
    }
};
