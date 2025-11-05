<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HealthcareFacility extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'healthcare_facilities';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'code',
        'type',
        'level',
        'address',
        'city',
        'province',
        'region',
        'phone',
        'email',
        'website',
        'latitude',
        'longitude',
        'operating_hours',
        'is_24_7',
        'has_emergency',
        'services',
        'bed_capacity',
        'icu_capacity',
        'current_bed_availability',
        'is_public',
        'is_doh_accredited',
        'is_philhealth_accredited',
        'accreditations',
        'accepts_referrals',
        'average_response_time_hours',
        'preferred_referral_types',
        'is_active',
        'status_notes',
        'is_verified',
        'created_from_mobile',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'operating_hours' => 'array',
            'is_24_7' => 'boolean',
            'has_emergency' => 'boolean',
            'services' => 'array',
            'bed_capacity' => 'integer',
            'icu_capacity' => 'integer',
            'current_bed_availability' => 'integer',
            'is_public' => 'boolean',
            'is_doh_accredited' => 'boolean',
            'is_philhealth_accredited' => 'boolean',
            'accreditations' => 'array',
            'accepts_referrals' => 'boolean',
            'average_response_time_hours' => 'integer',
            'preferred_referral_types' => 'array',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'created_from_mobile' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the users associated with this facility.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'facility_id');
    }

    /**
     * Get the referrals sent from this facility.
     */
    public function referralsSent()
    {
        return $this->hasMany(Referral::class, 'source_facility_id');
    }

    /**
     * Get the referrals received by this facility.
     */
    public function referralsReceived()
    {
        return $this->hasMany(Referral::class, 'target_facility_id');
    }

    /**
     * Scope a query to only include active facilities.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include facilities accepting referrals.
     */
    public function scopeAcceptingReferrals($query)
    {
        return $query->where('accepts_referrals', true)->where('is_active', true);
    }

    /**
     * Scope a query to only include facilities of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include facilities in a specific region.
     */
    public function scopeInRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    /**
     * Scope a query to only include facilities with available beds.
     */
    public function scopeWithAvailableBeds($query)
    {
        return $query->where('current_bed_availability', '>', 0);
    }

    /**
     * Check if facility has emergency services.
     */
    public function hasEmergencyServices(): bool
    {
        return $this->has_emergency === true;
    }

    /**
     * Check if facility is operational 24/7.
     */
    public function isOpen24Hours(): bool
    {
        return $this->is_24_7 === true;
    }

    /**
     * Get bed occupancy percentage.
     */
    public function getBedOccupancyPercentage(): ?float
    {
        if (!$this->bed_capacity || $this->bed_capacity <= 0) {
            return null;
        }

        $occupied = $this->bed_capacity - ($this->current_bed_availability ?? 0);
        return round(($occupied / $this->bed_capacity) * 100, 2);
    }

    /**
     * Check if facility has a specific service.
     */
    public function hasService(string $service): bool
    {
        return in_array($service, $this->services ?? [], true);
    }
}
