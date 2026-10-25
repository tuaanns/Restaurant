<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Episode Resource API Formatter
 */
class EpisodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'series_id' => $this->series_id,
            'title' => $this->title,
            'title_vi' => $this->title_vi ?? $this->title,
            'title_en' => $this->title_en ?? $this->title,
            'description' => $this->description,
            'description_vi' => $this->description_vi ?? $this->description,
            'description_en' => $this->description_en ?? $this->description,
            'episode_number' => (int) $this->episode_number,
            'duration' => $this->duration,
            'source_type' => $this->source_type,
            'video_url' => $this->video_url,
            'embed_url' => $this->embed_url,
            'view_count' => (int) $this->view_count,
            'created_at' => $this->created_at?->toIso8601String(),
            'series' => new SeriesResource($this->whenLoaded('series')),
        ];
    }
}
