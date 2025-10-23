<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentReminder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'appointment_id',
        'reminder_type',
        'channel',
        'scheduled_for',
        'status',
        'sent_at',
        'failure_reason',
        'message_content',
        'recipient',
        'patient_responded',
        'responded_at',
        'response_note',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_for' => 'datetime',
            'sent_at' => 'datetime',
            'responded_at' => 'datetime',
            'patient_responded' => 'boolean',
        ];
    }

    /**
     * Get the appointment.
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Scope pending reminders.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope sent reminders.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }
}
