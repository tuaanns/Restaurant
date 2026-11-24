<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service: Sao lưu & Phục hồi CSDL MySQL (Automated & On-demand Backup)
 */
class BackupService
{
    /**
     * Đường dẫn thư mục lưu trữ các bản sao lưu
     */
    public static function getBackupDirectory(): string
    {
        $dir = storage_path('app/backups');
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        return $dir;
    }

    /**
     * Lấy danh sách các bản sao lưu hiện có
     */
    public static function getBackups(): array
    {
        $dir = self::getBackupDirectory();
        $files = glob($dir . '/*.sql');
        
        $backups = [];
        $totalSize = 0;

        foreach ($files as $file) {
            $filename = basename($file);
            $size = @filesize($file) ?: 0;
            $totalSize += $size;
            $time = @filemtime($file) ?: time();
            $isAuto = str_contains($filename, '_auto.sql');

            $backups[] = [
                'filename' => $filename,
                'size_bytes' => $size,
                'size_formatted' => self::formatBytes($size),
                'created_at' => date('Y-m-d H:i:s', $time),
                'created_at_formatted' => date('d/m/Y H:i:s', $time),
                'type' => $isAuto ? 'auto' : 'manual',
                'type_label' => $isAuto ? 'Tự động' : 'Thủ công',
            ];
        }

        // Sắp xếp bản mới nhất lên đầu
        usort($backups, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        // Kiểm tra xem hôm nay đã có bản sao lưu tự động chưa
        $todayPrefix = date('Y_m_d');
        $hasBackupToday = false;
        foreach ($backups as $b) {
            if (str_contains($b['filename'], $todayPrefix)) {
                $hasBackupToday = true;
                break;
            }
        }

        return [
            'success' => true,
            'total_count' => count($backups),
            'total_size_formatted' => self::formatBytes($totalSize),
            'has_backup_today' => $hasBackupToday,
            'last_backup' => !empty($backups) ? $backups[0] : null,
            'backups' => $backups,
        ];
    }

    /**
     * Tạo một bản sao lưu CSDL mới
     *
     * @param string $type ('manual' | 'auto')
     * @return array
     */
    public static function createBackup(string $type = 'manual'): array
    {
        $dir = self::getBackupDirectory();
        $filename = 'backup_aura_' . date('Y_m_d_His') . "_{$type}.sql";
        $filepath = $dir . DIRECTORY_SEPARATOR . $filename;

        // 1. Thử dùng mysqldump nếu khả dụng
        $mysqldumpSuccess = self::dumpViaMysqldump($filepath);

        // 2. Nếu mysqldump không thành công, dùng Pure PHP PDO Exporter
        if (!$mysqldumpSuccess || !file_exists($filepath) || filesize($filepath) < 100) {
            Log::info("mysqldump not available or empty, falling back to PHP PDO backup engine.");
            self::dumpViaPhpPdo($filepath, $type);
        }

        if (!file_exists($filepath) || filesize($filepath) === 0) {
            throw new \Exception("Không thể tạo file sao lưu CSDL!");
        }

        $size = filesize($filepath);

        // Giữ tối đa 30 bản sao lưu gần nhất, tự động xóa các bản cũ hơn
        self::pruneOldBackups();

        return [
            'success' => true,
            'message' => 'Tạo bản sao lưu CSDL thành công!',
            'backup' => [
                'filename' => $filename,
                'size_bytes' => $size,
                'size_formatted' => self::formatBytes($size),
                'created_at' => date('Y-m-d H:i:s'),
                'created_at_formatted' => date('d/m/Y H:i:s'),
                'type' => $type,
                'type_label' => $type === 'auto' ? 'Tự động' : 'Thủ công',
            ]
        ];
    }

    /**
     * Dump CSDL bằng mysqldump binary
     */
    protected static function dumpViaMysqldump(string $filepath): bool
    {
        $db = config('database.connections.mysql');
        $host = $db['host'] ?? '127.0.0.1';
        $port = $db['port'] ?? '3306';
        $database = $db['database'] ?? 'aura_pos';
        $username = $db['username'] ?? 'root';
        $password = $db['password'] ?? '';

        $mysqldumpBin = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        if (!file_exists($mysqldumpBin)) {
            $mysqldumpBin = 'mysqldump';
        }

        $pwdPart = !empty($password) ? " -p\"$password\"" : "";
        $cmd = "\"$mysqldumpBin\" -h $host -P $port -u $username$pwdPart --single-transaction --quick --default-character-set=utf8mb4 $database > \"$filepath\" 2>&1";

        try {
            $output = [];
            $returnVar = 0;
            exec($cmd, $output, $returnVar);
            return ($returnVar === 0 && file_exists($filepath) && filesize($filepath) > 500);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Pure PHP PDO SQL Dumper (Chạy 100% độc lập không phụ thuộc binary ngoài)
     */
    protected static function dumpViaPhpPdo(string $filepath, string $type = 'manual'): void
    {
        $pdo = DB::connection()->getPdo();
        $database = config('database.connections.mysql.database', 'aura_pos');

        $out = fopen($filepath, 'w');
        if (!$out) {
            throw new \Exception("Không thể mở file để ghi: $filepath");
        }

        // Header
        $now = date('Y-m-d H:i:s');
        fwrite($out, "-- ==========================================================\n");
        fwrite($out, "-- AURA RESTAURANT POS - DATABASE BACKUP (PURE PHP ENGINE)\n");
        fwrite($out, "-- Database: {$database}\n");
        fwrite($out, "-- Date: {$now}\n");
        fwrite($out, "-- Type: {$type}\n");
        fwrite($out, "-- ==========================================================\n\n");
        fwrite($out, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($out, "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n");
        fwrite($out, "SET NAMES utf8mb4;\n\n");

        // Lấy danh sách bảng
        $tablesStmt = $pdo->query("SHOW FULL TABLES WHERE Table_Type = 'BASE TABLE'");
        $tables = $tablesStmt->fetchAll(\PDO::FETCH_NUM);

        foreach ($tables as $tRow) {
            $table = $tRow[0];

            // 1. DROP TABLE & CREATE TABLE
            fwrite($out, "-- Table structure for `{$table}`\n");
            fwrite($out, "DROP TABLE IF EXISTS `{$table}`;\n");

            $createStmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
            $createRow = $createStmt->fetch(\PDO::FETCH_ASSOC);
            $createSql = $createRow['Create Table'] ?? '';
            fwrite($out, $createSql . ";\n\n");

            // 2. INSERT DUMP
            $dataStmt = $pdo->query("SELECT * FROM `{$table}`");
            $rows = $dataStmt->fetchAll(\PDO::FETCH_ASSOC);

            if (!empty($rows)) {
                fwrite($out, "-- Dumping data for table `{$table}`\n");
                $colNames = array_map(function ($c) { return "`$c`"; }, array_keys($rows[0]));
                $colsSql = implode(', ', $colNames);

                $batch = [];
                $batchSize = 50;

                foreach ($rows as $row) {
                    $vals = [];
                    foreach ($row as $val) {
                        if (is_null($val)) {
                            $vals[] = 'NULL';
                        } else {
                            $vals[] = $pdo->quote($val);
                        }
                    }
                    $batch[] = "(" . implode(', ', $vals) . ")";

                    if (count($batch) >= $batchSize) {
                        fwrite($out, "INSERT INTO `{$table}` ({$colsSql}) VALUES\n" . implode(",\n", $batch) . ";\n");
                        $batch = [];
                    }
                }

                if (!empty($batch)) {
                    fwrite($out, "INSERT INTO `{$table}` ({$colsSql}) VALUES\n" . implode(",\n", $batch) . ";\n");
                }
                fwrite($out, "\n");
            }
        }

        fwrite($out, "SET FOREIGN_KEY_CHECKS=1;\n");
        fwrite($out, "-- Backup completed at " . date('Y-m-d H:i:s') . "\n");
        fclose($out);
    }

    /**
     * Xóa một bản sao lưu
     */
    public static function deleteBackup(string $filename): bool
    {
        // Ngăn chặn path traversal
        $filename = basename($filename);
        if (empty($filename) || !str_ends_with($filename, '.sql')) {
            throw new \Exception("Tên tệp sao lưu không hợp lệ!");
        }

        $filepath = self::getBackupDirectory() . DIRECTORY_SEPARATOR . $filename;
        if (file_exists($filepath)) {
            return @unlink($filepath);
        }
        return false;
    }

    /**
     * Lấy đường dẫn file để tải về
     */
    public static function getBackupFilePath(string $filename): ?string
    {
        $filename = basename($filename);
        if (empty($filename) || !str_ends_with($filename, '.sql')) {
            return null;
        }

        $filepath = self::getBackupDirectory() . DIRECTORY_SEPARATOR . $filename;
        return file_exists($filepath) ? $filepath : null;
    }

    /**
     * Tự động kiểm tra và chạy sao lưu hằng ngày nếu chưa có
     */
    public static function checkAndRunDailyAutoBackup(): ?array
    {
        $dir = self::getBackupDirectory();
        $todayPrefix = 'backup_aura_' . date('Y_m_d');
        $existing = glob($dir . "/{$todayPrefix}*");

        if (empty($existing)) {
            return self::createBackup('auto');
        }
        return null;
    }

    /**
     * Giữ tối đa 30 bản sao lưu, xóa các bản cũ hơn
     */
    protected static function pruneOldBackups(): void
    {
        $dir = self::getBackupDirectory();
        $files = glob($dir . '/*.sql');
        if (count($files) > 30) {
            usort($files, function ($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            while (count($files) > 30) {
                $oldFile = array_shift($files);
                @unlink($oldFile);
            }
        }
    }

    /**
     * Định dạng dung lượng byte sang KB, MB
     */
    public static function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }
}
