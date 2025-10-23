<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Disable rate limiting for tests
    $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);

    // Seed roles and permissions
    $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\RoleAndPermissionSeeder']);
});

describe('Role and Permission System', function () {
    // ==========================================
    // Role Creation Tests
    // ==========================================

    test('all roles are created successfully', function () {
        $expectedRoles = [
            'super-admin',
            'phc-admin',
            'hospital-admin',
            'department-head',
            'cardiologist',
            'doctor',
            'nurse',
            'medical-staff',
            'data-analyst',
            'researcher',
        ];

        foreach ($expectedRoles as $roleName) {
            expect(Role::where('name', $roleName)->exists())->toBeTrue(
                "Role {$roleName} should exist"
            );
        }

        expect(Role::count())->toBe(count($expectedRoles));
    });

    test('all permissions are created successfully', function () {
        expect(Permission::count())->toBe(67);
    });

    // ==========================================
    // Super Admin Role Tests
    // ==========================================

    test('super admin has all permissions', function () {
        $superAdmin = Role::findByName('super-admin');
        $allPermissions = Permission::all();

        expect($superAdmin->permissions->count())->toBe($allPermissions->count());
    });

    test('super admin can perform any action', function () {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        expect($user->hasPermissionTo('view-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('delete-users'))->toBeTrue();
        expect($user->hasPermissionTo('manage-system-settings'))->toBeTrue();
        expect($user->hasPermissionTo('export-anonymized-data'))->toBeTrue();
    });

    // ==========================================
    // PHC Admin Role Tests
    // ==========================================

    test('phc admin has comprehensive permissions', function () {
        $user = User::factory()->create();
        $user->assignRole('phc-admin');

        // Assessment permissions
        expect($user->hasPermissionTo('view-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('validate-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('override-ml-scores'))->toBeTrue();

        // User management permissions
        expect($user->hasPermissionTo('create-users'))->toBeTrue();
        expect($user->hasPermissionTo('assign-roles'))->toBeTrue();

        // Analytics permissions
        expect($user->hasPermissionTo('view-analytics'))->toBeTrue();
        expect($user->hasPermissionTo('export-reports'))->toBeTrue();

        // Should NOT have system-level permissions
        expect($user->hasPermissionTo('manage-system-settings'))->toBeFalse();
        expect($user->hasPermissionTo('create-roles'))->toBeFalse();
    });

    // ==========================================
    // Doctor Role Tests
    // ==========================================

    test('doctor can validate assessments and create referrals', function () {
        $user = User::factory()->create();
        $user->assignRole('doctor');

        // Clinical permissions
        expect($user->hasPermissionTo('view-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('validate-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('create-referrals'))->toBeTrue();
        expect($user->hasPermissionTo('accept-referrals'))->toBeTrue();

        // Patient permissions
        expect($user->hasPermissionTo('view-patients'))->toBeTrue();
        expect($user->hasPermissionTo('view-patient-history'))->toBeTrue();

        // Should NOT have admin permissions
        expect($user->hasPermissionTo('create-users'))->toBeFalse();
        expect($user->hasPermissionTo('delete-assessments'))->toBeFalse();
        expect($user->hasPermissionTo('override-ml-scores'))->toBeFalse();
    });

    // ==========================================
    // Cardiologist Role Tests
    // ==========================================

    test('cardiologist can override ML scores', function () {
        $user = User::factory()->create();
        $user->assignRole('cardiologist');

        expect($user->hasPermissionTo('override-ml-scores'))->toBeTrue();
        expect($user->hasPermissionTo('edit-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('validate-assessments'))->toBeTrue();
    });

    // ==========================================
    // Nurse Role Tests
    // ==========================================

    test('nurse has limited permissions', function () {
        $user = User::factory()->create();
        $user->assignRole('nurse');

        // Can view own data
        expect($user->hasPermissionTo('view-own-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('view-own-patients'))->toBeTrue();
        expect($user->hasPermissionTo('create-patients'))->toBeTrue();

        // Cannot validate or edit
        expect($user->hasPermissionTo('validate-assessments'))->toBeFalse();
        expect($user->hasPermissionTo('edit-assessments'))->toBeFalse();
        expect($user->hasPermissionTo('create-referrals'))->toBeFalse();
    });

    // ==========================================
    // Data Analyst Role Tests
    // ==========================================

    test('data analyst can view and export data but not modify', function () {
        $user = User::factory()->create();
        $user->assignRole('data-analyst');

        // Can view and export
        expect($user->hasPermissionTo('view-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('export-assessments'))->toBeTrue();
        expect($user->hasPermissionTo('view-analytics'))->toBeTrue();
        expect($user->hasPermissionTo('create-reports'))->toBeTrue();

        // Cannot modify clinical data
        expect($user->hasPermissionTo('validate-assessments'))->toBeFalse();
        expect($user->hasPermissionTo('create-referrals'))->toBeFalse();
        expect($user->hasPermissionTo('edit-patients'))->toBeFalse();
    });

    // ==========================================
    // Researcher Role Tests
    // ==========================================

    test('researcher can access anonymized data and ML models', function () {
        $user = User::factory()->create();
        $user->assignRole('researcher');

        expect($user->hasPermissionTo('view-research-data'))->toBeTrue();
        expect($user->hasPermissionTo('export-anonymized-data'))->toBeTrue();
        expect($user->hasPermissionTo('access-ml-models'))->toBeTrue();

        // Cannot access identifiable patient data
        expect($user->hasPermissionTo('view-patient-history'))->toBeFalse();
        expect($user->hasPermissionTo('create-patients'))->toBeFalse();
    });

    // ==========================================
    // Multiple Role Assignment Tests
    // ==========================================

    test('user can have multiple roles', function () {
        $user = User::factory()->create();
        $user->assignRole(['doctor', 'data-analyst']);

        expect($user->hasRole('doctor'))->toBeTrue();
        expect($user->hasRole('data-analyst'))->toBeTrue();

        // Should have permissions from both roles
        expect($user->hasPermissionTo('validate-assessments'))->toBeTrue(); // from doctor
        expect($user->hasPermissionTo('create-reports'))->toBeTrue(); // from data-analyst
    });

    // ==========================================
    // Permission Inheritance Tests
    // ==========================================

    test('roles correctly inherit their assigned permissions', function () {
        $hospitalAdmin = Role::findByName('hospital-admin');

        $expectedPermissions = [
            'view-assessments',
            'validate-assessments',
            'view-referrals',
            'create-referrals',
            'view-patients',
            'view-analytics',
        ];

        foreach ($expectedPermissions as $permission) {
            expect($hospitalAdmin->hasPermissionTo($permission))->toBeTrue(
                "hospital-admin should have {$permission}"
            );
        }
    });
});

describe('Permission Middleware', function () {
    // ==========================================
    // API Route Protection Tests
    // ==========================================

    test('unauthenticated users cannot access protected routes', function () {
        $this->getJson('/api/v1/users')
            ->assertStatus(401);

        $this->getJson('/api/v1/assessments')
            ->assertStatus(401);
    });

    test('authenticated user without permission gets 403', function () {
        // Create a medical staff user (limited permissions)
        $user = User::factory()->create();
        $user->assignRole('medical-staff');

        // Try to access admin-only endpoint
        $this->actingAs($user)
            ->postJson('/api/v1/users', ['email' => 'test@example.com'])
            ->assertStatus(403)
            ->assertJson([
                'message' => 'Forbidden. You do not have the required permission to access this resource.',
            ]);
    });

    test('user with correct permission can access route', function () {
        $user = User::factory()->create();
        $user->assignRole('phc-admin');

        $this->actingAs($user)
            ->getJson('/api/v1/users')
            ->assertStatus(200);
    });

    // ==========================================
    // Role Middleware Tests
    // ==========================================

    test('only super admin can create roles', function () {
        // PHC admin should not be able to create roles
        $phcAdmin = User::factory()->create();
        $phcAdmin->assignRole('phc-admin');

        $this->actingAs($phcAdmin)
            ->postJson('/api/v1/roles')
            ->assertStatus(403);

        // Super admin should be able to create roles
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        $this->actingAs($superAdmin)
            ->postJson('/api/v1/roles')
            ->assertStatus(200);
    });

    test('multiple roles can access audit logs', function () {
        // Super admin
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        $this->actingAs($superAdmin)
            ->getJson('/api/v1/audit')
            ->assertStatus(200);

        // PHC admin
        $phcAdmin = User::factory()->create();
        $phcAdmin->assignRole('phc-admin');

        $this->actingAs($phcAdmin)
            ->getJson('/api/v1/audit')
            ->assertStatus(200);

        // Hospital admin
        $hospitalAdmin = User::factory()->create();
        $hospitalAdmin->assignRole('hospital-admin');

        $this->actingAs($hospitalAdmin)
            ->getJson('/api/v1/audit')
            ->assertStatus(200);

        // Doctor should not have access
        $doctor = User::factory()->create();
        $doctor->assignRole('doctor');

        $this->actingAs($doctor)
            ->getJson('/api/v1/audit')
            ->assertStatus(403);
    });

    // ==========================================
    // Resource-Specific Permission Tests
    // ==========================================

    test('doctors can view but not delete assessments', function () {
        $doctor = User::factory()->create();
        $doctor->assignRole('doctor');

        // Can view
        $this->actingAs($doctor)
            ->getJson('/api/v1/assessments')
            ->assertStatus(200);

        // Cannot delete
        $this->actingAs($doctor)
            ->deleteJson('/api/v1/assessments/1')
            ->assertStatus(403);
    });

    test('cardiologists can override ML scores', function () {
        $cardiologist = User::factory()->create();
        $cardiologist->assignRole('cardiologist');

        $this->actingAs($cardiologist)
            ->postJson('/api/v1/assessments/1/override-score')
            ->assertStatus(200);
    });

    test('regular doctors cannot override ML scores', function () {
        $doctor = User::factory()->create();
        $doctor->assignRole('doctor');

        $this->actingAs($doctor)
            ->postJson('/api/v1/assessments/1/override-score')
            ->assertStatus(403);
    });

    test('nurses can create patients but not edit them', function () {
        $nurse = User::factory()->create();
        $nurse->assignRole('nurse');

        // Can create
        $this->actingAs($nurse)
            ->postJson('/api/v1/patients')
            ->assertStatus(200);

        // Cannot edit
        $this->actingAs($nurse)
            ->putJson('/api/v1/patients/1')
            ->assertStatus(403);
    });

    test('data analysts can export but not modify data', function () {
        $analyst = User::factory()->create();
        $analyst->assignRole('data-analyst');

        // Can export
        $this->actingAs($analyst)
            ->postJson('/api/v1/assessments/export')
            ->assertStatus(200);

        // Cannot validate
        $this->actingAs($analyst)
            ->postJson('/api/v1/assessments/1/validate')
            ->assertStatus(403);
    });

    test('researchers can access research endpoints', function () {
        $researcher = User::factory()->create();
        $researcher->assignRole('researcher');

        $this->actingAs($researcher)
            ->getJson('/api/v1/research/data')
            ->assertStatus(200);

        $this->actingAs($researcher)
            ->postJson('/api/v1/research/export-anonymized')
            ->assertStatus(200);

        $this->actingAs($researcher)
            ->getJson('/api/v1/research/ml-models')
            ->assertStatus(200);
    });

    test('non-researchers cannot access research endpoints', function () {
        $doctor = User::factory()->create();
        $doctor->assignRole('doctor');

        $this->actingAs($doctor)
            ->getJson('/api/v1/research/data')
            ->assertStatus(403);
    });
});
