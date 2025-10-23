<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicalValidation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'clinical_validations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'assessment_id',
        'doctor_id',
        'original_ml_score',
        'original_ml_level',
        'validated_score',
        'validated_level',
        'agreement_level',
        'score_difference',
        'clinical_notes',
        'additional_tests_required',
        'recommendations',
        'requires_immediate_attention',
        'requires_follow_up',
        'follow_up_days',
        'follow_up_instructions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'original_ml_score' => 'integer',
            'validated_score' => 'integer',
            'score_difference' => 'integer',
            'additional_tests_required' => 'array',
            'requires_immediate_attention' => 'boolean',
            'requires_follow_up' => 'boolean',
            'follow_up_days' => 'integer',
        ];
    }

    /**
     * Get the assessment that this validation belongs to.
     */
    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the doctor who performed the validation.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Check if validation agrees with ML model.
     */
    public function agreesWithML(): bool
    {
        return $this->agreement_level === 'complete_agreement';
    }

    /**
     * Check if there's significant difference from ML.
     */
    public function hasSignificantDifference(): bool
    {
        return in_array($this->agreement_level, ['significant_difference', 'complete_disagreement']);
    }
}
