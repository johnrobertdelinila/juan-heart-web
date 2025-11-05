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
        Schema::table('appointments', function (Blueprint $table) {
            // Add assessment foreign key reference
            $table->unsignedBigInteger('assessment_id')->nullable()->after('referral_id');
            $table->foreign('assessment_id')
                  ->references('id')
                  ->on('assessments')
                  ->onDelete('set null');

            // Add mobile app appointment UUID for tracking
            $table->string('mobile_appointment_id')->nullable()->unique()->after('id');

            // Add index for faster queries
            $table->index('assessment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['assessment_id']);

            // Drop columns
            $table->dropColumn('assessment_id');
            $table->dropColumn('mobile_appointment_id');
        });
    }
};
