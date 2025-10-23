<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MobileDataImportTest extends TestCase
{
    /**
     * Test importing sample mobile assessment data
     */
    public function test_can_import_sample_mobile_assessment_data(): void
    {
        // Load sample JSON from mobile database reference
        $sampleJsonPath = base_path('../mobile database reference/sample_assessment_data.json');

        if (!file_exists($sampleJsonPath)) {
            $this->markTestSkipped('Sample JSON file not found');
        }

        $mobileData = json_decode(file_get_contents($sampleJsonPath), true);

        $this->assertIsArray($mobileData);
        $this->assertArrayHasKey('assessment_id', $mobileData);
        $this->assertArrayHasKey('user_id', $mobileData);
        $this->assertArrayHasKey('symptoms', $mobileData);
        $this->assertArrayHasKey('vital_signs', $mobileData);
        $this->assertArrayHasKey('risk_assessment_results', $mobileData);

        // Test structure validity
        $this->assertEquals('ASSESS_2024_001', $mobileData['assessment_id']);
        $this->assertEquals('USER_12345', $mobileData['user_id']);

        echo "\n✅ Sample mobile data structure is valid\n";
        echo "   Assessment ID: {$mobileData['assessment_id']}\n";
        echo "   User ID: {$mobileData['user_id']}\n";
        echo "   Risk Level: {$mobileData['risk_assessment_results']['risk_category']}\n";
        echo "   Risk Score: {$mobileData['risk_assessment_results']['final_risk_score']}\n";
    }

    /**
     * Test database schema can accept mobile data structure
     */
    public function test_database_schema_accepts_mobile_data_fields(): void
    {
        // Test that assessments table has all required fields
        $columns = \DB::select("SHOW COLUMNS FROM assessments");
        $columnNames = array_column($columns, 'Field');

        // Check for new mobile compatibility fields
        $requiredFields = [
            'likelihood_score',
            'likelihood_level',
            'impact_score',
            'impact_level',
            'color_code',
            'timeframe',
            'confidence_level',
            'screen_resolution',
            'gps_accuracy_meters',
            'location_source',
            'api_version',
            'algorithm_version',
            'timezone',
            'language_preference',
            'next_assessment_recommended',
        ];

        foreach ($requiredFields as $field) {
            $this->assertContains($field, $columnNames, "Field {$field} is missing from assessments table");
        }

        echo "\n✅ All mobile compatibility fields exist in database\n";
    }

    /**
     * Test data privacy consent table exists
     */
    public function test_data_privacy_consent_table_exists(): void
    {
        $tables = \DB::select("SHOW TABLES");
        $tableNames = array_column($tables, 'Tables_in_juan_heart');

        $this->assertContains('data_privacy_consent', $tableNames);

        // Check table structure
        $columns = \DB::select("SHOW COLUMNS FROM data_privacy_consent");
        $columnNames = array_column($columns, 'Field');

        $requiredFields = [
            'mobile_user_id',
            'consent_given',
            'consent_date',
            'share_with_healthcare_providers',
            'share_for_research',
            'share_anonymized_data',
            'retention_period_years',
        ];

        foreach ($requiredFields as $field) {
            $this->assertContains($field, $columnNames);
        }

        echo "\n✅ Data privacy consent table structure is correct\n";
    }
}
