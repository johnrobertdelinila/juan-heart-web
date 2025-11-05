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
        Schema::table('healthcare_facilities', function (Blueprint $table) {
            $table->boolean('is_verified')->default(true)->after('is_active');
            $table->boolean('created_from_mobile')->default(false)->after('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('healthcare_facilities', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'created_from_mobile']);
        });
    }
};
