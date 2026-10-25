<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder nạp dữ liệu tài khoản mẫu Phân Quyền (Admin, Creator, User)
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Quản Trị Viên (Admin)',
                'email' => 'admin@v-ai.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ],
            [
                'name' => 'Tác Giả AI (Creator)',
                'email' => 'creator@v-ai.com',
                'password' => Hash::make('creator123'),
                'role' => 'creator',
            ],
            [
                'name' => 'Khán Giả Xem Phim',
                'email' => 'user@v-ai.com',
                'password' => Hash::make('user123'),
                'role' => 'user',
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], $u);
        }
    }
}
