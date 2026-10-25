<?php

namespace Database\Seeders;

use App\Models\Series;
use Illuminate\Database\Seeder;

/**
 * Seeder tạo dữ liệu mẫu các bộ Phim Series AI phong phú đa dạng thể loại
 * Seeds rich AI short movie series data across all AI categories
 */
class SeriesSeeder extends Seeder
{
    public function run(): void
    {
        $seriesData = [
            [
                'id' => 1,
                'title' => 'Cyberpunk 2099: Neon Dawn',
                'title_vi' => 'Cyberpunk 2099: Bình Minh Neon',
                'title_en' => 'Cyberpunk 2099: Neon Dawn',
                'description' => 'Một thế giới tương lai nơi trí tuệ nhân tạo thống trị các thành phố ngầm neon. Kael phát hiện bí mật mở ra cánh cửa quá khứ.',
                'description_vi' => 'Một thế giới tương lai nơi trí tuệ nhân tạo thống trị các thành phố ngầm neon. Kael phát hiện bí mật mở ra cánh cửa quá khứ.',
                'description_en' => 'A futuristic world where AI rules underground neon cities. Kael discovers an ancient secret that changes humanity forever.',
                'thumbnail' => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Midjourney v6', 'Runway Gen-3', 'ElevenLabs Voice', 'Sora AI'],
                'genre' => 'Cyberpunk & Tương Lai',
                'rating' => 4.9,
            ],
            [
                'id' => 2,
                'title' => 'Chronicles of Aetheria: The Awakened',
                'title_vi' => 'Huyền Thoại Aetheria: Trỗi Dậy',
                'title_en' => 'Chronicles of Aetheria: The Awakened',
                'description' => 'Series ma thuật viễn tưởng kết hợp AI. Những hiệp sĩ phép thuật chiến đấu chống lại thực thể bóng tối.',
                'description_vi' => 'Series ma thuật viễn tưởng kết hợp AI. Những hiệp sĩ phép thuật chiến đấu chống lại thực thể bóng tối.',
                'description_en' => 'An epic fantasy series blended with generative AI imagery. Arcane knights fight against dark entities.',
                'thumbnail' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Stable Diffusion XL', 'Pika Labs', 'ElevenLabs', 'Luma Dream Machine'],
                'genre' => 'Ma Thuật & Dark Fantasy',
                'rating' => 4.8,
            ],
            [
                'id' => 3,
                'title' => 'AI Genesis: Awakening of Machine',
                'title_vi' => 'Khởi Nguyên AI: Trỗi Dậy Máy Móc',
                'title_en' => 'AI Genesis: Awakening of Machine',
                'description' => 'Cuộc hành trình tìm kiếm tâm hồn của robot siêu thông minh ARIA trong thế giới hoang tàn hậu tận thế.',
                'description_vi' => 'Cuộc hành trình tìm kiếm tâm hồn của robot siêu thông minh ARIA trong thế giới hoang tàn hậu tận thế.',
                'description_en' => 'The emotional journey of superintelligent android ARIA seeking human emotions in a post-apocalyptic desolate world.',
                'thumbnail' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Midjourney v6', 'Runway Gen-3', 'Kling AI', 'Udio Music'],
                'genre' => 'Hậu Tận Thế & Robot',
                'rating' => 4.7,
            ],
            [
                'id' => 4,
                'title' => 'Phantom Protocol: Tokyo Noir',
                'title_vi' => 'Mật Nghị Bóng Ma: Tokyo Đêm Noir',
                'title_en' => 'Phantom Protocol: Tokyo Noir',
                'description' => 'Cuộc săn đuổi kịch tính giữa các điệp viên cyborg trong những hẻm nhỏ mờ sương tại Tokyo năm 2085.',
                'description_vi' => 'Cuộc săn đuổi kịch tính giữa các điệp viên cyborg trong những hẻm nhỏ mờ sương tại Tokyo năm 2085.',
                'description_en' => 'A thrilling detective chase between enhanced cyborg agents in misty rainy Tokyo alleyways, 2085.',
                'thumbnail' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Midjourney v6', 'Runway Gen-2', 'Topaz Video AI'],
                'genre' => 'Cyberpunk & Tương Lai',
                'rating' => 4.9,
            ],
            [
                'id' => 5,
                'title' => 'Starlight Horizon: AI Anime 3D',
                'title_vi' => 'Chân Trời Tinh Tú: AI Anime 3D',
                'title_en' => 'Starlight Horizon: AI Anime 3D',
                'description' => 'Bộ phim hoạt hình AI phong cách Anime điện ảnh Nhật Bản chất lượng 4K đỉnh cao.',
                'description_vi' => 'Bộ phim hoạt hình AI phong cách Anime điện ảnh Nhật Bản chất lượng 4K đỉnh cao.',
                'description_en' => 'Breathtaking 4K AI animated series styled in Japanese cinematic anime graphics.',
                'thumbnail' => 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['NijiJourney v6', 'Animatediff', 'ElevenLabs Anime'],
                'genre' => 'AI Anime & 3D Cinematic',
                'rating' => 4.9,
            ],
            [
                'id' => 6,
                'title' => 'Neural Mind: Echoes of Memory',
                'title_vi' => 'Ký Ức Mạng Thần Kinh: Vô Tận',
                'title_en' => 'Neural Mind: Echoes of Memory',
                'description' => 'Bộ phim tâm lý viễn tưởng hấp dẫn xoay quanh việc lưu trữ ký ức con người vào trí tuệ nhân tạo đám mây.',
                'description_vi' => 'Bộ phim tâm lý viễn tưởng hấp dẫn xoay quanh việc lưu trữ ký ức con người vào trí tuệ nhân tạo đám mây.',
                'description_en' => 'A psychological sci-fi thriller dealing with uploading human memories to cloud AI.',
                'thumbnail' => 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Midjourney v6', 'Runway Gen-3', 'Sora AI', 'Suno Audio'],
                'genre' => 'Tâm Lý & Trí Tuệ AI',
                'rating' => 4.8,
            ],
            [
                'id' => 7,
                'title' => 'Arcane Realm: Dragon Oath',
                'title_vi' => 'Vương Quốc Huyền Thủy: Lời Thề Rồng',
                'title_en' => 'Arcane Realm: Dragon Oath',
                'description' => 'Cuộc chiến giữa rồng thần và các đại pháp sư trong thế giới thần thoại sản xuất hoàn toàn bằng AI.',
                'description_vi' => 'Cuộc chiến giữa rồng thần và các đại pháp sư trong thế giới thần thoại sản xuất hoàn toàn bằng AI.',
                'description_en' => 'Ancient dragon lords fight elemental mages in a majestic AI-generated fantasy world.',
                'thumbnail' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Stable Diffusion XL', 'Midjourney v6', 'Luma Dream Machine'],
                'genre' => 'Ma Thuật & Dark Fantasy',
                'rating' => 4.9,
            ],
            [
                'id' => 8,
                'title' => 'Post-Earth 2150: Wasteland',
                'title_vi' => 'Trái Đất Hậu Tận Thế 2150',
                'title_en' => 'Post-Earth 2150: Wasteland',
                'description' => 'Hành trình sinh tồn của nhóm chiến binh cuối cùng trên bề mặt Trái Đất bị tàn phá.',
                'description_vi' => 'Hành trình sinh tồn của nhóm chiến binh cuối cùng trên bề mặt Trái Đất bị tàn phá.',
                'description_en' => 'Survival journey of the last human squad wandering Earth post-destruction.',
                'thumbnail' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
                'status' => 'active',
                'ai_tools' => ['Midjourney v6', 'Runway Gen-3', 'Pika Labs'],
                'genre' => 'Hậu Tận Thế & Robot',
                'rating' => 4.7,
            ],
        ];

        foreach ($seriesData as $data) {
            Series::updateOrCreate(['id' => $data['id']], $data);
        }
    }
}
