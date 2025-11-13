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
            $table->string('confirmation_token', 64)->nullable()->unique()->after('confirmation_method')
                ->comment('Secure token for public appointment confirmation');
            $table->timestamp('token_expires_at')->nullable()->after('confirmation_token')
                ->comment('Expiration time for confirmation token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['confirmation_token', 'token_expires_at']);
        });
    }
};
