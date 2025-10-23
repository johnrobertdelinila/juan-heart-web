<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorAvailability extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'doctor_id',
        'facility_id',
        'schedule_type',
        'day_of_week',
        'start_time',
        'end_time',
        'specific_date',
        'specific_start_time',
        'specific_end_time',
        'slot_duration_minutes',
        'buffer_time_minutes',
        'max_patients_per_slot',
        'is_available',
        'unavailability_reason',
        'effective_from',
        'effective_until',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specific_date' => 'date',
            'effective_from' => 'date',
            'effective_until' => 'date',
            'is_available' => 'boolean',
            'day_of_week' => 'integer',
            'slot_duration_minutes' => 'integer',
            'buffer_time_minutes' => 'integer',
            'max_patients_per_slot' => 'integer',
        ];
    }

    /**
     * Get the doctor.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the facility.
     */
    public function facility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'facility_id');
    }

    /**
     * Scope available schedules.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope by schedule type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('schedule_type', $type);
    }
}
