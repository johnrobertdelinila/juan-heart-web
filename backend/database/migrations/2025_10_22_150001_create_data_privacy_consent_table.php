<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates data_privacy_consent table to track user consent for data usage.
     * This is CRITICAL for compliance with Philippine Data Privacy Act and GDPR.
     */
    public function up(): void
    {
        Schema::create('data_privacy_consent', function (Blueprint $table) {
            $table->id();

            // User Reference (from mobile app)
            $table->string('mobile_user_id')
                ->comment('User ID from mobile app');

            // Assessment Reference
            $table->unsignedBigInteger('assessment_id')->nullable();
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');

            // Consent Status
            $table->boolean('consent_given')->default(false)
                ->comment('Whether user has given consent for data collection');
            $table->timestamp('consent_date')->nullable()
                ->comment('Date and time when consent was given');
            $table->timestamp('consent_withdrawn_date')->nullable()
                ->comment('Date and time when consent was withdrawn (if applicable)');
            $table->string('consent_version')->default('1.0')
                ->comment('Version of privacy policy user consented to');

            // Data Sharing Preferences
            $table->boolean('share_with_healthcare_providers')->default(false)
                ->comment('Allow sharing with healthcare providers');
            $table->boolean('share_for_research')->default(false)
                ->comment('Allow use for medical research (anonymized)');
            $table->boolean('share_anonymized_data')->default(false)
                ->comment('Allow sharing anonymized data for public health studies');

            // Retention Policy
            $table->integer('retention_period_years')->default(7)
                ->comment('How long to retain user data (default 7 years)');
            $table->timestamp('data_deletion_scheduled')->nullable()
                ->comment('Scheduled date for data deletion (if requested)');

            // Communication Preferences
            $table->boolean('allow_email_communication')->default(true);
            $table->boolean('allow_sms_communication')->default(true);
            $table->boolean('allow_push_notifications')->default(true);

            // Compliance
            $table->boolean('gdpr_compliant')->default(true)
                ->comment('Follows GDPR principles');
            $table->boolean('data_privacy_act_compliant')->default(true)
                ->comment('Complies with Philippine Data Privacy Act');
            $table->text('consent_ip_address')->nullable()
                ->comment('IP address when consent was given (for audit trail)');
            $table->text('consent_device_info')->nullable()
                ->comment('Device information when consent was given');

            // Audit Trail
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('mobile_user_id');
            $table->index('assessment_id');
            $table->index('consent_given');
            $table->index('consent_date');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_privacy_consent');
    }
};
