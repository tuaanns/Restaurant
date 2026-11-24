<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BackupService;

class BackupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pos:backup-db {--type=auto : Loại sao lưu (auto hoặc manual)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động sao lưu cơ sở dữ liệu MySQL của nhà hàng AURA POS ra file .sql';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $type = $this->option('type') ?: 'auto';
        $this->info("Đang bắt đầu sao lưu CSDL AURA POS (Loại: {$type})...");

        try {
            $result = BackupService::createBackup($type);
            $b = $result['backup'];
            $this->info("✓ Sao lưu thành công: {$b['filename']} ({$b['size_formatted']})");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Lỗi khi sao lưu CSDL: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
