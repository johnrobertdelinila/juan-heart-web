<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HealthcareFacility;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates test users for each role in the system.
     * All test users have the password: password
     */
    public function run(): void
    {
        // Get a facility for testing (create one if doesn't exist)
        $facility = HealthcareFacility::first();

        if (!$facility) {
            $facility = HealthcareFacility::create([
                'name' => 'Philippine Heart Center',
                'code' => 'PHC-001',
                'type' => 'medical_center',
                'level' => 'tertiary',
                'address' => 'East Avenue, Diliman',
                'city' => 'Quezon City',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'phone' => '+63 2 8925 2401',
                'email' => 'info@phc.gov.ph',
                'is_active' => true,
            ]);
        }

        // 1. Super Admin
        $superAdmin = User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@juanheart.ph',
            'phone' => '+63 917 123 4567',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $superAdmin->assignRole('super-admin');

        // 2. PHC Admin
        $phcAdmin = User::create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'phcadmin@juanheart.ph',
            'phone' => '+63 917 234 5678',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $phcAdmin->assignRole('phc-admin');

        // 3. Hospital Admin
        $hospitalAdmin = User::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'hospitaladmin@juanheart.ph',
            'phone' => '+63 917 345 6789',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $hospitalAdmin->assignRole('hospital-admin');

        // 4. Department Head
        $departmentHead = User::create([
            'first_name' => 'Rosa',
            'last_name' => 'Reyes',
            'email' => 'depthead@juanheart.ph',
            'phone' => '+63 917 456 7890',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'specialization' => 'Cardiology',
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $departmentHead->assignRole('department-head');

        // 5. Cardiologist
        $cardiologist = User::create([
            'first_name' => 'Jose',
            'last_name' => 'Garcia',
            'email' => 'cardiologist@juanheart.ph',
            'phone' => '+63 917 567 8901',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'license_no' => 'PRC-12345678',
            'specialization' => 'Interventional Cardiology',
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $cardiologist->assignRole('cardiologist');

        // 6. Doctor
        $doctor = User::create([
            'first_name' => 'Ana',
            'last_name' => 'Bautista',
            'email' => 'doctor@juanheart.ph',
            'phone' => '+63 917 678 9012',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'license_no' => 'PRC-23456789',
            'specialization' => 'General Medicine',
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $doctor->assignRole('doctor');

        // 7. Nurse
        $nurse = User::create([
            'first_name' => 'Liza',
            'last_name' => 'Mendoza',
            'email' => 'nurse@juanheart.ph',
            'phone' => '+63 917 789 0123',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'license_no' => 'PRC-34567890',
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $nurse->assignRole('nurse');

        // 8. Medical Staff
        $medicalStaff = User::create([
            'first_name' => 'Pedro',
            'last_name' => 'Lopez',
            'email' => 'medstaff@juanheart.ph',
            'phone' => '+63 917 890 1234',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $medicalStaff->assignRole('medical-staff');

        // 9. Data Analyst
        $dataAnalyst = User::create([
            'first_name' => 'Michelle',
            'last_name' => 'Torres',
            'email' => 'analyst@juanheart.ph',
            'phone' => '+63 917 901 2345',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $dataAnalyst->assignRole('data-analyst');

        // 10. Researcher
        $researcher = User::create([
            'first_name' => 'Carlos',
            'last_name' => 'Villanueva',
            'email' => 'researcher@juanheart.ph',
            'phone' => '+63 917 012 3456',
            'password' => Hash::make('password'),
            'facility_id' => $facility->id,
            'email_verified_at' => now(),
            'status' => 'active',
            'mfa_enabled' => false,
        ]);
        $researcher->assignRole('researcher');

        $this->command->info('✅ Test users created successfully!');
        $this->command->info('');
        $this->command->info('Created Users:');
        $this->command->info('  1. superadmin@juanheart.ph (super-admin)');
        $this->command->info('  2. phcadmin@juanheart.ph (phc-admin)');
        $this->command->info('  3. hospitaladmin@juanheart.ph (hospital-admin)');
        $this->command->info('  4. depthead@juanheart.ph (department-head)');
        $this->command->info('  5. cardiologist@juanheart.ph (cardiologist)');
        $this->command->info('  6. doctor@juanheart.ph (doctor)');
        $this->command->info('  7. nurse@juanheart.ph (nurse)');
        $this->command->info('  8. medstaff@juanheart.ph (medical-staff)');
        $this->command->info('  9. analyst@juanheart.ph (data-analyst)');
        $this->command->info(' 10. researcher@juanheart.ph (researcher)');
        $this->command->info('');
        $this->command->info('All users have password: password');
    }
}