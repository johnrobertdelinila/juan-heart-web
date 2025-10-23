<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Role Hierarchy:
     * 1. Super Admin - Full system access
     * 2. PHC Admin - Philippine Heart Center administrators
     * 3. Hospital Admin - Hospital-level administrators
     * 4. Department Head - Department coordinators
     * 5. Cardiologist - Senior doctors with full clinical access
     * 6. Doctor - Licensed physicians
     * 7. Nurse - Nursing staff
     * 8. Medical Staff - General healthcare workers
     * 9. Data Analyst - Analytics and reporting access
     * 10. Researcher - Research and data export access
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ==========================================
        // PERMISSIONS - Organized by Category
        // ==========================================

        // Assessment Permissions
        $assessmentPermissions = [
            'view-assessments',
            'view-own-assessments',
            'validate-assessments',
            'edit-assessments',
            'delete-assessments',
            'export-assessments',
            'override-ml-scores',
        ];

        // Referral Permissions
        $referralPermissions = [
            'view-referrals',
            'view-own-referrals',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'edit-referrals',
            'delete-referrals',
            'schedule-referrals',
            'complete-referrals',
        ];

        // Patient Permissions
        $patientPermissions = [
            'view-patients',
            'view-own-patients',
            'create-patients',
            'edit-patients',
            'delete-patients',
            'export-patients',
            'view-patient-history',
        ];

        // Facility Permissions
        $facilityPermissions = [
            'view-facilities',
            'view-own-facility',
            'create-facilities',
            'edit-facilities',
            'delete-facilities',
            'manage-facility-capacity',
            'view-facility-analytics',
        ];

        // User Management Permissions
        $userPermissions = [
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'assign-roles',
            'assign-permissions',
            'view-user-activity',
            'suspend-users',
            'activate-users',
        ];

        // Role & Permission Management
        $rolePermissions = [
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'assign-role-permissions',
        ];

        // Analytics & Reporting Permissions
        $analyticsPermissions = [
            'view-analytics',
            'view-dashboard',
            'view-reports',
            'create-reports',
            'export-reports',
            'view-system-metrics',
            'view-geographic-analytics',
        ];

        // Audit & Compliance Permissions
        $auditPermissions = [
            'view-audit-logs',
            'export-audit-logs',
            'view-compliance-reports',
        ];

        // System Administration Permissions
        $systemPermissions = [
            'manage-system-settings',
            'manage-api-keys',
            'view-system-logs',
            'manage-backups',
            'manage-integrations',
            'access-emergency-override',
        ];

        // Research Permissions
        $researchPermissions = [
            'view-research-data',
            'export-anonymized-data',
            'create-research-queries',
            'access-ml-models',
        ];

        // Notification Permissions
        $notificationPermissions = [
            'send-notifications',
            'broadcast-alerts',
            'manage-notification-templates',
        ];

        // Create all permissions
        $allPermissions = array_merge(
            $assessmentPermissions,
            $referralPermissions,
            $patientPermissions,
            $facilityPermissions,
            $userPermissions,
            $rolePermissions,
            $analyticsPermissions,
            $auditPermissions,
            $systemPermissions,
            $researchPermissions,
            $notificationPermissions
        );

        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // ==========================================
        // ROLES - Hierarchical Assignment
        // ==========================================

        // 1. Super Admin - Full system access
        $superAdmin = Role::create([
            'name' => 'super-admin',
            'guard_name' => 'web',
        ]);
        $superAdmin->givePermissionTo(Permission::all());

        // 2. PHC Admin - Philippine Heart Center administrators
        $phcAdmin = Role::create([
            'name' => 'phc-admin',
            'guard_name' => 'web',
        ]);
        $phcAdmin->givePermissionTo([
            // Assessments
            'view-assessments',
            'validate-assessments',
            'export-assessments',
            'override-ml-scores',
            // Referrals
            'view-referrals',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'schedule-referrals',
            'complete-referrals',
            // Patients
            'view-patients',
            'create-patients',
            'edit-patients',
            'export-patients',
            'view-patient-history',
            // Facilities
            'view-facilities',
            'create-facilities',
            'edit-facilities',
            'manage-facility-capacity',
            'view-facility-analytics',
            // Users
            'view-users',
            'create-users',
            'edit-users',
            'suspend-users',
            'activate-users',
            'assign-roles',
            'view-user-activity',
            // Roles
            'view-roles',
            // Analytics
            'view-analytics',
            'view-dashboard',
            'view-reports',
            'create-reports',
            'export-reports',
            'view-system-metrics',
            'view-geographic-analytics',
            // Audit
            'view-audit-logs',
            'export-audit-logs',
            'view-compliance-reports',
            // Notifications
            'send-notifications',
            'broadcast-alerts',
            'manage-notification-templates',
        ]);

        // 3. Hospital Admin - Hospital-level administrators
        $hospitalAdmin = Role::create([
            'name' => 'hospital-admin',
            'guard_name' => 'web',
        ]);
        $hospitalAdmin->givePermissionTo([
            // Assessments
            'view-assessments',
            'validate-assessments',
            'export-assessments',
            // Referrals
            'view-referrals',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'schedule-referrals',
            'complete-referrals',
            // Patients
            'view-patients',
            'create-patients',
            'edit-patients',
            'view-patient-history',
            // Facilities
            'view-facilities',
            'view-own-facility',
            'edit-facilities',
            'manage-facility-capacity',
            'view-facility-analytics',
            // Users (facility-level only)
            'view-users',
            'create-users',
            'edit-users',
            'suspend-users',
            'view-user-activity',
            // Analytics
            'view-analytics',
            'view-dashboard',
            'view-reports',
            'export-reports',
            'view-facility-analytics',
            // Audit
            'view-audit-logs',
            // Notifications
            'send-notifications',
        ]);

        // 4. Department Head - Department coordinators
        $departmentHead = Role::create([
            'name' => 'department-head',
            'guard_name' => 'web',
        ]);
        $departmentHead->givePermissionTo([
            // Assessments
            'view-assessments',
            'validate-assessments',
            // Referrals
            'view-referrals',
            'create-referrals',
            'accept-referrals',
            'schedule-referrals',
            // Patients
            'view-patients',
            'view-patient-history',
            // Facilities
            'view-facilities',
            'view-own-facility',
            // Analytics
            'view-analytics',
            'view-dashboard',
            'view-reports',
            // Notifications
            'send-notifications',
        ]);

        // 5. Cardiologist - Senior doctors with full clinical access
        $cardiologist = Role::create([
            'name' => 'cardiologist',
            'guard_name' => 'web',
        ]);
        $cardiologist->givePermissionTo([
            // Assessments
            'view-assessments',
            'validate-assessments',
            'edit-assessments',
            'override-ml-scores',
            // Referrals
            'view-referrals',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'schedule-referrals',
            'complete-referrals',
            // Patients
            'view-patients',
            'create-patients',
            'edit-patients',
            'view-patient-history',
            // Facilities
            'view-facilities',
            // Analytics
            'view-dashboard',
            'view-reports',
        ]);

        // 6. Doctor - Licensed physicians
        $doctor = Role::create([
            'name' => 'doctor',
            'guard_name' => 'web',
        ]);
        $doctor->givePermissionTo([
            // Assessments
            'view-assessments',
            'validate-assessments',
            // Referrals
            'view-referrals',
            'create-referrals',
            'accept-referrals',
            'schedule-referrals',
            // Patients
            'view-patients',
            'view-patient-history',
            // Facilities
            'view-facilities',
            // Analytics
            'view-dashboard',
        ]);

        // 7. Nurse - Nursing staff
        $nurse = Role::create([
            'name' => 'nurse',
            'guard_name' => 'web',
        ]);
        $nurse->givePermissionTo([
            // Assessments
            'view-assessments',
            'view-own-assessments',
            // Referrals
            'view-referrals',
            'view-own-referrals',
            'schedule-referrals',
            // Patients
            'view-patients',
            'view-own-patients',
            'create-patients',
            // Facilities
            'view-facilities',
            'view-own-facility',
        ]);

        // 8. Medical Staff - General healthcare workers
        $medicalStaff = Role::create([
            'name' => 'medical-staff',
            'guard_name' => 'web',
        ]);
        $medicalStaff->givePermissionTo([
            // Assessments
            'view-assessments',
            'view-own-assessments',
            // Referrals
            'view-referrals',
            'view-own-referrals',
            // Patients
            'view-patients',
            'view-own-patients',
            // Facilities
            'view-facilities',
            'view-own-facility',
        ]);

        // 9. Data Analyst - Analytics and reporting access
        $dataAnalyst = Role::create([
            'name' => 'data-analyst',
            'guard_name' => 'web',
        ]);
        $dataAnalyst->givePermissionTo([
            // Assessments (read-only)
            'view-assessments',
            'export-assessments',
            // Referrals (read-only)
            'view-referrals',
            // Patients (read-only)
            'view-patients',
            // Facilities (read-only)
            'view-facilities',
            // Analytics (full access)
            'view-analytics',
            'view-dashboard',
            'view-reports',
            'create-reports',
            'export-reports',
            'view-system-metrics',
            'view-geographic-analytics',
        ]);

        // 10. Researcher - Research and data export access
        $researcher = Role::create([
            'name' => 'researcher',
            'guard_name' => 'web',
        ]);
        $researcher->givePermissionTo([
            // Assessments (read-only, anonymized)
            'view-assessments',
            'export-assessments',
            // Analytics
            'view-analytics',
            'view-reports',
            'export-reports',
            // Research
            'view-research-data',
            'export-anonymized-data',
            'create-research-queries',
            'access-ml-models',
        ]);

        $this->command->info('✅ Roles and permissions seeded successfully!');
        $this->command->info('');
        $this->command->info('Created Roles:');
        $this->command->info('  1. super-admin (all permissions)');
        $this->command->info('  2. phc-admin (PHC administrators)');
        $this->command->info('  3. hospital-admin (hospital administrators)');
        $this->command->info('  4. department-head (department coordinators)');
        $this->command->info('  5. cardiologist (senior doctors)');
        $this->command->info('  6. doctor (licensed physicians)');
        $this->command->info('  7. nurse (nursing staff)');
        $this->command->info('  8. medical-staff (general healthcare workers)');
        $this->command->info('  9. data-analyst (analytics access)');
        $this->command->info(' 10. researcher (research access)');
        $this->command->info('');
        $this->command->info('Total Permissions: ' . count($allPermissions));
    }
}