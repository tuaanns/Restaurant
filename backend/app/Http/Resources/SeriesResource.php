<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Series Resource API Formatter
 */
class SeriesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'title_vi' => $this->title_vi ?? $this->title,
            'title_en' => $this->title_en ?? $this->title,
            'description' => $this->description,
            'description_vi' => $this->description_vi ?? $this->description,
            'description_en' => $this->description_en ?? $this->description,
            'thumbnail' => $this->thumbnail,
            'status' => $this->status,
            'ai_tools' => $this->ai_tools ?? [],
            'genre' => $this->genre,
            'rating' => (float) $this->rating,
            'total_episodes' => $this->whenLoaded('episodes', fn() => $this->episodes->count(), $this->episodes()->count()),
            'total_views' => (int) $this->episodes()->sum('view_count'),
            'episodes' => EpisodeResource::collection($this->whenLoaded('episodes')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
