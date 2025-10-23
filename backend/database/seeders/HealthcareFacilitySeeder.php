<?php

namespace Database\Seeders;

use App\Models\HealthcareFacility;
use Illuminate\Database\Seeder;

class HealthcareFacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Philippine Heart Center - Main facility
        HealthcareFacility::create([
            'name' => 'Philippine Heart Center',
            'code' => 'PHC-001',
            'type' => 'Medical Center',
            'level' => 'tertiary',
            'address' => 'East Avenue, Diliman',
            'city' => 'Quezon City',
            'province' => 'Metro Manila',
            'region' => 'NCR',
            'phone' => '+63 2 8925 2401',
            'email' => 'info@phc.gov.ph',
            'website' => 'https://www.phc.gov.ph',
            'latitude' => 14.6498,
            'longitude' => 121.0485,
            'is_24_7' => true,
            'has_emergency' => true,
            'services' => json_encode([
                'Cardiology',
                'Cardiovascular Surgery',
                'Emergency Care',
                'Intensive Care',
                'Laboratory Services',
                'Diagnostic Imaging'
            ]),
            'bed_capacity' => 280,
            'icu_capacity' => 40,
            'current_bed_availability' => 50,
            'is_public' => true,
            'is_doh_accredited' => true,
            'is_philhealth_accredited' => true,
            'accepts_referrals' => true,
            'average_response_time_hours' => 2,
            'preferred_referral_types' => json_encode([
                'High Risk CVD',
                'Emergency Cardiac Cases',
                'Post-MI Patients',
                'Heart Failure'
            ]),
            'is_active' => true,
        ]);

        // Philippine General Hospital
        HealthcareFacility::create([
            'name' => 'Philippine General Hospital',
            'code' => 'PGH-001',
            'type' => 'Tertiary Hospital',
            'level' => 'tertiary',
            'address' => 'Taft Avenue',
            'city' => 'Manila',
            'province' => 'Metro Manila',
            'region' => 'NCR',
            'phone' => '+63 2 8554 8400',
            'email' => 'info@pgh.gov.ph',
            'website' => 'https://www.pgh.gov.ph',
            'latitude' => 14.5795,
            'longitude' => 120.9842,
            'is_24_7' => true,
            'has_emergency' => true,
            'services' => json_encode([
                'Cardiology',
                'Internal Medicine',
                'Emergency Care',
                'Laboratory Services'
            ]),
            'bed_capacity' => 1500,
            'icu_capacity' => 100,
            'current_bed_availability' => 100,
            'is_public' => true,
            'is_doh_accredited' => true,
            'is_philhealth_accredited' => true,
            'accepts_referrals' => true,
            'average_response_time_hours' => 3,
            'is_active' => true,
        ]);

        // Vicente Sotto Memorial Medical Center (Cebu)
        HealthcareFacility::create([
            'name' => 'Vicente Sotto Memorial Medical Center',
            'code' => 'VSMMC-001',
            'type' => 'Regional Hospital',
            'level' => 'tertiary',
            'address' => 'B. Rodriguez St., Sambag II',
            'city' => 'Cebu City',
            'province' => 'Cebu',
            'region' => 'Region VII',
            'phone' => '+63 32 253 9891',
            'email' => 'info@vsmmc.gov.ph',
            'latitude' => 10.3157,
            'longitude' => 123.9058,
            'is_24_7' => true,
            'has_emergency' => true,
            'services' => json_encode([
                'Cardiology',
                'Internal Medicine',
                'Emergency Care',
                'Laboratory Services'
            ]),
            'bed_capacity' => 800,
            'icu_capacity' => 50,
            'current_bed_availability' => 80,
            'is_public' => true,
            'is_doh_accredited' => true,
            'is_philhealth_accredited' => true,
            'accepts_referrals' => true,
            'average_response_time_hours' => 4,
            'is_active' => true,
        ]);

        // Southern Philippines Medical Center (Davao)
        HealthcareFacility::create([
            'name' => 'Southern Philippines Medical Center',
            'code' => 'SPMC-001',
            'type' => 'Regional Hospital',
            'level' => 'tertiary',
            'address' => 'JP Laurel Avenue, Bajada',
            'city' => 'Davao City',
            'province' => 'Davao del Sur',
            'region' => 'Region XI',
            'phone' => '+63 82 227 2731',
            'email' => 'info@spmc.gov.ph',
            'latitude' => 7.0667,
            'longitude' => 125.6081,
            'is_24_7' => true,
            'has_emergency' => true,
            'services' => json_encode([
                'Cardiology',
                'Internal Medicine',
                'Emergency Care',
                'Laboratory Services'
            ]),
            'bed_capacity' => 1000,
            'icu_capacity' => 60,
            'current_bed_availability' => 120,
            'is_public' => true,
            'is_doh_accredited' => true,
            'is_philhealth_accredited' => true,
            'accepts_referrals' => true,
            'average_response_time_hours' => 3,
            'is_active' => true,
        ]);

        // Quezon City General Hospital
        HealthcareFacility::create([
            'name' => 'Quezon City General Hospital',
            'code' => 'QCGH-001',
            'type' => 'District Hospital',
            'level' => 'secondary',
            'address' => 'Seminary Road, Project 8',
            'city' => 'Quezon City',
            'province' => 'Metro Manila',
            'region' => 'NCR',
            'phone' => '+63 2 8426 1314',
            'email' => 'info@qcgh.gov.ph',
            'latitude' => 14.6765,
            'longitude' => 121.0463,
            'is_24_7' => true,
            'has_emergency' => true,
            'services' => json_encode([
                'Internal Medicine',
                'Emergency Care',
                'Laboratory Services'
            ]),
            'bed_capacity' => 300,
            'icu_capacity' => 20,
            'current_bed_availability' => 40,
            'is_public' => true,
            'is_doh_accredited' => true,
            'is_philhealth_accredited' => true,
            'accepts_referrals' => true,
            'average_response_time_hours' => 2,
            'is_active' => true,
        ]);

        $this->command->info('✅ Healthcare facilities seeded successfully!');
        $this->command->info('');
        $this->command->info('Created 5 healthcare facilities:');
        $this->command->info('  1. Philippine Heart Center (NCR) - Medical Center');
        $this->command->info('  2. Philippine General Hospital (NCR) - Tertiary Hospital');
        $this->command->info('  3. Vicente Sotto Memorial Medical Center (Cebu) - Regional Hospital');
        $this->command->info('  4. Southern Philippines Medical Center (Davao) - Regional Hospital');
        $this->command->info('  5. Quezon City General Hospital (NCR) - District Hospital');
    }
}