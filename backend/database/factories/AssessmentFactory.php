<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assessment>
 */
class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $riskScore = $this->faker->numberBetween(1, 25);
        $riskLevel = $this->getRiskLevel($riskScore);

        return [
            'mobile_user_id' => 'mobile_' . $this->faker->uuid(),
            'session_id' => 'session_' . $this->faker->uuid(),
            'assessment_external_id' => 'ASS-' . strtoupper($this->faker->bothify('??##??##')),
            'patient_first_name' => $this->faker->firstName(),
            'patient_last_name' => $this->faker->lastName(),
            'patient_date_of_birth' => $this->faker->dateTimeBetween('-80 years', '-18 years'),
            'patient_sex' => $this->faker->randomElement(['Male', 'Female']),
            'patient_email' => $this->faker->unique()->safeEmail(),
            'patient_phone' => '+63' . $this->faker->numerify('##########'),
            'assessment_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'version' => '1.0.0',
            'country' => 'Philippines',
            'region' => $this->faker->randomElement(['NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII']),
            'city' => $this->faker->city(),
            'latitude' => $this->faker->latitude(4.5, 21.0),
            'longitude' => $this->faker->longitude(116.0, 127.0),
            'ml_risk_score' => $riskScore,
            'ml_risk_level' => $riskLevel,
            'final_risk_score' => $riskScore,
            'final_risk_level' => $riskLevel,
            'urgency' => $this->getUrgency($riskLevel),
            'recommended_action' => $this->getRecommendedAction($riskLevel),
            'vital_signs' => $this->generateVitalSigns(),
            'symptoms' => $this->generateSymptoms(),
            'medical_history' => $this->generateMedicalHistory(),
            'medications' => $this->generateMedications(),
            'lifestyle' => $this->generateLifestyle(),
            'recommendations' => $this->generateRecommendations($riskLevel),
            'status' => 'pending',
            'device_platform' => $this->faker->randomElement(['iOS', 'Android']),
            'device_version' => $this->faker->randomElement(['14.0', '15.0', '16.0', '17.0']),
            'app_version' => $this->faker->randomElement(['1.0.0', '1.1.0', '1.2.0']),
            'mobile_created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'synced_at' => now(),
            'version_counter' => 1,
        ];
    }

    /**
     * State for pending assessments
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'validated_by' => null,
            'validated_at' => null,
            'validation_notes' => null,
            'validation_agrees_with_ml' => null,
        ]);
    }

    /**
     * State for validated assessments
     */
    public function validated(): static
    {
        return $this->state(function (array $attributes) {
            $validator = User::factory()->create();

            return [
                'status' => 'validated',
                'validated_by' => $validator->id,
                'validated_at' => now(),
                'validation_notes' => $this->faker->sentence(),
                'validation_agrees_with_ml' => $this->faker->boolean(70),
            ];
        });
    }

    /**
     * State for rejected assessments
     */
    public function rejected(): static
    {
        return $this->state(function (array $attributes) {
            $validator = User::factory()->create();

            return [
                'status' => 'rejected',
                'validated_by' => $validator->id,
                'validated_at' => now(),
                'validation_notes' => $this->faker->sentence(10),
                'validation_agrees_with_ml' => false,
            ];
        });
    }

    /**
     * State for high risk assessments
     */
    public function highRisk(): static
    {
        $riskScore = $this->faker->numberBetween(18, 25);

        return $this->state(fn (array $attributes) => [
            'ml_risk_score' => $riskScore,
            'ml_risk_level' => 'High',
            'final_risk_score' => $riskScore,
            'final_risk_level' => 'High',
            'urgency' => 'Urgent',
            'recommended_action' => 'Immediate medical attention required',
        ]);
    }

    /**
     * State for moderate risk assessments
     */
    public function moderateRisk(): static
    {
        $riskScore = $this->faker->numberBetween(10, 17);

        return $this->state(fn (array $attributes) => [
            'ml_risk_score' => $riskScore,
            'ml_risk_level' => 'Moderate',
            'final_risk_score' => $riskScore,
            'final_risk_level' => 'Moderate',
            'urgency' => 'Routine',
            'recommended_action' => 'Schedule follow-up within 2 weeks',
        ]);
    }

    /**
     * State for low risk assessments
     */
    public function lowRisk(): static
    {
        $riskScore = $this->faker->numberBetween(1, 9);

        return $this->state(fn (array $attributes) => [
            'ml_risk_score' => $riskScore,
            'ml_risk_level' => 'Low',
            'final_risk_score' => $riskScore,
            'final_risk_level' => 'Low',
            'urgency' => 'Routine',
            'recommended_action' => 'Continue with regular health monitoring',
        ]);
    }

    /**
     * Helper: Get risk level from score
     */
    private function getRiskLevel(int $score): string
    {
        if ($score >= 18) {
            return 'High';
        } elseif ($score >= 10) {
            return 'Moderate';
        } else {
            return 'Low';
        }
    }

    /**
     * Helper: Get urgency from risk level
     */
    private function getUrgency(string $riskLevel): string
    {
        return match ($riskLevel) {
            'High' => 'Urgent',
            'Moderate' => 'Routine',
            'Low' => 'Routine',
            default => 'Routine',
        };
    }

    /**
     * Helper: Get recommended action from risk level
     */
    private function getRecommendedAction(string $riskLevel): string
    {
        return match ($riskLevel) {
            'High' => 'Immediate medical attention required',
            'Moderate' => 'Schedule follow-up within 2 weeks',
            'Low' => 'Continue with regular health monitoring',
            default => 'Continue with regular health monitoring',
        };
    }

    /**
     * Generate realistic vital signs
     */
    private function generateVitalSigns(): array
    {
        return [
            'systolic_bp' => $this->faker->numberBetween(90, 180),
            'diastolic_bp' => $this->faker->numberBetween(60, 120),
            'heart_rate' => $this->faker->numberBetween(50, 120),
            'temperature' => $this->faker->randomFloat(1, 36.0, 38.5),
            'respiratory_rate' => $this->faker->numberBetween(12, 20),
            'oxygen_saturation' => $this->faker->numberBetween(92, 100),
            'weight' => $this->faker->numberBetween(45, 120),
            'height' => $this->faker->numberBetween(150, 190),
            'bmi' => $this->faker->randomFloat(1, 18.5, 35.0),
        ];
    }

    /**
     * Generate symptoms array
     */
    private function generateSymptoms(): array
    {
        $possibleSymptoms = [
            'chest_pain', 'shortness_of_breath', 'fatigue', 'dizziness',
            'palpitations', 'leg_swelling', 'irregular_heartbeat'
        ];

        $numSymptoms = $this->faker->numberBetween(0, 4);
        $symptoms = $this->faker->randomElements($possibleSymptoms, $numSymptoms);

        return array_fill_keys($symptoms, true);
    }

    /**
     * Generate medical history
     */
    private function generateMedicalHistory(): array
    {
        return [
            'hypertension' => $this->faker->boolean(30),
            'diabetes' => $this->faker->boolean(20),
            'high_cholesterol' => $this->faker->boolean(25),
            'previous_heart_attack' => $this->faker->boolean(10),
            'stroke' => $this->faker->boolean(8),
            'family_history_cvd' => $this->faker->boolean(40),
        ];
    }

    /**
     * Generate medications array
     */
    private function generateMedications(): array
    {
        $possibleMeds = [
            'aspirin', 'beta_blocker', 'ace_inhibitor', 'statin',
            'calcium_channel_blocker', 'diuretic'
        ];

        $numMeds = $this->faker->numberBetween(0, 3);
        return $this->faker->randomElements($possibleMeds, $numMeds);
    }

    /**
     * Generate lifestyle data
     */
    private function generateLifestyle(): array
    {
        return [
            'smoking' => $this->faker->randomElement(['never', 'former', 'current']),
            'alcohol_consumption' => $this->faker->randomElement(['none', 'moderate', 'heavy']),
            'physical_activity' => $this->faker->randomElement(['sedentary', 'light', 'moderate', 'active']),
            'diet' => $this->faker->randomElement(['poor', 'fair', 'good', 'excellent']),
            'stress_level' => $this->faker->randomElement(['low', 'moderate', 'high']),
        ];
    }

    /**
     * Generate recommendations based on risk level
     */
    private function generateRecommendations(string $riskLevel): array
    {
        $baseRecommendations = [
            'Maintain a heart-healthy diet',
            'Exercise regularly',
            'Monitor blood pressure',
        ];

        if ($riskLevel === 'High') {
            return array_merge($baseRecommendations, [
                'Seek immediate medical attention',
                'Schedule urgent cardiology consultation',
            ]);
        } elseif ($riskLevel === 'Moderate') {
            return array_merge($baseRecommendations, [
                'Schedule follow-up within 2 weeks',
                'Consider lifestyle modifications',
            ]);
        }

        return $baseRecommendations;
    }
}
