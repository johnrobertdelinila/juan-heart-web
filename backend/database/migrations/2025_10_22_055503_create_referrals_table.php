<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates referrals table for managing patient referrals between healthcare facilities
     * based on risk assessment results from the mobile app.
     */
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id');
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Patient Information (duplicated for quick access)
            $table->string('patient_first_name');
            $table->string('patient_last_name');
            $table->date('patient_date_of_birth')->nullable();
            $table->enum('patient_sex', ['Male', 'Female', 'Other'])->nullable();
            $table->string('patient_phone')->nullable();

            // Facility Information
            $table->unsignedBigInteger('source_facility_id')->nullable();
            $table->foreign('source_facility_id')->references('id')->on('healthcare_facilities')->onDelete('set null');

            $table->unsignedBigInteger('target_facility_id');
            $table->foreign('target_facility_id')->references('id')->on('healthcare_facilities')->onDelete('cascade');

            // Healthcare Staff
            $table->unsignedBigInteger('referring_user_id')->nullable(); // Web app user who created referral
            $table->foreign('referring_user_id')->references('id')->on('users')->onDelete('set null');

            $table->unsignedBigInteger('assigned_doctor_id')->nullable(); // Doctor at target facility
            $table->foreign('assigned_doctor_id')->references('id')->on('users')->onDelete('set null');

            // Referral Details
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->enum('urgency', ['Routine', 'Urgent', 'Emergency'])->default('Routine');
            $table->string('referral_type')->nullable(); // e.g., "High Risk CVD", "Emergency Care"
            $table->text('chief_complaint')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->json('required_services')->nullable(); // ["Cardiology", "Laboratory", "ECG"]

            // Status Tracking
            $table->enum('status', [
                'pending',        // Created, awaiting target facility response
                'accepted',       // Target facility accepted
                'in_transit',     // Patient is being transferred
                'arrived',        // Patient arrived at target facility
                'in_progress',    // Being treated
                'completed',      // Treatment completed
                'rejected',       // Target facility rejected
                'cancelled'       // Referral cancelled
            ])->default('pending');

            $table->text('status_notes')->nullable(); // Reason for rejection/cancellation
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Appointment
            $table->timestamp('scheduled_appointment')->nullable();
            $table->text('appointment_notes')->nullable();

            // Transportation
            $table->enum('transport_method', ['Ambulance', 'Private', 'Public', 'Walk-in', 'Other'])->nullable();
            $table->text('transport_notes')->nullable();
            $table->decimal('estimated_travel_time_minutes', 8, 2)->nullable();

            // Documents
            $table->string('referral_letter_path')->nullable(); // PDF path
            $table->json('attached_documents')->nullable(); // Additional documents
            $table->boolean('records_transferred')->default(false);

            // Follow-up
            $table->boolean('requires_follow_up')->default(false);
            $table->timestamp('follow_up_date')->nullable();
            $table->text('follow_up_notes')->nullable();

            // Outcome
            $table->text('treatment_summary')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('outcome', ['Improved', 'Stable', 'Deteriorated', 'Deceased', 'Unknown'])->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('assessment_id');
            $table->index('status');
            $table->index('priority');
            $table->index(['target_facility_id', 'status']);
            $table->index(['source_facility_id', 'status']);
            $table->index('scheduled_appointment');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
