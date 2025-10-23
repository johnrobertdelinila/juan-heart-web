<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\FacilityAnalyticsController;
use App\Http\Controllers\Api\ClinicalDashboardController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\Auth\DeviceTrustController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\MfaController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisteredUserController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
| Note: All routes are automatically prefixed with /api/v1
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/login', [LoginController::class, 'store']);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

// Temporarily public routes for testing (will require auth in production)
Route::prefix('analytics')->group(function () {
    Route::get('/national-overview', [AnalyticsController::class, 'getNationalOverview']);
    Route::get('/real-time-metrics', [AnalyticsController::class, 'getRealTimeMetrics']);
    Route::get('/geographic-distribution', [AnalyticsController::class, 'getGeographicDistribution']);
    Route::get('/trend-analysis', [AnalyticsController::class, 'getTrendAnalysis']);
    Route::get('/demographics-analysis', [AnalyticsController::class, 'getDemographicsAnalysis']);
    Route::post('/export', [AnalyticsController::class, 'exportData']);
});

Route::prefix('clinical')->group(function () {
    Route::get('/dashboard', [ClinicalDashboardController::class, 'dashboard']);
    Route::get('/assessment-queue', [ClinicalDashboardController::class, 'assessmentQueue']);
    Route::get('/risk-stratification', [ClinicalDashboardController::class, 'riskStratification']);
    Route::get('/alerts', [ClinicalDashboardController::class, 'alerts']);
    Route::get('/workload', [ClinicalDashboardController::class, 'workload']);
    Route::get('/validation-metrics', [ClinicalDashboardController::class, 'validationMetrics']);
    Route::get('/treatment-outcomes', [ClinicalDashboardController::class, 'treatmentOutcomes']);
});

Route::prefix('facilities')->group(function () {
    Route::get('/{id}/dashboard', [FacilityAnalyticsController::class, 'dashboard']);
    Route::get('/{id}/summary', [FacilityAnalyticsController::class, 'summary']);
    Route::get('/{id}/patient-flow', [FacilityAnalyticsController::class, 'patientFlow']);
    Route::get('/{id}/referral-metrics', [FacilityAnalyticsController::class, 'referralMetrics']);
    Route::get('/{id}/capacity-metrics', [FacilityAnalyticsController::class, 'capacity']);
    Route::get('/{id}/staff-productivity', [FacilityAnalyticsController::class, 'staffProductivity']);
    Route::get('/{id}/performance-comparison', [FacilityAnalyticsController::class, 'performanceComparison']);
    Route::get('/{id}/revenue', [FacilityAnalyticsController::class, 'revenue']);
});

// Temporarily public referral routes for testing (will require auth in production)
Route::prefix('referrals')->group(function () {
    Route::get('/statistics', [ReferralController::class, 'statistics']);
    Route::get('/', [ReferralController::class, 'index']);
    Route::get('/{id}', [ReferralController::class, 'show']);
    Route::post('/', [ReferralController::class, 'store']);
    Route::post('/{id}/accept', [ReferralController::class, 'accept']);
    Route::post('/{id}/reject', [ReferralController::class, 'reject']);
    Route::put('/{id}/status', [ReferralController::class, 'updateStatus']);
    Route::post('/{id}/schedule', [ReferralController::class, 'scheduleAppointment']);
    Route::post('/{id}/complete', [ReferralController::class, 'complete']);
    Route::post('/{id}/escalate', [ReferralController::class, 'escalate']);
});

