<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

/**
 * Educational Content Model
 *
 * Stores bilingual educational content for Juan Heart Mobile app.
 * Supports offline-first architecture with version management.
 */
class EducationalContent extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'educational_contents';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category',
        'title_en',
        'title_fil',
        'description_en',
        'description_fil',
        'body_en',
        'body_fil',
        'reading_time_minutes',
        'image_url',
        'author',
        'published',
        'views',
        'version',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'published' => 'boolean',
        'views' => 'integer',
        'version' => 'integer',
        'reading_time_minutes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [];

    /**
     * Scope a query to only include published content.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published', true);
    }

    /**
     * Scope a query to filter by category.
     *
     * @param Builder $query
     * @param string $category
     * @return Builder
     */
    public function scopeCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to search content by title and description.
     *
     * @param Builder $query
     * @param string $searchTerm
     * @return Builder
     */
    public function scopeSearch(Builder $query, string $searchTerm): Builder
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('title_en', 'LIKE', "%{$searchTerm}%")
                ->orWhere('title_fil', 'LIKE', "%{$searchTerm}%")
                ->orWhere('description_en', 'LIKE', "%{$searchTerm}%")
                ->orWhere('description_fil', 'LIKE', "%{$searchTerm}%");
        });
    }

    /**
     * Scope a query to get recently published content.
     *
     * @param Builder $query
     * @param int $days
     * @return Builder
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Increment the view count for this content.
     *
     * @return bool
     */
    public function incrementViews(): bool
    {
        return $this->increment('views');
    }

    /**
     * Get all available categories.
     *
     * @return array
     */
    public static function getAvailableCategories(): array
    {
        return [
            'cvd_prevention',
            'symptom_recognition',
            'lifestyle_modification',
            'medication_compliance',
            'emergency_response',
            'risk_factors',
            'nutrition',
            'exercise',
        ];
    }

    /**
     * Get category statistics.
     *
     * @return \Illuminate\Support\Collection
     */
    public static function getCategoryStats(): \Illuminate\Support\Collection
    {
        return self::published()
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get();
    }

    /**
     * Get total view count across all content.
     *
     * @return int
     */
    public static function getTotalViews(): int
    {
        return self::published()->sum('views');
    }

    /**
     * Get content updated since a specific timestamp.
     *
     * @param \Carbon\Carbon|string $since
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getUpdatedSince($since): \Illuminate\Database\Eloquent\Collection
    {
        return self::published()
            ->where('updated_at', '>', $since)
            ->orderBy('updated_at')
            ->get();
    }
}
