<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Enhances the users table for healthcare staff with additional fields
     * required for the Juan Heart Web Application.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'name')) {
                $table->string('first_name')->after('name');
                $table->string('last_name')->after('first_name');
                $table->string('middle_name')->nullable()->after('last_name');
                $table->dropColumn('name');
            }

            if (!Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('middle_name');
            }

            if (!Schema::hasColumn('users', 'sex')) {
                $table->enum('sex', ['Male', 'Female', 'Other'])->nullable()->after('date_of_birth');
            }

            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('sex');
            }

            if (!Schema::hasColumn('users', 'license_no')) {
                $table->string('license_no')->nullable()->after('phone'); // PRC License Number
            }

            if (!Schema::hasColumn('users', 'specialization')) {
                $table->string('specialization')->nullable()->after('license_no'); // e.g., Cardiology, Internal Medicine
            }

            if (!Schema::hasColumn('users', 'position')) {
                $table->string('position')->nullable()->after('specialization'); // e.g., Doctor, Nurse, Admin
            }

            if (!Schema::hasColumn('users', 'department')) {
                $table->string('department')->nullable()->after('position');
            }

            if (!Schema::hasColumn('users', 'facility_id')) {
                $table->unsignedBigInteger('facility_id')->nullable()->after('department');
                $table->foreign('facility_id')->references('id')->on('healthcare_facilities')->onDelete('set null');
            }

            if (!Schema::hasColumn('users', 'language_preference')) {
                $table->enum('language_preference', ['en', 'fil'])->default('en')->after('facility_id');
            }

            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'inactive', 'suspended', 'pending'])->default('pending')->after('language_preference');
            }

            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('status');
            }

            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip')->nullable()->after('last_login_at');
            }

            if (!Schema::hasColumn('users', 'mfa_enabled')) {
                $table->boolean('mfa_enabled')->default(false)->after('last_login_ip');
            }

            if (!Schema::hasColumn('users', 'mfa_method')) {
                $table->enum('mfa_method', ['sms', 'email', 'authenticator'])->nullable()->after('mfa_enabled');
            }

            if (!Schema::hasColumn('users', 'mfa_secret')) {
                $table->string('mfa_secret')->nullable()->after('mfa_method');
            }

            if (!Schema::hasColumn('users', 'backup_codes')) {
                $table->text('backup_codes')->nullable()->after('mfa_secret'); // JSON array of backup codes
            }

            if (!Schema::hasColumn('users', 'session_timeout_minutes')) {
                $table->integer('session_timeout_minutes')->default(120)->after('backup_codes');
            }

            if (!Schema::hasColumn('users', 'password_changed_at')) {
                $table->timestamp('password_changed_at')->nullable()->after('session_timeout_minutes');
            }

            if (!Schema::hasColumn('users', 'force_password_change')) {
                $table->boolean('force_password_change')->default(false)->after('password_changed_at');
            }

            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('force_password_change');
            }

            if (!Schema::hasColumn('users', 'profile_picture')) {
                $table->string('profile_picture')->nullable()->after('bio');
            }

            if (!Schema::hasColumn('users', 'notification_preferences')) {
                $table->json('notification_preferences')->nullable()->after('profile_picture');
            }

            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }

            if (!Schema::hasColumn('users', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('deleted_at');
            }

            if (!Schema::hasColumn('users', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            }

            if (!Schema::hasIndex('users', 'users_facility_id_index')) {
                $table->index('facility_id');
            }

            if (!Schema::hasIndex('users', 'users_status_index')) {
                $table->index('status');
            }

            if (!Schema::hasIndex('users', 'users_license_no_index')) {
                $table->index('license_no');
            }

            if (!Schema::hasIndex('users', 'users_last_login_at_index')) {
                $table->index('last_login_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['facility_id']);

            // Drop indexes
            $table->dropIndex(['users_facility_id_index']);
            $table->dropIndex(['users_status_index']);
            $table->dropIndex(['users_license_no_index']);
            $table->dropIndex(['users_last_login_at_index']);

            // Drop columns
            $table->dropColumn([
                'first_name',
                'last_name',
                'middle_name',
                'date_of_birth',
                'sex',
                'phone',
                'license_no',
                'specialization',
                'position',
                'department',
                'facility_id',
                'language_preference',
                'status',
                'last_login_at',
                'last_login_ip',
                'mfa_enabled',
                'mfa_method',
                'mfa_secret',
                'backup_codes',
                'session_timeout_minutes',
                'password_changed_at',
                'force_password_change',
                'bio',
                'profile_picture',
                'notification_preferences',
                'deleted_at',
                'created_by',
                'updated_by',
            ]);

            $table->string('name');
        });
    }
};