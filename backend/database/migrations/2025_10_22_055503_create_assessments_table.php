<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates assessments table to store patient cardiovascular risk assessments
     * submitted from the Juan Heart mobile application.
     */
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();

            // Mobile App User Reference
            $table->string('mobile_user_id'); // User ID from mobile app
            $table->string('session_id');
            $table->string('assessment_external_id')->unique(); // UUID from mobile app

            // Patient Basic Info (from mobile)
            $table->string('patient_first_name')->nullable();
            $table->string('patient_last_name')->nullable();
            $table->date('patient_date_of_birth')->nullable();
            $table->enum('patient_sex', ['Male', 'Female', 'Other'])->nullable();
            $table->string('patient_email')->nullable();
            $table->string('patient_phone')->nullable();

            // Assessment Metadata
            $table->timestamp('assessment_date');
            $table->string('version')->default('1.0.0'); // App version
            $table->decimal('completion_rate', 5, 2)->default(100.00);
            $table->integer('assessment_duration_minutes')->nullable();
            $table->decimal('data_quality_score', 3, 2)->nullable();

            // Location (from mobile)
            $table->string('country')->default('Philippines');
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Risk Scores (from mobile ML model)
            $table->integer('ml_risk_score')->nullable(); // 0-100 from ML model
            $table->string('ml_risk_level')->nullable(); // Low, Moderate, High
            $table->integer('rule_based_score')->nullable(); // 0-100 from rule-based
            $table->string('rule_based_level')->nullable();

            // Final Risk Assessment
            $table->integer('final_risk_score')->nullable(); // After clinical validation
            $table->enum('final_risk_level', ['Low', 'Moderate', 'High'])->nullable();
            $table->enum('urgency', ['Routine', 'Urgent', 'Emergency'])->nullable();
            $table->string('recommended_action')->nullable();

            // Assessment Data (stored as JSON for flexibility)
            $table->json('vital_signs')->nullable();
            $table->json('symptoms')->nullable();
            $table->json('medical_history')->nullable();
            $table->json('medications')->nullable();
            $table->json('lifestyle')->nullable();
            $table->json('recommendations')->nullable();

            // Clinical Validation (by web app users)
            $table->enum('status', [
                'pending',           // Awaiting clinical review
                'in_review',        // Being reviewed by clinician
                'validated',        // Clinically validated
                'requires_referral', // Needs specialist referral
                'completed',        // Assessment complete
                'rejected'          // Invalid/incomplete data
            ])->default('pending');

            $table->unsignedBigInteger('validated_by')->nullable(); // User who validated
            $table->foreign('validated_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('validated_at')->nullable();
            $table->text('validation_notes')->nullable();
            $table->boolean('validation_agrees_with_ml')->nullable();

            // Device & Technical Metadata
            $table->string('device_platform')->nullable(); // iOS, Android
            $table->string('device_version')->nullable();
            $table->string('app_version')->nullable();
            $table->decimal('model_confidence', 3, 2)->nullable();
            $table->integer('processing_time_ms')->nullable();

            // Sync & Timestamps
            $table->timestamp('mobile_created_at')->nullable(); // When created on mobile
            $table->timestamp('synced_at')->nullable(); // When synced to web
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('mobile_user_id');
            $table->index('status');
            $table->index('final_risk_level');
            $table->index('assessment_date');
            $table->index('validated_by');
            $table->index(['region', 'city']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
