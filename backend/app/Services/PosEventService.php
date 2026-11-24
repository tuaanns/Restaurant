<?php

namespace App\Services;

use App\Models\PosEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Service: Broadcast & Lưu trữ sự kiện POS thời gian thực (Real-time SSE / Polling Stream)
 */
class PosEventService
{
    /**
     * Phát một sự kiện POS mới
     *
     * @param string $eventType (table_updated | kitchen_updated | order_paid | menu_updated)
     * @param array $payload Dữ liệu kèm theo sự kiện
     * @return PosEvent
     */
    public static function emit(string $eventType, array $payload = []): PosEvent
    {
        try {
            $event = PosEvent::create([
                'event_type' => $eventType,
                'payload' => $payload,
                'created_at' => Carbon::now('Asia/Ho_Chi_Minh'),
            ]);

            // Tự động dọn dẹp để bảng pos_events luôn gọn nhẹ (chỉ giữ tối đa 500 sự kiện gần nhất)
            if ($event->id % 50 === 0) {
                self::pruneOldEvents();
            }

            return $event;
        } catch (\Exception $e) {
            Log::warning('PosEventService::emit failed: ' . $e->getMessage());
            // Trả về mock instance nếu có sự cố DB để không làm hỏng luồng chính
            $fallback = new PosEvent();
            $fallback->id = time();
            $fallback->event_type = $eventType;
            $fallback->payload = $payload;
            return $fallback;
        }
    }

    /**
     * Lấy danh sách sự kiện phát sinh từ sau ID được chỉ định
     */
    public static function getEventsSince(int $sinceId = 0, int $limit = 50): array
    {
        try {
            $query = PosEvent::query();
            if ($sinceId > 0) {
                $query->where('id', '>', $sinceId);
            }
            
            $events = $query->orderBy('id', 'asc')
                ->limit($limit)
                ->get();

            $latestId = $events->isNotEmpty() 
                ? $events->last()->id 
                : ($sinceId > 0 ? $sinceId : (PosEvent::max('id') ?? 0));

            return [
                'success' => true,
                'latest_id' => $latestId,
                'count' => $events->count(),
                'events' => $events->map(function ($ev) {
                    return [
                        'id' => $ev->id,
                        'event_type' => $ev->event_type,
                        'payload' => $ev->payload,
                        'timestamp' => $ev->created_at ? $ev->created_at->format('Y-m-d H:i:s') : null,
                    ];
                })->toArray(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'latest_id' => $sinceId,
                'count' => 0,
                'events' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Dọn dẹp sự kiện cũ hơn 500 records
     */
    public static function pruneOldEvents(): void
    {
        try {
            $latestId = PosEvent::max('id');
            if ($latestId && $latestId > 500) {
                PosEvent::where('id', '<', $latestId - 500)->delete();
            }
        } catch (\Exception $e) {}
    }
}