// Temporarily public assessment routes for testing (will require auth in production)
Route::prefix('assessments')->group(function () {
    Route::get('/statistics', [AssessmentController::class, 'statistics']);
    Route::get('/', [AssessmentController::class, 'index']);
    Route::get('/{id}', [AssessmentController::class, 'show']);
    Route::post('/{id}/validate', [AssessmentController::class, 'validate']);
    Route::post('/export', [AssessmentController::class, 'export']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Current user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // MFA
    Route::prefix('mfa')->group(function () {
        Route::post('/enable', [MfaController::class, 'enable']);
        Route::post('/send-code', [MfaController::class, 'sendCode']);
        Route::post('/verify', [MfaController::class, 'verify']);
    });

    // Device Trust
    Route::prefix('trusted-devices')->group(function () {
        Route::get('/', [DeviceTrustController::class, 'index']);
        Route::post('/', [DeviceTrustController::class, 'store']);
    });

    // Logout
    Route::post('/logout', [LoginController::class, 'destroy']);

    // Profile Management
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/picture', [ProfileController::class, 'updateProfilePicture']);
        Route::delete('/picture', [ProfileController::class, 'deleteProfilePicture']);
        Route::get('/notifications/preferences', [ProfileController::class, 'getNotificationPreferences']);
        Route::put('/notifications/preferences', [ProfileController::class, 'updateNotificationPreferences']);
        Route::post('/security/password', [ProfileController::class, 'changePassword']);
        Route::post('/security/mfa', [ProfileController::class, 'toggleMfa']);
        Route::get('/activity-logs', [ProfileController::class, 'activityLogs']);
        Route::get('/completion', [ProfileController::class, 'completionStatus']);
    });

    // Users management
    Route::prefix('users')->group(function () {
        // View users (phc-admin, hospital-admin, department-head)
        Route::get('/', function () {
            return response()->json(['message' => 'List users']);
        })->middleware('permission:view-users');

        // Create users (phc-admin, hospital-admin)
        Route::post('/', function () {
            return response()->json(['message' => 'Create user']);
        })->middleware('permission:create-users');

        // View single user
        Route::get('/{id}', function ($id) {
            return response()->json(['message' => 'View user ' . $id]);
        })->middleware('permission:view-users');

        // Update user (phc-admin, hospital-admin)
        Route::put('/{id}', function ($id) {
            return response()->json(['message' => 'Update user ' . $id]);
        })->middleware('permission:edit-users');

        // Delete user (super-admin, phc-admin)
        Route::delete('/{id}', function ($id) {
            return response()->json(['message' => 'Delete user ' . $id]);
        })->middleware('permission:delete-users');

        // Assign roles (super-admin, phc-admin)
        Route::post('/{id}/roles', function ($id) {
            return response()->json(['message' => 'Assign roles to user ' . $id]);
        })->middleware('permission:assign-roles');

        // Suspend/activate users (phc-admin, hospital-admin)
        Route::post('/{id}/suspend', function ($id) {
            return response()->json(['message' => 'Suspend user ' . $id]);
        })->middleware('permission:suspend-users');

        Route::post('/{id}/activate', function ($id) {
            return response()->json(['message' => 'Activate user ' . $id]);
        })->middleware('permission:activate-users');
    });

    // Roles & Permissions Management
    Route::prefix('roles')->middleware('role:super-admin|phc-admin')->group(function () {
        // View all roles
        Route::get('/', function () {
            return response()->json(['message' => 'List roles']);
        })->middleware('permission:view-roles');

        // Create role (super-admin only)
        Route::post('/', function () {
            return response()->json(['message' => 'Create role']);
        })->middleware('role:super-admin')->middleware('permission:create-roles');

        // View single role
        Route::get('/{id}', function ($id) {
            return response()->json(['message' => 'View role ' . $id]);
        })->middleware('permission:view-roles');

        // Update role (super-admin only)
        Route::put('/{id}', function ($id) {
            return response()->json(['message' => 'Update role ' . $id]);
        })->middleware('role:super-admin')->middleware('permission:edit-roles');

        // Delete role (super-admin only)
        Route::delete('/{id}', function ($id) {
            return response()->json(['message' => 'Delete role ' . $id]);
        })->middleware('role:super-admin')->middleware('permission:delete-roles');

        // Assign permissions to role (super-admin only)
        Route::post('/{id}/permissions', function ($id) {
            return response()->json(['message' => 'Assign permissions to role ' . $id]);
        })->middleware('role:super-admin')->middleware('permission:assign-role-permissions');
    });

    // Assessments - Protected routes (commented out for testing, using public routes above)
    // Route::prefix('assessments')->group(function () {
    //     Route::get('/', function () {
    //         return response()->json(['message' => 'List assessments']);
    //     })->middleware('permission:view-assessments');
    //     Route::get('/{id}', function ($id) {
    //         return response()->json(['message' => 'View assessment ' . $id]);
    //     })->middleware('permission:view-assessments');
    //     Route::post('/{id}/validate', function ($id) {
    //         return response()->json(['message' => 'Validate assessment ' . $id]);
    //     })->middleware('permission:validate-assessments');
    //     Route::put('/{id}', function ($id) {
    //         return response()->json(['message' => 'Edit assessment ' . $id]);
    //     })->middleware('permission:edit-assessments');
    //     Route::delete('/{id}', function ($id) {
    //         return response()->json(['message' => 'Delete assessment ' . $id]);
    //     })->middleware('permission:delete-assessments');
    //     Route::post('/export', function () {
    //         return response()->json(['message' => 'Export assessments']);
    //     })->middleware('permission:export-assessments');
    //     Route::post('/{id}/override-score', function ($id) {
    //         return response()->json(['message' => 'Override ML score for assessment ' . $id]);
    //     })->middleware('permission:override-ml-scores');
    // });

    // Appointments
    Route::prefix('appointments')->group(function () {
        // Check availability
        Route::post('/check-availability', [AppointmentController::class, 'checkAvailability']);

        // Get available slots
        Route::get('/available-slots', [AppointmentController::class, 'getAvailableSlots']);

        // View appointments (all medical staff can view)
        Route::get('/', [AppointmentController::class, 'index'])
            ->middleware('permission:view-appointments');

        // View single appointment
        Route::get('/{id}', [AppointmentController::class, 'show'])
            ->middleware('permission:view-appointments');

        // Book appointment (nurses, doctors, cardiologists, admins)
        Route::post('/', [AppointmentController::class, 'store'])
            ->middleware('permission:create-appointments');

        // Reschedule appointment
        Route::post('/{id}/reschedule', [AppointmentController::class, 'reschedule'])
            ->middleware('permission:edit-appointments');

        // Cancel appointment
        Route::post('/{id}/cancel', [AppointmentController::class, 'cancel'])
            ->middleware('permission:cancel-appointments');

        // Confirm appointment
        Route::post('/{id}/confirm', [AppointmentController::class, 'confirm'])
            ->middleware('permission:confirm-appointments');

        // Check in patient
        Route::post('/{id}/check-in', [AppointmentController::class, 'checkIn'])
            ->middleware('permission:check-in-patients');

        // Complete appointment
        Route::post('/{id}/complete', [AppointmentController::class, 'complete'])
            ->middleware('permission:complete-appointments');

        // Add to waiting list
        Route::post('/waiting-list', [AppointmentController::class, 'addToWaitingList'])
            ->middleware('permission:manage-waiting-list');
    });

    // Patients
    Route::prefix('patients')->group(function () {
        // View patients (all medical staff can view)
        Route::get('/', function () {
            return response()->json(['message' => 'List patients']);
        })->middleware('permission:view-patients');

        // View single patient
        Route::get('/{id}', function ($id) {
            return response()->json(['message' => 'View patient ' . $id]);
        })->middleware('permission:view-patients');

        // Create patient (nurses, doctors, cardiologists, admins)
        Route::post('/', function () {
            return response()->json(['message' => 'Create patient']);
        })->middleware('permission:create-patients');

        // Edit patient (doctors, cardiologists, admins)
        Route::put('/{id}', function ($id) {
            return response()->json(['message' => 'Edit patient ' . $id]);
        })->middleware('permission:edit-patients');

        // Delete patient (admins only)
        Route::delete('/{id}', function ($id) {
            return response()->json(['message' => 'Delete patient ' . $id]);
        })->middleware('permission:delete-patients');

        // View patient history (doctors, cardiologists, admins)
        Route::get('/{id}/history', function ($id) {
            return response()->json(['message' => 'View patient history ' . $id]);
        })->middleware('permission:view-patient-history');

        // Export patients (data analysts, admins)
        Route::post('/export', function () {
            return response()->json(['message' => 'Export patients']);
        })->middleware('permission:export-patients');
    });

    // Facilities
    Route::prefix('facilities')->group(function () {
        // View facilities (all staff can view)
        Route::get('/', function () {
            return response()->json(['message' => 'List facilities']);
        })->middleware('permission:view-facilities');

        // View single facility
        Route::get('/{id}', function ($id) {
            return response()->json(['message' => 'View facility ' . $id]);
        })->middleware('permission:view-facilities');

        // Create facility (super-admin, phc-admin)
        Route::post('/', function () {
            return response()->json(['message' => 'Create facility']);
        })->middleware('permission:create-facilities');

        // Edit facility (admins, hospital-admins)
        Route::put('/{id}', function ($id) {
            return response()->json(['message' => 'Edit facility ' . $id]);
        })->middleware('permission:edit-facilities');

        // Delete facility (super-admin, phc-admin)
        Route::delete('/{id}', function ($id) {
            return response()->json(['message' => 'Delete facility ' . $id]);
        })->middleware('permission:delete-facilities');

        // Manage facility capacity (hospital-admins)
        Route::post('/{id}/capacity', function ($id) {
            return response()->json(['message' => 'Update facility capacity ' . $id]);
        })->middleware('permission:manage-facility-capacity');

        // View facility analytics (admins, data analysts)
        Route::get('/{id}/analytics', function ($id) {
            return response()->json(['message' => 'View facility analytics ' . $id]);
        })->middleware('permission:view-facility-analytics');
    });

    // Analytics - Protected routes
    Route::prefix('analytics')->group(function () {
        // View dashboard (doctors, admins, analysts)
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'View analytics dashboard']);
        })->middleware('permission:view-dashboard');

        // View analytics (admins, data analysts, researchers)
        Route::get('/', function () {
            return response()->json(['message' => 'View analytics']);
        })->middleware('permission:view-analytics');

        // View reports (doctors, admins, analysts)
        Route::get('/reports', function () {
            return response()->json(['message' => 'View reports']);
        })->middleware('permission:view-reports');

        // Create reports (admins, data analysts)
        Route::post('/reports', function () {
            return response()->json(['message' => 'Create report']);
        })->middleware('permission:create-reports');

        // Export reports (admins, data analysts, researchers)
        Route::post('/reports/export', function () {
            return response()->json(['message' => 'Export report']);
        })->middleware('permission:export-reports');

        // View system metrics (admins, data analysts)
        Route::get('/metrics', function () {
            return response()->json(['message' => 'View system metrics']);
        })->middleware('permission:view-system-metrics');

        // View geographic analytics (admins, data analysts)
        Route::get('/geographic', function () {
            return response()->json(['message' => 'View geographic analytics']);
        })->middleware('permission:view-geographic-analytics');
    });

    // Audit Logs
    Route::prefix('audit')->middleware('role:super-admin|phc-admin|hospital-admin')->group(function () {
        // View audit logs (admins)
        Route::get('/', function () {
            return response()->json(['message' => 'View audit logs']);
        })->middleware('permission:view-audit-logs');

        // Export audit logs (super-admin, phc-admin)
        Route::post('/export', function () {
            return response()->json(['message' => 'Export audit logs']);
        })->middleware('permission:export-audit-logs');

        // View compliance reports (super-admin, phc-admin)
        Route::get('/compliance', function () {
            return response()->json(['message' => 'View compliance reports']);
        })->middleware('permission:view-compliance-reports');
    });

    // Research
    Route::prefix('research')->middleware('role:super-admin|researcher|data-analyst')->group(function () {
        // View research data (researchers)
        Route::get('/data', function () {
            return response()->json(['message' => 'View research data']);
        })->middleware('permission:view-research-data');

        // Export anonymized data (researchers)
        Route::post('/export-anonymized', function () {
            return response()->json(['message' => 'Export anonymized data']);
        })->middleware('permission:export-anonymized-data');

        // Create research queries (researchers)
        Route::post('/queries', function () {
            return response()->json(['message' => 'Create research query']);
        })->middleware('permission:create-research-queries');

        // Access ML models (researchers, super-admin)
        Route::get('/ml-models', function () {
            return response()->json(['message' => 'Access ML models']);
        })->middleware('permission:access-ml-models');
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        // View own notifications (all authenticated users)
        Route::get('/', function (Request $request) {
            return response()->json(['message' => 'View notifications']);
        });

        // Mark notification as read (all authenticated users)
        Route::post('/{id}/read', function ($id) {
            return response()->json(['message' => 'Mark notification ' . $id . ' as read']);
        });

        // Send notifications (admins, department heads)
        Route::post('/send', function () {
            return response()->json(['message' => 'Send notification']);
        })->middleware('permission:send-notifications');

        // Broadcast alerts (phc-admin only)
        Route::post('/broadcast', function () {
            return response()->json(['message' => 'Broadcast alert']);
        })->middleware('permission:broadcast-alerts');

        // Manage notification templates (phc-admin)
        Route::get('/templates', function () {
            return response()->json(['message' => 'List notification templates']);
        })->middleware('permission:manage-notification-templates');

        Route::post('/templates', function () {
            return response()->json(['message' => 'Create notification template']);
        })->middleware('permission:manage-notification-templates');
    });
});