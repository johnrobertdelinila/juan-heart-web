<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Educational Content Resource
 *
 * Transforms EducationalContent model to mobile-friendly JSON format.
 * Supports bilingual content with language filtering.
 */
class EducationalContentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get language preference from query parameter (default: both languages)
        $language = $request->query('language', null);

        // Base data structure
        $data = [
            'id' => (string) $this->id,
            'category' => $this->category,
            'version' => $this->version,
            'reading_time_minutes' => $this->reading_time_minutes,
            'image_url' => $this->image_url,
            'author' => $this->author,
            'views' => $this->views,
            'published' => $this->published,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        // Add bilingual content based on language parameter
        if ($language === 'fil') {
            // Filipino only
            $data['title'] = $this->title_fil;
            $data['description'] = $this->description_fil;
            $data['body'] = $this->body_fil;
        } elseif ($language === 'en') {
            // English only
            $data['title'] = $this->title_en;
            $data['description'] = $this->description_en;
            $data['body'] = $this->body_en;
        } else {
            // Both languages (for offline caching)
            $data['title_en'] = $this->title_en;
            $data['title_fil'] = $this->title_fil;
            $data['description_en'] = $this->description_en;
            $data['description_fil'] = $this->description_fil;
            $data['body_en'] = $this->body_en;
            $data['body_fil'] = $this->body_fil;
        }

        return $data;
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'success' => true,
        ];
    }
}
