<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyAlert extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'created_by',
        'title',
        'message',
        'severity',
        'target_audience',
        'target_facility_id',
        'expires_at',
        'is_active',
        'recipients_count',
        'acknowledged_count',
    ];

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user who created the alert.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the target facility (if facility-specific).
     */
    public function targetFacility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'target_facility_id');
    }

    /**
     * Get the acknowledgments for this alert.
     */
    public function acknowledgments()
    {
        return $this->hasMany(EmergencyAlertAcknowledgment::class, 'alert_id');
    }

    /**
     * Scope a query to only include active alerts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }

    /**
     * Scope a query to filter by severity.
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope a query to filter by target audience.
     */
    public function scopeForAudience($query, string $audience)
    {
        return $query->where('target_audience', $audience);
    }

    /**
     * Check if the alert has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Get the acknowledgment rate.
     */
    public function getAcknowledgmentRate(): float
    {
        if ($this->recipients_count === 0) {
            return 0;
        }

        return ($this->acknowledged_count / $this->recipients_count) * 100;
    }
}
