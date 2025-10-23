<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Enhances assessments table to fully support mobile app data structure.
     * Adds missing fields from mobile schema to ensure seamless data synchronization.
     */
    public function up(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            // Add missing risk assessment fields (from mobile assessment_results table)
            $table->integer('likelihood_score')->nullable()->after('ml_risk_score')
                ->comment('Likelihood score 1-5 from mobile risk matrix');
            $table->string('likelihood_level')->nullable()->after('likelihood_score')
                ->comment('Rare/Unlikely/Possible/Probable/Almost Certain');
            $table->integer('impact_score')->nullable()->after('likelihood_level')
                ->comment('Impact score 1-5 from mobile risk matrix');
            $table->string('impact_level')->nullable()->after('impact_score')
                ->comment('Negligible/Minor/Moderate/Major/Severe');
            $table->string('color_code')->nullable()->after('final_risk_level')
                ->comment('Risk color indicator from mobile (e.g., 🟢 Green, 🟠 Yellow-orange)');
            $table->string('timeframe')->nullable()->after('urgency')
                ->comment('Recommended action timeframe (e.g., 24-48 hours, immediately)');
            $table->decimal('confidence_level', 3, 2)->nullable()->after('model_confidence')
                ->comment('Overall confidence in risk assessment (0.00-1.00)');

            // Add missing metadata fields (from mobile assessment_metadata table)
            $table->string('screen_resolution')->nullable()->after('device_version')
                ->comment('Mobile device screen resolution');
            $table->integer('gps_accuracy_meters')->nullable()->after('longitude')
                ->comment('GPS accuracy in meters for location data');
            $table->string('location_source')->nullable()->after('gps_accuracy_meters')
                ->comment('Source of location data (gps/network/manual)');
            $table->string('api_version')->nullable()->after('app_version')
                ->comment('Backend API version used by mobile app');
            $table->string('algorithm_version')->nullable()->after('version')
                ->comment('Risk assessment algorithm version');
            $table->string('timezone')->nullable()->after('assessment_date')
                ->comment('Timezone of assessment (e.g., Asia/Manila)');

            // Add user profile fields (for cases where user data comes from mobile)
            $table->string('language_preference', 10)->nullable()->after('patient_phone')
                ->comment('User language preference (en/fil)');

            // Add follow-up tracking
            $table->timestamp('next_assessment_recommended')->nullable()->after('validated_at')
                ->comment('Recommended date for next assessment');
            $table->json('reminder_settings')->nullable()->after('next_assessment_recommended')
                ->comment('Reminder preferences from mobile app');
            $table->json('care_team')->nullable()->after('recommendations')
                ->comment('Assigned care team information from mobile');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn([
                'likelihood_score',
                'likelihood_level',
                'impact_score',
                'impact_level',
                'color_code',
                'timeframe',
                'confidence_level',
                'screen_resolution',
                'gps_accuracy_meters',
                'location_source',
                'api_version',
                'algorithm_version',
                'timezone',
                'language_preference',
                'next_assessment_recommended',
                'reminder_settings',
                'care_team'
            ]);
        });
    }
};
