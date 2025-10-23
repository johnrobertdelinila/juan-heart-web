<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates healthcare_facilities table for managing hospitals, clinics, and health centers
     * in the Juan Heart referral network.
     */
    public function up(): void
    {
        Schema::create('healthcare_facilities', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('code')->unique()->nullable(); // e.g., PHC, PGH, VSMMC
            $table->enum('type', [
                'Barangay Health Center',
                'Rural Health Unit',
                'Primary Care Clinic',
                'District Hospital',
                'Provincial Hospital',
                'Regional Hospital',
                'Tertiary Hospital',
                'Medical Center',
                'Specialty Center',
                'Emergency Facility'
            ]);
            $table->enum('level', ['primary', 'secondary', 'tertiary'])->nullable();

            // Contact Information
            $table->text('address')->nullable();
            $table->string('city');
            $table->string('province')->nullable();
            $table->string('region');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();

            // Location
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Operating Details
            $table->json('operating_hours')->nullable(); // {"monday": {"open": "08:00", "close": "17:00"}, ...}
            $table->boolean('is_24_7')->default(false);
            $table->boolean('has_emergency')->default(false);

            // Services & Capacity
            $table->json('services')->nullable(); // ["Cardiology", "Emergency Care", "Laboratory"]
            $table->integer('bed_capacity')->nullable();
            $table->integer('icu_capacity')->nullable();
            $table->integer('current_bed_availability')->nullable();

            // Accreditation & Classification
            $table->boolean('is_public')->default(true);
            $table->boolean('is_doh_accredited')->default(false);
            $table->boolean('is_philhealth_accredited')->default(false);
            $table->json('accreditations')->nullable(); // Other accreditations

            // Referral Network
            $table->boolean('accepts_referrals')->default(true);
            $table->integer('average_response_time_hours')->nullable();
            $table->json('preferred_referral_types')->nullable(); // ["High Risk CVD", "Emergency Cases"]

            // Status
            $table->boolean('is_active')->default(true);
            $table->string('status_notes')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['city', 'region']);
            $table->index('type');
            $table->index('is_active');
            $table->index(['latitude', 'longitude']); // For geographic queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('healthcare_facilities');
    }
};
