<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\ClinicalValidation;
use App\Models\HealthcareFacility;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ComprehensiveTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data (except facilities which are already seeded)
        // Delete in order to respect foreign key constraints
        \DB::table('referral_history')->delete();
        \DB::table('referrals')->delete();
        \DB::table('clinical_validations')->delete();
        \DB::table('assessment_comments')->delete();
        \DB::table('assessment_attachments')->delete();
        \DB::table('assessments')->delete();

        // Delete test users by email (force delete to bypass soft deletes)
        \DB::table('model_has_roles')->whereIn('model_id', function($query) {
            $query->select('id')->from('users')->whereIn('email', [
                'phc.admin@juanheart.ph',
                'cardiologist.phc@juanheart.ph',
                'doctor.manila@juanheart.ph',
                'doctor.makati@juanheart.ph',
                'nurse.stlukes@juanheart.ph',
            ]);
        })->delete();

        \DB::table('users')->whereIn('email', [
            'phc.admin@juanheart.ph',
            'cardiologist.phc@juanheart.ph',
            'doctor.manila@juanheart.ph',
            'doctor.makati@juanheart.ph',
            'nurse.stlukes@juanheart.ph',
        ])->delete();

        $this->command->info('Creating roles and permissions...');
        $this->createRolesAndPermissions();

        $this->command->info('Creating users...');
        $users = $this->createUsers();

        $this->command->info('Creating assessments...');
        $assessments = $this->createAssessments($users);

        $this->command->info('Creating clinical validations...');
        $this->createClinicalValidations($assessments, $users);

        $this->command->info('Creating referrals...');
        $this->createReferrals($assessments, $users);

        $this->command->info('Comprehensive test data seeding completed!');
    }

    private function createRolesAndPermissions(): void
    {
        // Create roles if they don't exist
        $roles = [
            'super-admin',
            'phc-admin',
            'hospital-admin',
            'department-head',
            'cardiologist',
            'doctor',
            'nurse',
            'data-analyst',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Create key permissions
        $permissions = [
            'view-assessments',
            'validate-assessments',
            'view-referrals',
            'create-referrals',
            'accept-referrals',
            'reject-referrals',
            'view-dashboard',
            'view-analytics',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }
    }

    private function createUsers(): array
    {
        $facilities = HealthcareFacility::all();
        $users = [];

        // PHC Admin
        $users['phc_admin'] = User::create([
            'email' => 'phc.admin@juanheart.ph',
            'password' => Hash::make('password'),
            'first_name' => 'Carlos',
            'last_name' => 'Santos',
            'phone' => '+639171234567',
            'status' => 'active',
            'mfa_enabled' => false,
            'email_verified_at' => now(),
        ]);
        $users['phc_admin']->assignRole('phc-admin');

        // Cardiologist at PHC
        $users['cardiologist_phc'] = User::create([
            'email' => 'cardiologist.phc@juanheart.ph',
            'password' => Hash::make('password'),
            'first_name' => 'Maria',
            'last_name' => 'Reyes',
            'phone' => '+639171234568',
            'status' => 'active',
            'mfa_enabled' => false,
            'email_verified_at' => now(),
        ]);
        $users['cardiologist_phc']->assignRole('cardiologist');

        // Doctor at Manila Doctors Hospital
        $users['doctor_manila'] = User::create([
            'email' => 'doctor.manila@juanheart.ph',
            'password' => Hash::make('password'),
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone' => '+639171234569',
            'status' => 'active',
            'mfa_enabled' => false,
            'email_verified_at' => now(),
        ]);
        $users['doctor_manila']->assignRole('doctor');

        // Doctor at Makati Medical Center
        $users['doctor_makati'] = User::create([
            'email' => 'doctor.makati@juanheart.ph',
            'password' => Hash::make('password'),
            'first_name' => 'Antonio',
            'last_name' => 'Garcia',
            'phone' => '+639171234570',
            'status' => 'active',
            'mfa_enabled' => false,
            'email_verified_at' => now(),
        ]);
        $users['doctor_makati']->assignRole('doctor');

        // Nurse at St. Luke's
        $users['nurse_stlukes'] = User::create([
            'email' => 'nurse.stlukes@juanheart.ph',
            'password' => Hash::make('password'),
            'first_name' => 'Ana',
            'last_name' => 'Torres',
            'phone' => '+639171234571',
            'status' => 'active',
            'mfa_enabled' => false,
            'email_verified_at' => now(),
        ]);
        $users['nurse_stlukes']->assignRole('nurse');

        return $users;
    }

    private function createAssessments(array $users): array
    {
        $assessments = [];
        $facilities = HealthcareFacility::all();
        $riskLevels = ['Low', 'Moderate', 'High'];
        $statuses = ['pending', 'in_review', 'validated', 'requires_referral', 'completed'];

        // Create 50 assessments with varied data
        for ($i = 1; $i <= 50; $i++) {
            $riskLevel = $riskLevels[array_rand($riskLevels)];
            $status = $statuses[array_rand($statuses)];

            $mlScore = match($riskLevel) {
                'Low' => rand(0, 30),
                'Moderate' => rand(31, 60),
                'High' => rand(61, 100),
            };

            $assessment = Assessment::create([
                'mobile_user_id' => 'mobile_user_' . $i,
                'session_id' => 'session_' . uniqid(),
                'assessment_external_id' => 'ASSESS_' . date('Y') . '_' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'patient_first_name' => $this->getRandomFirstName(),
                'patient_last_name' => $this->getRandomLastName(),
                'patient_date_of_birth' => now()->subYears(rand(30, 75))->subDays(rand(0, 365)),
                'patient_sex' => rand(0, 1) ? 'male' : 'female',
                'patient_email' => 'patient' . $i . '@example.com',
                'patient_phone' => '+63917' . str_pad(rand(1000000, 9999999), 7, '0', STR_PAD_LEFT),
                'assessment_date' => now()->subDays(rand(0, 30)),
                'version' => '1.0',
                'completion_rate' => rand(85, 100) / 100,
                'assessment_duration_minutes' => rand(5, 20),
                'data_quality_score' => rand(80, 99) / 100,
                'country' => 'Philippines',
                'region' => $this->getRandomRegion(),
                'city' => $this->getRandomCity(),
                'latitude' => 14.5995 + (rand(-1000, 1000) / 10000),
                'longitude' => 120.9842 + (rand(-1000, 1000) / 10000),
                'ml_risk_score' => $mlScore,
                'ml_risk_level' => $riskLevel,
                'rule_based_score' => $mlScore + rand(-5, 5),
                'rule_based_level' => $riskLevel,
                'final_risk_score' => $mlScore,
                'final_risk_level' => $riskLevel,
                'urgency' => $this->getUrgencyFromRisk($riskLevel),
                'recommended_action' => $this->getRecommendedAction($riskLevel),
                'vital_signs' => [
                    'systolic_bp' => rand(110, 180),
                    'diastolic_bp' => rand(70, 120),
                    'heart_rate' => rand(60, 100),
                    'weight_kg' => rand(50, 100),
                    'height_cm' => rand(150, 190),
                    'bmi' => round(rand(18, 35) + (rand(0, 99) / 100), 2),
                ],
                'symptoms' => $this->getRandomSymptoms(),
                'medical_history' => $this->getRandomMedicalHistory(),
                'medications' => $this->getRandomMedications(),
                'lifestyle' => [
                    'smoking' => rand(0, 1) ? 'yes' : 'no',
                    'alcohol_consumption' => ['none', 'occasional', 'moderate', 'heavy'][rand(0, 3)],
                    'physical_activity' => ['sedentary', 'light', 'moderate', 'vigorous'][rand(0, 3)],
                    'diet' => ['poor', 'fair', 'good', 'excellent'][rand(0, 3)],
                ],
                'recommendations' => [
                    'lifestyle_changes' => 'Regular exercise, healthy diet',
                    'follow_up' => $riskLevel !== 'Low' ? 'Required within 1 month' : 'Optional',
                    'medications_review' => $riskLevel === 'High' ? 'Urgent' : 'Standard',
                ],
                'status' => $status,
                'validated_by' => $status !== 'pending' ? $users['cardiologist_phc']->id : null,
                'validated_at' => $status !== 'pending' ? now()->subDays(rand(0, 10)) : null,
                'validation_notes' => $status !== 'pending' ? 'Assessment reviewed and validated' : null,
                'validation_agrees_with_ml' => $status !== 'pending' ? (rand(0, 10) > 2) : null,
                'device_platform' => 'android',
                'device_version' => '13.0',
                'app_version' => '1.2.0',
                'model_confidence' => rand(75, 99) / 100,
                'processing_time_ms' => rand(500, 2000),
                'mobile_created_at' => now()->subDays(rand(0, 30)),
                'synced_at' => now()->subDays(rand(0, 5)),
            ]);

            $assessments[] = $assessment;
        }

        return $assessments;
    }

    private function createClinicalValidations(array $assessments, array $users): void
    {
        // Create validations for 30% of assessments
        $assessmentsToValidate = array_slice($assessments, 0, 15);

        foreach ($assessmentsToValidate as $assessment) {
            ClinicalValidation::create([
                'assessment_id' => $assessment->id,
                'doctor_id' => $users['cardiologist_phc']->id,
                'original_ml_score' => $assessment->ml_risk_score,
                'validated_score' => $assessment->ml_risk_score + rand(-5, 5),
                'agreement_level' => ['complete_agreement', 'partial_agreement', 'significant_difference', 'complete_disagreement'][rand(0, 3)],
                'clinical_notes' => 'Patient assessment validated. ' . ($assessment->final_risk_level === 'High' ? 'Immediate follow-up required.' : 'Standard follow-up protocol.'),
                'additional_tests_required' => $assessment->final_risk_level === 'High' ? 'ECG, Echocardiogram' : null,
                'recommendations' => 'Continue monitoring vital signs. ' . ($assessment->final_risk_level !== 'Low' ? 'Schedule follow-up appointment.' : ''),
                'created_at' => now()->subDays(rand(0, 10)),
            ]);
        }
    }

    private function createReferrals(array $assessments, array $users): void
    {
        $facilities = HealthcareFacility::all();

        // Create referrals for high risk assessments (about 20 referrals)
        $highRiskAssessments = array_filter($assessments, function($assessment) {
            return $assessment->final_risk_level === 'High';
        });

        $referralStatuses = ['pending', 'accepted', 'in_transit', 'arrived', 'completed'];
        $priorities = ['Low', 'Medium', 'High', 'Critical'];

        $count = 0;
        foreach ($highRiskAssessments as $assessment) {
            if ($count >= 20) break;

            $status = $referralStatuses[array_rand($referralStatuses)];
            $priority = $assessment->final_risk_level === 'High' ? 'Critical' : $priorities[array_rand($priorities)];

            // Source facility is random, target is often PHC
            $sourceFacility = $facilities->random();
            $targetFacility = $facilities->where('name', 'Philippine Heart Center')->first() ?? $facilities->random();

            Referral::create([
                'assessment_id' => $assessment->id,
                'patient_first_name' => $assessment->patient_first_name,
                'patient_last_name' => $assessment->patient_last_name,
                'patient_date_of_birth' => $assessment->patient_date_of_birth,
                'patient_sex' => $assessment->patient_sex,
                'patient_phone' => $assessment->patient_phone,
                'source_facility_id' => $sourceFacility->id,
                'target_facility_id' => $targetFacility->id,
                'referring_user_id' => $users['doctor_manila']->id,
                'assigned_doctor_id' => in_array($status, ['accepted', 'in_transit', 'arrived', 'completed']) ? $users['cardiologist_phc']->id : null,
                'priority' => $priority,
                'urgency' => $assessment->urgency,
                'referral_type' => ['consultation', 'admission', 'procedure'][rand(0, 2)],
                'chief_complaint' => 'Patient with ' . $assessment->final_risk_level . ' cardiovascular risk',
                'clinical_notes' => 'Patient assessed with ML risk score of ' . $assessment->ml_risk_score . '. ' .
                    ($assessment->final_risk_level === 'High' ? 'Requires immediate cardiac evaluation.' : 'Requires specialist consultation.'),
                'required_services' => ['cardiology_consultation', 'ecg', 'echocardiogram'],
                'status' => $status,
                'status_notes' => $status === 'completed' ? 'Patient successfully treated and discharged' : null,
                'accepted_at' => in_array($status, ['accepted', 'in_transit', 'arrived', 'completed']) ? now()->subDays(rand(1, 5)) : null,
                'arrived_at' => in_array($status, ['arrived', 'completed']) ? now()->subDays(rand(0, 3)) : null,
                'completed_at' => $status === 'completed' ? now()->subDays(rand(0, 2)) : null,
                'scheduled_appointment' => in_array($status, ['accepted', 'in_transit']) ? now()->addDays(rand(1, 7)) : null,
                'appointment_notes' => in_array($status, ['accepted', 'in_transit']) ? 'Appointment scheduled for cardiology consultation' : null,
                'transport_method' => $priority === 'emergency' ? 'ambulance' : 'private',
                'estimated_travel_time_minutes' => rand(15, 60),
                'records_transferred' => in_array($status, ['accepted', 'in_transit', 'arrived', 'completed']),
                'requires_follow_up' => true,
                'follow_up_date' => $status === 'completed' ? now()->addDays(rand(7, 30)) : null,
                'created_at' => now()->subDays(rand(0, 10)),
            ]);

            $count++;
        }
    }

    // Helper methods
    private function getRandomFirstName(): string
    {
        $names = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Sofia',
                  'Ramon', 'Isabel', 'Antonio', 'Carmen', 'Manuel', 'Teresa', 'Francisco', 'Luz'];
        return $names[array_rand($names)];
    }

    private function getRandomLastName(): string
    {
        $names = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Martinez', 'Rodriguez', 'Fernandez',
                  'Lopez', 'Gonzales', 'Ramos', 'Flores', 'Torres', 'Rivera', 'Gomez', 'Diaz'];
        return $names[array_rand($names)];
    }

    private function getRandomRegion(): string
    {
        $regions = ['NCR', 'Region III', 'Region IV-A', 'Region VII', 'Region XI'];
        return $regions[array_rand($regions)];
    }

    private function getRandomCity(): string
    {
        $cities = ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Cebu City', 'Davao City'];
        return $cities[array_rand($cities)];
    }

    private function getUrgencyFromRisk(string $riskLevel): string
    {
        return match($riskLevel) {
            'Low' => 'Routine',
            'Moderate' => 'Urgent',
            'High' => 'Emergency',
        };
    }

    private function getRecommendedAction(string $riskLevel): string
    {
        return match($riskLevel) {
            'Low' => 'Continue healthy lifestyle, routine check-up in 6 months',
            'Moderate' => 'Schedule follow-up appointment, lifestyle modifications',
            'High' => 'Consult cardiologist within 2 weeks, medication review required',
        };
    }

    private function getRandomSymptoms(): array
    {
        $allSymptoms = ['chest_pain', 'shortness_of_breath', 'fatigue', 'palpitations', 'dizziness', 'none'];
        $count = rand(0, 3);

        if ($count === 0) {
            return ['none'];
        }

        $symptoms = [];
        for ($i = 0; $i < $count; $i++) {
            $symptom = $allSymptoms[array_rand($allSymptoms)];
            if (!in_array($symptom, $symptoms) && $symptom !== 'none') {
                $symptoms[] = $symptom;
            }
        }

        return array_values($symptoms);
    }

    private function getRandomMedicalHistory(): array
    {
        $conditions = ['hypertension', 'diabetes', 'high_cholesterol', 'previous_mi', 'stroke'];
        $count = rand(0, 2);

        $history = [];
        for ($i = 0; $i < $count; $i++) {
            $condition = $conditions[array_rand($conditions)];
            if (!in_array($condition, $history)) {
                $history[] = $condition;
            }
        }

        return array_values($history);
    }

    private function getRandomMedications(): array
    {
        $meds = ['aspirin', 'statin', 'beta_blocker', 'ace_inhibitor', 'metformin'];
        $count = rand(0, 3);

        $medications = [];
        for ($i = 0; $i < $count; $i++) {
            $med = $meds[array_rand($meds)];
            if (!in_array($med, $medications)) {
                $medications[] = $med;
            }
        }

        return array_values($medications);
    }
}
