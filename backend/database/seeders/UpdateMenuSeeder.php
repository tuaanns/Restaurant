<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Product;

class UpdateMenuSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('products')->truncate();
        DB::table('categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $cat_1 = Category::create([
            'id' => 1,
            'name' => 'Món chính',
            'code' => 'CAT_MAIN',
            'sort_order' => 1,
        ]);

        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Cơm pilaf truyền thống',
            'code' => 'MC01',
            'price' => 190000,
            'unit' => 'phần',
            'description' => 'Cơm, thịt bò, cà rốt, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Kazan kebab',
            'code' => 'MC02',
            'price' => 280000,
            'unit' => 'phần',
            'description' => 'Thịt, khoai tây, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Bò hầm Goulash',
            'code' => 'MC03',
            'price' => 190000,
            'unit' => 'phần',
            'description' => 'Thịt bò, hành tây, cà rốt, sốt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Bánh Manti hấp nhân thịt bò',
            'code' => 'MC04',
            'price' => 190000,
            'unit' => 'phần',
            'description' => 'Bột, thịt bò, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Thịt bò xào cay',
            'code' => 'MC05',
            'price' => 250000,
            'unit' => 'phần',
            'description' => 'Thịt bò, ớt, hành tây, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Lagman Uyghur',
            'code' => 'MC06',
            'price' => 190000,
            'unit' => 'tô',
            'description' => 'Mì kéo tay, thịt bò, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Đùi gà ăn kèm khoai tây chiên',
            'code' => 'MC07',
            'price' => 180000,
            'unit' => 'phần',
            'description' => 'Đùi gà, khoai tây chiên, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Mì Lagman chiên',
            'code' => 'MC08',
            'price' => 200000,
            'unit' => 'dĩa',
            'description' => 'Mì, thịt bò, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Kurdak (thịt hầm kiểu Trung Á)',
            'code' => 'MC09',
            'price' => 280000,
            'unit' => 'phần',
            'description' => 'Thịt, khoai tây, hành tây, cà rốt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_1->id,
            'name' => 'Cánh gà chiên giòn',
            'code' => 'MC10',
            'price' => 220000,
            'unit' => 'phần',
            'description' => 'Cánh gà, gia vị',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_2 = Category::create([
            'id' => 2,
            'name' => 'Thịt nướng',
            'code' => 'CAT_BBQ',
            'sort_order' => 2,
        ]);

        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Kebab cừu xay nướng xiên',
            'code' => 'BBQ11',
            'price' => 140000,
            'unit' => 'xiên',
            'description' => 'Thịt cừu xay, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Kebab bò xay nướng xiên',
            'code' => 'BBQ12',
            'price' => 140000,
            'unit' => 'xiên',
            'description' => 'Thịt bò xay, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Phi lê gà nướng xiên',
            'code' => 'BBQ13',
            'price' => 130000,
            'unit' => 'xiên',
            'description' => 'Phi lê gà',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Cánh gà nướng xiên',
            'code' => 'BBQ14',
            'price' => 130000,
            'unit' => 'xiên',
            'description' => 'Cánh gà',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Thịt nướng xiên thập cẩm',
            'code' => 'BBQ15',
            'price' => 1800000,
            'unit' => 'mẹt',
            'description' => 'Cừu, bò, gà, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Thịt cừu nướng xiên miếng',
            'code' => 'BBQ16',
            'price' => 160000,
            'unit' => 'xiên',
            'description' => 'Thịt cừu, hành tây; khẩu phần 120 g',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_2->id,
            'name' => 'Thịt bò nướng xiên miếng',
            'code' => 'BBQ17',
            'price' => 160000,
            'unit' => 'xiên',
            'description' => 'Thịt bò, hành tây; khẩu phần 120 g',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_3 = Category::create([
            'id' => 3,
            'name' => 'Súp',
            'code' => 'CAT_SOUPS',
            'sort_order' => 3,
        ]);

        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Lagman',
            'code' => 'SUP18',
            'price' => 160000,
            'unit' => 'tô',
            'description' => 'Mì, thịt bò, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Shurpa thịt cừu',
            'code' => 'SUP19',
            'price' => 190000,
            'unit' => 'tô',
            'description' => 'Thịt cừu, khoai tây, cà rốt, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Shurpa thịt bò',
            'code' => 'SUP20',
            'price' => 170000,
            'unit' => 'tô',
            'description' => 'Thịt bò, khoai tây, cà rốt, hành tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Manpar',
            'code' => 'SUP21',
            'price' => 160000,
            'unit' => 'tô',
            'description' => 'Mì nhà làm, thịt, rau củ',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Borscht củ dền',
            'code' => 'SUP22',
            'price' => 160000,
            'unit' => 'tô',
            'description' => 'Thịt bò, củ dền, bắp cải, khoai tây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Mastava',
            'code' => 'SUP23',
            'price' => 150000,
            'unit' => 'tô',
            'description' => 'Cơm, thịt bò, khoai tây, cà rốt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_3->id,
            'name' => 'Súp Chuchvara nhân thịt bò',
            'code' => 'SUP24',
            'price' => 160000,
            'unit' => 'tô',
            'description' => 'Bánh bột nhân thịt bò, hành tây, nước dùng',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_4 = Category::create([
            'id' => 4,
            'name' => 'Salad',
            'code' => 'CAT_SALAD',
            'sort_order' => 4,
        ]);

        Product::create([
            'category_id' => $cat_4->id,
            'name' => 'Salad Caesar tôm',
            'code' => 'SL25',
            'price' => 150000,
            'unit' => 'dĩa',
            'description' => 'Tôm, xà lách, phô mai, bánh mì giòn, sốt Caesar',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_4->id,
            'name' => 'Salad Caesar gà',
            'code' => 'SL26',
            'price' => 150000,
            'unit' => 'dĩa',
            'description' => 'Gà, xà lách, phô mai, bánh mì giòn, sốt Caesar',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_4->id,
            'name' => 'Salad Achuchuk',
            'code' => 'SL27',
            'price' => 80000,
            'unit' => 'dĩa',
            'description' => 'Cà chua, hành tây, ớt cay, rau thơm',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_4->id,
            'name' => 'Salad Night Zhor',
            'code' => 'SL28',
            'price' => 150000,
            'unit' => 'dĩa',
            'description' => 'Thịt, rau củ, hành tây, rau thơm, sốt',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_5 = Category::create([
            'id' => 5,
            'name' => 'Món ăn kèm',
            'code' => 'CAT_SIDES',
            'sort_order' => 5,
        ]);

        Product::create([
            'category_id' => $cat_5->id,
            'name' => 'Cơm trắng',
            'code' => 'AK29',
            'price' => 50000,
            'unit' => 'chén',
            'description' => 'Cơm trắng dẻo thơm',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_5->id,
            'name' => 'Mì sợi',
            'code' => 'AK30',
            'price' => 50000,
            'unit' => 'chén',
            'description' => 'Mì sợi tươi luộc chín',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_5->id,
            'name' => 'Khoai tây nghiền',
            'code' => 'AK31',
            'price' => 60000,
            'unit' => 'phần',
            'description' => 'Khoai tây, bơ, sữa, muối',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_5->id,
            'name' => 'Khoai tây kiểu đồng quê',
            'code' => 'AK32',
            'price' => 90000,
            'unit' => 'dĩa',
            'description' => 'Khoai tây, gia vị',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_5->id,
            'name' => 'Khoai tây chiên',
            'code' => 'AK33',
            'price' => 90000,
            'unit' => 'dĩa',
            'description' => 'Khoai tây chiên giòn rụm',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_6 = Category::create([
            'id' => 6,
            'name' => 'Bánh',
            'code' => 'CAT_PASTRIES',
            'sort_order' => 6,
        ]);

        Product::create([
            'category_id' => $cat_6->id,
            'name' => 'Samsa nhân gà',
            'code' => 'BH34',
            'price' => 90000,
            'unit' => 'cái',
            'description' => 'Bột, thịt gà, hành tây, gia vị',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_6->id,
            'name' => 'Samsa nhân bò',
            'code' => 'BH35',
            'price' => 100000,
            'unit' => 'cái',
            'description' => 'Bột, thịt bò, hành tây, gia vị',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_6->id,
            'name' => 'Cheburek nhân bò',
            'code' => 'BH36',
            'price' => 80000,
            'unit' => 'cái',
            'description' => 'Bột, thịt bò, hành tây, gia vị',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_6->id,
            'name' => 'Bánh mì dẹt truyền thống',
            'code' => 'BH37',
            'price' => 70000,
            'unit' => 'cái',
            'description' => 'Bột mì, nước, muối',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_7 = Category::create([
            'id' => 7,
            'name' => 'Trà',
            'code' => 'CAT_TEA',
            'sort_order' => 7,
        ]);

        Product::create([
            'category_id' => $cat_7->id,
            'name' => 'Trà chanh dây',
            'code' => 'TR38',
            'price' => 70000,
            'unit' => 'ấm',
            'description' => 'Trà, chanh dây, đường',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_7->id,
            'name' => 'Trà Tashkent',
            'code' => 'TR39',
            'price' => 80000,
            'unit' => 'ấm',
            'description' => 'Trà, chanh, bạc hà, gia vị',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_7->id,
            'name' => 'Trà sữa',
            'code' => 'TR40',
            'price' => 70000,
            'unit' => 'ly',
            'description' => 'Trà, sữa',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_7->id,
            'name' => 'Trà chanh',
            'code' => 'TR41',
            'price' => 70000,
            'unit' => 'ly',
            'description' => 'Trà, chanh, đường',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_7->id,
            'name' => 'Trà đen',
            'code' => 'TR42',
            'price' => 50000,
            'unit' => 'ấm',
            'description' => 'Trà đen truyền thống',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_7->id,
            'name' => 'Trà xanh',
            'code' => 'TR43',
            'price' => 50000,
            'unit' => 'ấm',
            'description' => 'Trà xanh thanh mát',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_8 = Category::create([
            'id' => 8,
            'name' => 'Pizza',
            'code' => 'CAT_PIZZA',
            'sort_order' => 8,
        ]);

        Product::create([
            'category_id' => $cat_8->id,
            'name' => 'Pizza Pepperoni',
            'code' => 'PZ44',
            'price' => 340000,
            'unit' => 'cái',
            'description' => 'Sốt cà chua, phô mai mozzarella, xúc xích pepperoni; 30 cm',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_8->id,
            'name' => 'Pizza thập cẩm thịt',
            'code' => 'PZ45',
            'price' => 320000,
            'unit' => 'cái',
            'description' => 'Sốt cà chua, mozzarella, bò, gà, xúc xích, thịt xông khói; 30 cm',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_8->id,
            'name' => 'Pizza gà nấm',
            'code' => 'PZ46',
            'price' => 320000,
            'unit' => 'cái',
            'description' => 'Sốt cà chua, mozzarella, gà, nấm; 30 cm',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_8->id,
            'name' => 'Pizza Margherita',
            'code' => 'PZ47',
            'price' => 280000,
            'unit' => 'cái',
            'description' => 'Sốt cà chua, mozzarella, húng quế; 30 cm',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_9 = Category::create([
            'id' => 9,
            'name' => 'Sushi cuộn',
            'code' => 'CAT_SUSHI_ROLL',
            'sort_order' => 9,
        ]);

        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn cá hồi nướng',
            'code' => 'SR48',
            'price' => 290000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, cá hồi, dưa chuột, sốt unagi, mè',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn Philadelphia bơ',
            'code' => 'SR49',
            'price' => 290000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, phô mai kem, bơ, cá hồi, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn nướng',
            'code' => 'SR50',
            'price' => 280000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, gà luộc, dưa chuột, phô mai kem, gừng, mè, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn lươn phô mai kem',
            'code' => 'SR51',
            'price' => 300000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, phô mai kem, dưa chuột, lươn nướng, mè trắng',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn Kanada',
            'code' => 'SR52',
            'price' => 320000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, tôm, phô mai kem, dưa chuột, trứng cá chuồn, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn California nướng',
            'code' => 'SR53',
            'price' => 290000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, dưa chuột, bơ, thanh cua, tobiko, sốt unagi, mè',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn California cá hồi',
            'code' => 'SR53B',
            'price' => 320000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, bơ, dưa chuột, cá hồi, trứng cá chuồn',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn Dragon',
            'code' => 'SR54',
            'price' => 360000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, phô mai kem, dưa chuột, sốt unagi, trứng cá chuồn, mè',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn Philadelphia',
            'code' => 'SR55',
            'price' => 280000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, phô mai kem, dưa chuột, cá hồi, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn gà Star',
            'code' => 'SR56',
            'price' => 280000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, gà luộc, dưa chuột, hạt hướng dương, sốt mayonnaise, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn Mummy',
            'code' => 'SR57',
            'price' => 270000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, phô mai kem, dưa chuột, cá hồi chiên giòn, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn cá hồi dưa chuột không rong biển',
            'code' => 'SR58',
            'price' => 280000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, cá hồi, dưa chuột, phô mai kem, mè trắng',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn California tôm',
            'code' => 'SR59',
            'price' => 320000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, tôm chiên, bơ, dưa chuột, trứng cá chuồn, tobiko',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_9->id,
            'name' => 'Sushi cuộn California thanh cua',
            'code' => 'SR68',
            'price' => 320000,
            'unit' => 'cuộn',
            'description' => 'Cơm sushi, rong biển, bơ, dưa chuột, thanh cua, trứng cá chuồn',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_10 = Category::create([
            'id' => 10,
            'name' => 'Set sushi',
            'code' => 'CAT_SUSHI_SET',
            'sort_order' => 10,
        ]);

        Product::create([
            'category_id' => $cat_10->id,
            'name' => 'Set sushi 1',
            'code' => 'SS60',
            'price' => 990000,
            'unit' => 'set',
            'description' => 'California, cá hồi, thanh cua, dưa chuột, sốt mayonnaise, sốt đặc biệt',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_10->id,
            'name' => 'Set sushi 2',
            'code' => 'SS61',
            'price' => 990000,
            'unit' => 'set',
            'description' => 'California nướng; California cá hồi; California tôm; California thanh cua',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_10->id,
            'name' => 'Set sushi 3',
            'code' => 'SS62',
            'price' => 750000,
            'unit' => 'set',
            'description' => 'California nướng, California Dragon',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_10->id,
            'name' => 'Set sushi 4',
            'code' => 'SS63',
            'price' => 1250000,
            'unit' => 'set',
            'description' => 'California, Kanada, Philadelphia, unagi, chicken roll; mỗi loại 8 miếng',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_10->id,
            'name' => 'Set sushi 5',
            'code' => 'SS64',
            'price' => 800000,
            'unit' => 'set',
            'description' => 'California, Philadelphia, Kanada',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_10->id,
            'name' => 'Set sushi 6',
            'code' => 'SS65',
            'price' => 1090000,
            'unit' => 'set',
            'description' => 'Philadelphia, Philadelphia nướng, chicken roll nướng, California; mỗi loại 8 miếng',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_11 = Category::create([
            'id' => 11,
            'name' => 'Sushi & Nigiri',
            'code' => 'CAT_NIGIRI',
            'sort_order' => 11,
        ]);

        Product::create([
            'category_id' => $cat_11->id,
            'name' => 'Set sushi mini',
            'code' => 'SN66',
            'price' => 390000,
            'unit' => 'set',
            'description' => 'Cơm sushi, rong biển, cá ngừ, tôm, cá hồi, lươn; mỗi loại một miếng',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_11->id,
            'name' => 'Set sushi nigiri cao cấp',
            'code' => 'SN67',
            'price' => 1200000,
            'unit' => 'set',
            'description' => 'Cá ngừ, lươn, tôm, cá hồi, mực',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_12 = Category::create([
            'id' => 12,
            'name' => 'Nước ép & Sinh tố',
            'code' => 'CAT_JUICES',
            'sort_order' => 12,
        ]);

        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Nước cam',
            'code' => 'NS69',
            'price' => 60000,
            'unit' => 'ly',
            'description' => 'Cam tươi vắt nguyên chất',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Sinh tố xoài',
            'code' => 'NS70',
            'price' => 60000,
            'unit' => 'ly',
            'description' => 'Xoài, sữa hoặc nền sinh tố',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Sinh tố xoài chanh dây',
            'code' => 'NS71',
            'price' => 60000,
            'unit' => 'ly',
            'description' => 'Xoài, chanh dây, đá xay',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Nước ép dứa',
            'code' => 'NS72',
            'price' => 60000,
            'unit' => 'ly',
            'description' => 'Dứa tươi ép nguyên chất',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Nước ép dưa hấu',
            'code' => 'NS73',
            'price' => 60000,
            'unit' => 'ly',
            'description' => 'Dưa hấu tươi mát',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Sinh tố chuối',
            'code' => 'NS74',
            'price' => 60000,
            'unit' => 'ly',
            'description' => 'Chuối, sữa hoặc nền sinh tố',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_12->id,
            'name' => 'Nước compote trái cây nhà làm',
            'code' => 'NS75',
            'price' => 70000,
            'unit' => 'ly',
            'description' => 'Trái cây/trái cây sấy, nước, đường',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $cat_13 = Category::create([
            'id' => 13,
            'name' => 'Nước ngọt & Nước suối',
            'code' => 'CAT_DRINKS',
            'sort_order' => 13,
        ]);

        Product::create([
            'category_id' => $cat_13->id,
            'name' => 'Coca-Cola',
            'code' => 'NN74',
            'price' => 30000,
            'unit' => 'lon',
            'description' => 'Nước ngọt có gas Coca-Cola lon',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_13->id,
            'name' => 'Fanta',
            'code' => 'NN75',
            'price' => 30000,
            'unit' => 'lon',
            'description' => 'Nước ngọt hương cam Fanta lon',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_13->id,
            'name' => '7UP',
            'code' => 'NN76',
            'price' => 30000,
            'unit' => 'lon',
            'description' => 'Nước ngọt chanh 7UP thanh mát lon',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_13->id,
            'name' => 'Mirinda',
            'code' => 'NN77',
            'price' => 30000,
            'unit' => 'lon',
            'description' => 'Nước ngọt Mirinda hương vị trái cây',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_13->id,
            'name' => 'Pepsi',
            'code' => 'NN78',
            'price' => 30000,
            'unit' => 'lon',
            'description' => 'Nước ngọt có gas Pepsi lon',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_13->id,
            'name' => 'Nước suối Aquafina',
            'code' => 'NN79',
            'price' => 20000,
            'unit' => 'chai',
            'description' => 'Nước uống tinh khiết đóng chai (500 ml)',
            'is_active' => true,
            'is_popular' => false,
        ]);
        Product::create([
            'category_id' => $cat_13->id,
            'name' => 'Nước suối Aquafina (1.5L)',
            'code' => 'NN79B',
            'price' => 30000,
            'unit' => 'chai',
            'description' => 'Nước uống tinh khiết chai lớn 1.5 L',
            'is_active' => true,
            'is_popular' => false,
        ]);

        $this->command->info('UpdateMenuSeeder: Successfully seeded 13 categories and 83 dishes!');
    }
}
