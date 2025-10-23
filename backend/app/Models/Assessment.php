<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'mobile_user_id',
        'session_id',
        'assessment_external_id',
        'patient_first_name',
        'patient_last_name',
        'patient_date_of_birth',
        'patient_sex',
        'patient_email',
        'patient_phone',
        'assessment_date',
        'version',
        'completion_rate',
        'assessment_duration_minutes',
        'data_quality_score',
        'country',
        'region',
        'city',
        'latitude',
        'longitude',
        'ml_risk_score',
        'ml_risk_level',
        'rule_based_score',
        'rule_based_level',
        'final_risk_score',
        'final_risk_level',
        'urgency',
        'recommended_action',
        'vital_signs',
        'symptoms',
        'medical_history',
        'medications',
        'lifestyle',
        'recommendations',
        'status',
        'validated_by',
        'validated_at',
        'validation_notes',
        'validation_agrees_with_ml',
        'device_platform',
        'device_version',
        'app_version',
        'model_confidence',
        'processing_time_ms',
        'mobile_created_at',
        'synced_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'patient_date_of_birth' => 'date',
            'assessment_date' => 'datetime',
            'completion_rate' => 'decimal:2',
            'data_quality_score' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'ml_risk_score' => 'integer',
            'rule_based_score' => 'integer',
            'final_risk_score' => 'integer',
            'vital_signs' => 'array',
            'symptoms' => 'array',
            'medical_history' => 'array',
            'medications' => 'array',
            'lifestyle' => 'array',
            'recommendations' => 'array',
            'validated_at' => 'datetime',
            'validation_agrees_with_ml' => 'boolean',
            'model_confidence' => 'decimal:2',
            'processing_time_ms' => 'integer',
            'mobile_created_at' => 'datetime',
            'synced_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the validator who validated this assessment.
     */
    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * Get the clinical validations for this assessment.
     */
    public function clinicalValidations()
    {
        return $this->hasMany(ClinicalValidation::class);
    }

    /**
     * Get the referrals for this assessment.
     */
    public function referrals()
    {
        return $this->hasMany(Referral::class);
    }

    /**
     * Get the comments for this assessment.
     */
    public function comments()
    {
        return $this->hasMany(AssessmentComment::class);
    }

    /**
     * Get the attachments for this assessment.
     */
    public function attachments()
    {
        return $this->hasMany(AssessmentAttachment::class);
    }

    /**
     * Scope a query to only include pending assessments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include validated assessments.
     */
    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    /**
     * Scope a query to only include high risk assessments.
     */
    public function scopeHighRisk($query)
    {
        return $query->where('final_risk_level', 'High');
    }

    /**
     * Scope a query to filter by risk level.
     */
    public function scopeByRiskLevel($query, string $level)
    {
        return $query->where('final_risk_level', $level);
    }

    /**
     * Scope a query to filter by region.
     */
    public function scopeInRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    /**
     * Scope a query to filter by urgency.
     */
    public function scopeByUrgency($query, string $urgency)
    {
        return $query->where('urgency', $urgency);
    }

    /**
     * Scope a query to include assessments created within date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('assessment_date', [$startDate, $endDate]);
    }

    /**
     * Check if assessment is high risk.
     */
    public function isHighRisk(): bool
    {
        return $this->final_risk_level === 'High';
    }

    /**
     * Check if assessment is validated.
     */
    public function isValidated(): bool
    {
        return $this->status === 'validated';
    }

    /**
     * Check if assessment requires referral.
     */
    public function requiresReferral(): bool
    {
        return $this->status === 'requires_referral' || $this->final_risk_level === 'High';
    }

    /**
     * Get patient's full name.
     */
    public function getPatientFullNameAttribute(): string
    {
        return trim("{$this->patient_first_name} {$this->patient_last_name}");
    }

    /**
     * Get patient's age.
     */
    public function getPatientAgeAttribute(): ?int
    {
        if (!$this->patient_date_of_birth) {
            return null;
        }

        return $this->patient_date_of_birth->age;
    }

    /**
     * Check if ML and clinical validation agree.
     */
    public function hasValidationAgreement(): bool
    {
        return $this->validation_agrees_with_ml === true;
    }
}
