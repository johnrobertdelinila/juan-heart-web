<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'middle_name',
        'date_of_birth',
        'sex',
        'phone',
        'license_no',
        'specialization',
        'position',
        'department',
        'facility_id',
        'language_preference',
        'status',
        'mfa_enabled',
        'mfa_method',
        'session_timeout_minutes',
        'bio',
        'profile_picture',
        'notification_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
        'backup_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'last_login_at' => 'datetime',
            'mfa_enabled' => 'boolean',
            'force_password_change' => 'boolean',
            'password_changed_at' => 'datetime',
            'notification_preferences' => 'array',
            'backup_codes' => 'encrypted:array',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the facility that the user belongs to.
     */
    public function facility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'facility_id');
    }

    /**
     * Get the user's activity logs.
     */
    public function activityLogs()
    {
        return $this->hasMany(UserActivityLog::class);
    }

    /**
     * Get the user's trusted devices.
     */
    public function trustedDevices()
    {
        return $this->hasMany(UserTrustedDevice::class);
    }

    /**
     * Get the assessments validated by this user.
     */
    public function validatedAssessments()
    {
        return $this->hasMany(Assessment::class, 'validated_by');
    }

    /**
     * Get the clinical validations performed by this user.
     */
    public function clinicalValidations()
    {
        return $this->hasMany(ClinicalValidation::class, 'doctor_id');
    }

    /**
     * Get the referrals created by this user.
     */
    public function referralsCreated()
    {
        return $this->hasMany(Referral::class, 'referring_user_id');
    }

    /**
     * Get the referrals assigned to this user.
     */
    public function referralsAssigned()
    {
        return $this->hasMany(Referral::class, 'assigned_doctor_id');
    }

    /**
     * Get the comments made by this user.
     */
    public function assessmentComments()
    {
        return $this->hasMany(AssessmentComment::class);
    }

    /**
     * Get the attachments uploaded by this user.
     */
    public function uploadedAttachments()
    {
        return $this->hasMany(AssessmentAttachment::class, 'uploaded_by');
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    /**
     * Check if the user has MFA enabled.
     */
    public function hasMfaEnabled(): bool
    {
        return $this->mfa_enabled === true;
    }

    /**
     * Check if the user is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include users from a specific facility.
     */
    public function scopeFromFacility($query, $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    /**
     * Scope a query to only include doctors.
     */
    public function scopeDoctors($query)
    {
        return $query->whereHas('roles', function ($q) {
            $q->where('name', 'doctor');
        });
    }
}
