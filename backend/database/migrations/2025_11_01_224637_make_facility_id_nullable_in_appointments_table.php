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
            // facility_id is already nullable, just ensure foreign key is set to null on delete
            // Check if foreign key exists before dropping
            try {
                $table->dropForeign(['facility_id']);
            } catch (\Exception $e) {
                // Foreign key doesn't exist, continue
            }

            // Re-add foreign key constraint with nullable support
            $table->foreign('facility_id')
                  ->references('id')
                  ->on('healthcare_facilities')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Drop the updated foreign key
            try {
                $table->dropForeign(['facility_id']);
            } catch (\Exception $e) {
                // Foreign key doesn't exist, continue
            }

            // Re-add the original foreign key constraint
            $table->foreign('facility_id')
                  ->references('id')
                  ->on('healthcare_facilities')
                  ->onDelete('cascade');
        });
    }
};
