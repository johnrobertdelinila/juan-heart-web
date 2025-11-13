<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentRiskAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'adjusted_by',
        'old_score',
        'old_level',
        'new_score',
        'new_level',
        'difference',
        'justification',
        'alert_triggered',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'alert_triggered' => 'boolean',
        ];
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function clinician()
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }
}
