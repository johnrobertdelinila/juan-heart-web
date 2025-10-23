<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralHistory extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // History records are immutable

    protected $table = 'referral_history';

    protected $fillable = [
        'referral_id',
        'user_id',
        'action',
        'action_description',
        'previous_status',
        'new_status',
        'notes',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the referral this history entry belongs to
     */
    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    /**
     * Get the user who performed this action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a history entry
     */
    public static function log(
        int $referralId,
        string $action,
        string $description,
        ?int $userId = null,
        ?string $previousStatus = null,
        ?string $newStatus = null,
        ?string $notes = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'referral_id' => $referralId,
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'action_description' => $description,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'notes' => $notes,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Scope to filter by action
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get status changes
     */
    public function scopeStatusChanges($query)
    {
        return $query->where('action', 'status_changed');
    }

    /**
     * Get formatted timestamp
     */
    public function getFormattedTimestamp(): string
    {
        return $this->created_at->format('M d, Y h:i A');
    }
}
