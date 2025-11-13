<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Mass assignable attributes.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'priority',
        'data',
        'action_url',
        'read_at',
        'acted_upon_at',
        'is_archived',
        'related_message_id',
        'related_referral_id',
        'related_assessment_id',
    ];

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
            'acted_upon_at' => 'datetime',
            'is_archived' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }
}
