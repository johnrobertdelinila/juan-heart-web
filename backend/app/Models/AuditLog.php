<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'audit_logs';

    /**
     * Disable updated_at timestamp since audit logs are immutable.
     *
     * @var bool
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'user_email',
        'user_role',
        'session_id',
        'event_type',
        'event_category',
        'action_description',
        'ip_address',
        'user_agent',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'http_method',
        'url',
        'request_data',
        'response_code',
        'response_message',
        'severity',
        'is_sensitive',
        'is_suspicious',
        'requires_review',
        'reviewed_at',
        'reviewed_by',
        'contains_pii',
        'contains_phi',
        'data_classification',
        'execution_time_ms',
        'memory_usage_mb',
        'query_count',
        'facility_id',
        'tags',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'request_data' => 'array',
            'response_code' => 'integer',
            'is_sensitive' => 'boolean',
            'is_suspicious' => 'boolean',
            'requires_review' => 'boolean',
            'reviewed_at' => 'datetime',
            'contains_pii' => 'boolean',
            'contains_phi' => 'boolean',
            'execution_time_ms' => 'integer',
            'memory_usage_mb' => 'integer',
            'query_count' => 'integer',
            'tags' => 'array',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the user associated with this audit log.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reviewer of this audit log.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope a query to only include high severity logs.
     */
    public function scopeHighSeverity($query)
    {
        return $query->whereIn('severity', ['high', 'critical']);
    }

    /**
     * Scope a query to only include suspicious activity.
     */
    public function scopeSuspicious($query)
    {
        return $query->where('is_suspicious', true);
    }

    /**
     * Scope a query to only include logs requiring review.
     */
    public function scopeRequiringReview($query)
    {
        return $query->where('requires_review', true)->whereNull('reviewed_at');
    }

    /**
     * Scope a query to filter by event type.
     */
    public function scopeByEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope a query to filter by event category.
     */
    public function scopeByEventCategory($query, string $category)
    {
        return $query->where('event_category', $category);
    }

    /**
     * Scope a query to filter logs containing PHI/PII.
     */
    public function scopeContainsSensitiveData($query)
    {
        return $query->where(function ($q) {
            $q->where('contains_pii', true)->orWhere('contains_phi', true);
        });
    }
}
