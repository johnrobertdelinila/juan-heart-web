<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the appointments table and related tables for scheduling system.
     */
    public function up(): void
    {
        // Main Appointments Table
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            // Referral Reference (optional - can be direct booking or from referral)
            $table->unsignedBigInteger('referral_id')->nullable();
            $table->foreign('referral_id')->references('id')->on('referrals')->onDelete('set null');

            // Patient Information
            $table->string('patient_first_name');
            $table->string('patient_last_name');
            $table->string('patient_email')->nullable();
            $table->string('patient_phone');
            $table->date('patient_date_of_birth')->nullable();

            // Appointment Details
            $table->unsignedBigInteger('facility_id');
            $table->foreign('facility_id')->references('id')->on('healthcare_facilities')->onDelete('cascade');

            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('set null');

            $table->dateTime('appointment_datetime');
            $table->integer('duration_minutes')->default(30); // Default 30-minute slot
            $table->dateTime('appointment_end_datetime')->storedAs('DATE_ADD(appointment_datetime, INTERVAL duration_minutes MINUTE)');

            // Appointment Type
            $table->enum('appointment_type', [
                'consultation',
                'follow_up',
                'procedure',
                'emergency',
                'telemedicine',
                'screening',
                'other'
            ])->default('consultation');

            $table->string('department')->nullable(); // Cardiology, General Medicine, etc.
            $table->text('reason_for_visit');
            $table->text('special_requirements')->nullable(); // Wheelchair access, interpreter, etc.

            // Status Tracking
            $table->enum('status', [
                'scheduled',
                'confirmed',
                'checked_in',
                'in_progress',
                'completed',
                'cancelled',
                'no_show',
                'rescheduled'
            ])->default('scheduled');

            $table->text('status_notes')->nullable();

            // Confirmation
            $table->boolean('is_confirmed')->default(false);
            $table->timestamp('confirmed_at')->nullable();
            $table->string('confirmation_method')->nullable(); // email, sms, phone, in_person

            // Check-in
            $table->timestamp('checked_in_at')->nullable();
            $table->unsignedBigInteger('checked_in_by')->nullable();
            $table->foreign('checked_in_by')->references('id')->on('users')->onDelete('set null');

            // Completion
            $table->timestamp('completed_at')->nullable();
            $table->text('visit_summary')->nullable();
            $table->text('next_steps')->nullable();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->foreign('cancelled_by')->references('id')->on('users')->onDelete('set null');
            $table->text('cancellation_reason')->nullable();

            // Rescheduling
            $table->unsignedBigInteger('rescheduled_from')->nullable(); // Original appointment ID
            $table->foreign('rescheduled_from')->references('id')->on('appointments')->onDelete('set null');
            $table->timestamp('rescheduled_at')->nullable();

            // Reminders
            $table->boolean('reminder_sent')->default(false);
            $table->timestamp('reminder_sent_at')->nullable();
            $table->json('reminder_preferences')->nullable(); // {email: true, sms: true, days_before: [7, 1]}

            // Booking Information
            $table->unsignedBigInteger('booked_by')->nullable(); // User who created the appointment
            $table->foreign('booked_by')->references('id')->on('users')->onDelete('set null');
            $table->string('booking_source')->nullable(); // web, mobile, phone, walk_in

            // Waiting List
            $table->boolean('from_waiting_list')->default(false);
            $table->integer('waiting_list_position')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('referral_id');
            $table->index('facility_id');
            $table->index('doctor_id');
            $table->index('appointment_datetime');
            $table->index('status');
            $table->index(['facility_id', 'doctor_id', 'appointment_datetime']);
            $table->index('patient_phone');
            $table->index('patient_email');
            $table->index('created_at');
        });

        // Appointment Waiting List Table
        Schema::create('appointment_waiting_list', function (Blueprint $table) {
            $table->id();

            // Patient Information
            $table->string('patient_first_name');
            $table->string('patient_last_name');
            $table->string('patient_email')->nullable();
            $table->string('patient_phone');
            $table->date('patient_date_of_birth')->nullable();

            // Facility and Doctor Preferences
            $table->unsignedBigInteger('facility_id');
            $table->foreign('facility_id')->references('id')->on('healthcare_facilities')->onDelete('cascade');

            $table->unsignedBigInteger('preferred_doctor_id')->nullable();
            $table->foreign('preferred_doctor_id')->references('id')->on('users')->onDelete('set null');

            // Preferences
            $table->text('reason_for_visit');
            $table->date('preferred_date_from')->nullable();
            $table->date('preferred_date_to')->nullable();
            $table->json('preferred_time_slots')->nullable(); // ["morning", "afternoon", "evening"]
            $table->json('preferred_days_of_week')->nullable(); // [1,2,3,4,5] Monday-Friday

            // Priority
            $table->enum('priority', ['Low', 'Medium', 'High', 'Urgent'])->default('Medium');
            $table->text('priority_reason')->nullable();

            // Status
            $table->enum('status', [
                'active',
                'contacted',
                'scheduled',
                'cancelled',
                'expired'
            ])->default('active');

            $table->integer('position')->nullable(); // Position in queue
            $table->integer('days_waiting')->nullable(); // Calculated in application code

            // Contact Attempts
            $table->integer('contact_attempts')->default(0);
            $table->timestamp('last_contacted_at')->nullable();
            $table->text('contact_notes')->nullable();

            // Conversion
            $table->unsignedBigInteger('appointment_id')->nullable(); // When scheduled
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('set null');
            $table->timestamp('scheduled_at')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('facility_id');
            $table->index('preferred_doctor_id');
            $table->index('status');
            $table->index('priority');
            $table->index('position');
            $table->index('created_at');
        });

        // Doctor Availability Schedule Table
        Schema::create('doctor_availability', function (Blueprint $table) {
            $table->id();

            // Doctor Reference
            $table->unsignedBigInteger('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');

            // Facility Reference
            $table->unsignedBigInteger('facility_id');
            $table->foreign('facility_id')->references('id')->on('healthcare_facilities')->onDelete('cascade');

            // Schedule Type
            $table->enum('schedule_type', [
                'regular',     // Recurring weekly schedule
                'specific',    // Specific date/time
                'blocked'      // Blocked time (unavailable)
            ])->default('regular');

            // For Regular Schedule
            $table->integer('day_of_week')->nullable(); // 1=Monday, 7=Sunday
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // For Specific Date Schedule
            $table->date('specific_date')->nullable();
            $table->time('specific_start_time')->nullable();
            $table->time('specific_end_time')->nullable();

            // Slot Configuration
            $table->integer('slot_duration_minutes')->default(30);
            $table->integer('buffer_time_minutes')->default(0); // Break between appointments
            $table->integer('max_patients_per_slot')->default(1);

            // Availability Status
            $table->boolean('is_available')->default(true);
            $table->text('unavailability_reason')->nullable(); // vacation, sick leave, conference, etc.

            // Effective Period
            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('doctor_id');
            $table->index('facility_id');
            $table->index('day_of_week');
            $table->index('specific_date');
            $table->index(['doctor_id', 'facility_id', 'day_of_week']);
        });

        // Appointment Reminders Log Table
        Schema::create('appointment_reminders', function (Blueprint $table) {
            $table->id();

            // Appointment Reference
            $table->unsignedBigInteger('appointment_id');
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');

            // Reminder Details
            $table->enum('reminder_type', [
                'initial_confirmation',
                '7_days_before',
                '3_days_before',
                '1_day_before',
                'same_day',
                'custom'
            ]);

            $table->enum('channel', ['email', 'sms', 'push', 'phone'])->default('email');
            $table->timestamp('scheduled_for');

            // Status
            $table->enum('status', [
                'pending',
                'sent',
                'failed',
                'cancelled'
            ])->default('pending');

            $table->timestamp('sent_at')->nullable();
            $table->text('failure_reason')->nullable();

            // Message Content
            $table->text('message_content')->nullable();
            $table->string('recipient')->nullable(); // Email or phone number

            // Response Tracking
            $table->boolean('patient_responded')->default(false);
            $table->timestamp('responded_at')->nullable();
            $table->text('response_note')->nullable();

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('appointment_id');
            $table->index('scheduled_for');
            $table->index('status');
            $table->index('sent_at');
        });

        // Appointment Notes Table
        Schema::create('appointment_notes', function (Blueprint $table) {
            $table->id();

            // Appointment Reference
            $table->unsignedBigInteger('appointment_id');
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');

            // Author
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Note Details
            $table->enum('note_type', [
                'clinical',
                'administrative',
                'billing',
                'follow_up',
                'other'
            ])->default('clinical');

            $table->text('note_content');
            $table->boolean('is_private')->default(false); // Only visible to doctor

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('appointment_id');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_notes');
        Schema::dropIfExists('appointment_reminders');
        Schema::dropIfExists('doctor_availability');
        Schema::dropIfExists('appointment_waiting_list');
        Schema::dropIfExists('appointments');
    }
};
