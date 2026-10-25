-- ========================================================
-- DATABASE EXPORT FOR AURA RESTAURANT POS (MYSQL 8.0 / MARIADB)
-- Database name: aura_pos
-- ========================================================

CREATE DATABASE IF NOT EXISTS `aura_pos` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aura_pos`;

-- 0. Table `users` (Phân quyền Admin & Thu ngân)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci UNIQUE,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cashier',
  `shift` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ca sáng (07:00 - 15:00)',
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `role`, `shift`, `phone`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Quản lý: Hoàng Nam', 'admin', 'admin@aura.vn', '$2y$12$e68Y2kF5iM1yE6U6183rNu2tL6QWqH3JvV4YVzG.t17J6F7jL.a1C', 'admin', 'Toàn ca (Quản lý nhà hàng)', '0901.888.999', 1, NOW(), NOW()),
(2, 'Thu Hằng', 'thuhang', 'thuhang@aura.vn', '$2y$12$e68Y2kF5iM1yE6U6183rNu2tL6QWqH3JvV4YVzG.t17J6F7jL.a1C', 'cashier', 'Ca sáng (07:00 - 15:00)', '0912.345.678', 1, NOW(), NOW()),
(3, 'Minh Trí', 'minhtri', 'minhtri@aura.vn', '$2y$12$e68Y2kF5iM1yE6U6183rNu2tL6QWqH3JvV4YVzG.t17J6F7jL.a1C', 'cashier', 'Ca chiều (15:00 - 23:00)', '0987.654.321', 1, NOW(), NOW());

-- 1. Table `areas`
DROP TABLE IF EXISTS `areas`;
CREATE TABLE `areas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `areas` (`id`, `name`, `code`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Tầng 1', 'floor_1', 1, NOW(), NOW()),
(2, 'Tầng 2', 'floor_2', 2, NOW(), NOW()),
(3, 'Phòng VIP', 'vip', 3, NOW(), NOW()),
(4, 'Sân vườn', 'garden', 4, NOW(), NOW());

-- 2. Table `dining_tables`
DROP TABLE IF EXISTS `dining_tables`;
CREATE TABLE `dining_tables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `area_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL DEFAULT '4',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'empty',
  `guest_count` int NOT NULL DEFAULT '0',
  `started_at` datetime DEFAULT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_takeaway` tinyint(1) NOT NULL DEFAULT '0',
  `is_vip` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dining_tables_area_id_foreign` (`area_id`),
  CONSTRAINT `dining_tables_area_id_foreign` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `dining_tables` (`id`, `area_id`, `name`, `capacity`, `status`, `guest_count`, `started_at`, `notes`, `is_takeaway`, `is_vip`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'BÀN 01', 4, 'occupied', 4, DATE_SUB(NOW(), INTERVAL 45 MINUTE), '3 món đã gửi bếp', 0, 0, 1, NOW(), NOW()),
(2, 1, 'BÀN 02', 2, 'billing', 2, DATE_SUB(NOW(), INTERVAL 80 MINUTE), 'Đã in tạm tính', 0, 0, 2, NOW(), NOW()),
(3, 1, 'BÀN 03', 4, 'occupied', 3, DATE_SUB(NOW(), INTERVAL 70 MINUTE), '4 món', 0, 0, 3, NOW(), NOW()),
(4, 1, 'MANG VỀ', 1, 'occupied', 1, DATE_SUB(NOW(), INTERVAL 15 MINUTE), 'Chờ đóng gói (Đơn #108)', 1, 0, 4, NOW(), NOW()),
(5, 1, 'BÀN 04', 4, 'empty', 0, NULL, NULL, 0, 0, 5, NOW(), NOW()),
(6, 1, 'BÀN 05', 6, 'empty', 0, NULL, NULL, 0, 0, 6, NOW(), NOW()),
(7, 1, 'BÀN 06', 2, 'empty', 0, NULL, NULL, 0, 0, 7, NOW(), NOW()),
(8, 1, 'BÀN 07', 4, 'empty', 0, NULL, NULL, 0, 0, 8, NOW(), NOW()),
(9, 3, 'VIP 01', 8, 'occupied', 8, DATE_SUB(NOW(), INTERVAL 125 MINUTE), '8 món', 0, 1, 9, NOW(), NOW()),
(10, 3, 'VIP 02', 10, 'empty', 0, NULL, NULL, 0, 1, 10, NOW(), NOW()),
(11, 3, 'VIP 03', 12, 'empty', 0, NULL, NULL, 0, 1, 11, NOW(), NOW()),
(12, 3, 'VIP 04', 8, 'empty', 0, NULL, NULL, 0, 1, 12, NOW(), NOW()),
(13, 2, 'BÀN 08', 4, 'empty', 0, NULL, NULL, 0, 0, 20, NOW(), NOW()),
(14, 2, 'BÀN 09', 4, 'empty', 0, NULL, NULL, 0, 0, 21, NOW(), NOW()),
(15, 2, 'BÀN 10', 4, 'empty', 0, NULL, NULL, 0, 0, 22, NOW(), NOW()),
(16, 2, 'BÀN 11', 6, 'occupied', 5, DATE_SUB(NOW(), INTERVAL 35 MINUTE), '4 món', 0, 0, 23, NOW(), NOW()),
(17, 2, 'BÀN 12', 4, 'billing', 3, DATE_SUB(NOW(), INTERVAL 105 MINUTE), 'Đã in tạm tính', 0, 0, 24, NOW(), NOW()),
(18, 2, 'BÀN 13', 6, 'empty', 0, NULL, NULL, 0, 0, 25, NOW(), NOW()),
(19, 2, 'BÀN 14', 4, 'empty', 0, NULL, NULL, 0, 0, 26, NOW(), NOW()),
(20, 2, 'BÀN 15', 6, 'empty', 0, NULL, NULL, 0, 0, 27, NOW(), NOW()),
(21, 4, 'VƯỜN 1', 6, 'occupied', 4, DATE_SUB(NOW(), INTERVAL 55 MINUTE), '3 món', 0, 0, 31, NOW(), NOW()),
(22, 4, 'VƯỜN 2', 6, 'empty', 0, NULL, NULL, 0, 0, 32, NOW(), NOW()),
(23, 4, 'VƯỜN 3', 6, 'empty', 0, NULL, NULL, 0, 0, 33, NOW(), NOW()),
(24, 4, 'VƯỜN 4', 6, 'empty', 0, NULL, NULL, 0, 0, 34, NOW(), NOW());

-- 3. Table `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `code`, `icon`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Món xào & Cơm', 'rice_noodles', 'soup', 1, NOW(), NOW()),
(2, 'Món bò & Gà', 'meat', 'beef', 2, NOW(), NOW()),
(3, 'Hải sản & Khai vị', 'seafood', 'fish', 3, NOW(), NOW()),
(4, 'Món lẩu đặc biệt', 'hotpot', 'flame', 4, NOW(), NOW()),
(5, 'Đồ uống & Tráng miệng', 'drinks', 'coffee', 5, NOW(), NOW()),
(6, 'Dịch vụ & Khác', 'other', 'bell', 6, NOW(), NOW());

-- 4. Table `products`
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'phần',
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_popular` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `category_id`, `name`, `code`, `price`, `unit`, `description`, `is_popular`, `created_at`, `updated_at`) VALUES
(1, 1, 'Mì xào bò thượng hạng', 'MXB01', 110000.00, 'phần', 'Bò mềm sốt tiêu tỏi, mì trứng xào rau củ', 1, NOW(), NOW()),
(2, 1, 'Cơm chiên hải sản Hoàng Kim', 'CCHS02', 125000.00, 'phần', 'Cơm chiên sốt trứng muối hoàng kim tôm mực', 1, NOW(), NOW()),
(3, 5, 'Nước cam ép tươi', 'NC03', 45000.00, 'ly', 'Cam sành tươi nguyên chất mọng nước', 1, NOW(), NOW()),
(4, 6, 'Khăn lạnh thơm cao cấp', 'KL04', 5000.00, 'cái', 'Khăn lạnh ướp hương hoa nhài', 0, NOW(), NOW()),
(5, 2, 'Bò nướng tảng sốt tiêu xanh', 'BNT05', 220000.00, 'phần', 'Bò Mỹ thượng hạng mọng nước', 1, NOW(), NOW()),
(6, 3, 'Mực một nắng nướng sa tế', 'MNN06', 185000.00, 'dĩa', 'Mực tươi nướng thơm cay', 1, NOW(), NOW()),
(7, 4, 'Lẩu Thái Tomyum hải sản', 'LT07', 350000.00, 'nồi', 'Nước lẩu chua cay chuẩn vị', 1, NOW(), NOW()),
(8, 5, 'Trà đào cam sả thanh nhiệt', 'TD08', 40000.00, 'ly', 'Trà đào thơm mát', 1, NOW(), NOW()),
(9, 5, 'Bia Heineken Silver (Lon)', 'BIA09', 28000.00, 'lon', 'Bia ướp lạnh sảng khoái', 0, NOW(), NOW());

-- 5. Table `customers`
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `membership_tier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hội viên',
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `customers` (`id`, `name`, `phone`, `membership_tier`, `discount_percent`, `created_at`, `updated_at`) VALUES
(1, 'Anh Hoàng', '0912.888.xxx', 'Hội viên Kim Cương', 5.00, NOW(), NOW()),
(2, 'Chị Phương Linh', '0988.666.888', 'Hội viên Vàng', 10.00, NOW(), NOW()),
(3, 'Khách Vãng Lai', '', 'Khách mới', 0.00, NOW(), NOW());

-- 6. Table `orders`
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `table_id` bigint unsigned DEFAULT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `cashier_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Thu Hằng',
  `shift` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ca sáng (07:00 - 15:00)',
  `order_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dine_in',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `vat_percent` decimal(5,2) NOT NULL DEFAULT '8.00',
  `vat_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT NULL,
  `change_amount` decimal(12,2) DEFAULT NULL,
  `printed_prebill_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_table_id_foreign` (`table_id`),
  KEY `orders_customer_id_foreign` (`customer_id`),
  CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `dining_tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`id`, `order_code`, `table_id`, `customer_id`, `cashier_name`, `shift`, `subtotal`, `discount_percent`, `discount_amount`, `vat_percent`, `vat_amount`, `total_amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ORD-20261011-003', 3, 1, 'Thu Hằng', 'Ca sáng (07:00 - 15:00)', 450000.00, 5.00, 22500.00, 8.00, 34200.00, 461700.00, 'active', NOW(), NOW()),
(2, 'ORD-20261011-001', 1, NULL, 'Thu Hằng', 'Ca sáng (07:00 - 15:00)', 485000.00, 0.00, 0.00, 8.00, 0.00, 485000.00, 'active', NOW(), NOW()),
(3, 'ORD-20261011-002', 2, NULL, 'Thu Hằng', 'Ca sáng (07:00 - 15:00)', 320000.00, 0.00, 0.00, 8.00, 0.00, 320000.00, 'billing', NOW(), NOW()),
(4, 'ORD-20261011-VIP1', 9, NULL, 'Thu Hằng', 'Ca sáng (07:00 - 15:00)', 2450000.00, 0.00, 0.00, 8.00, 0.00, 2450000.00, 'active', NOW(), NOW()),
(5, 'Đơn #108', 4, NULL, 'Thu Hằng', 'Ca sáng (07:00 - 15:00)', 185000.00, 0.00, 0.00, 8.00, 0.00, 185000.00, 'active', NOW(), NOW());

-- 7. Table `order_items`
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'phần',
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new_pending',
  `is_auto_added` tinyint(1) NOT NULL DEFAULT '0',
  `sent_to_kitchen_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit`, `quantity`, `price`, `subtotal`, `note`, `status`, `is_auto_added`, `sent_to_kitchen_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Mì xào bò thượng hạng', 'phần', 2, 110000.00, 220000.00, 'Ít hành tây, làm mềm', 'sent_kitchen', 0, NOW(), NOW(), NOW()),
(2, 1, 2, 'Cơm chiên hải sản Hoàng Kim', 'phần', 1, 125000.00, 125000.00, 'Cay nhẹ', 'sent_kitchen', 0, NOW(), NOW(), NOW()),
(3, 1, 3, 'Nước cam ép tươi', 'ly', 2, 45000.00, 90000.00, 'Không đường, nhiều đá', 'new_pending', 0, NULL, NOW(), NOW()),
(4, 1, 4, 'Khăn lạnh thơm cao cấp', 'cái', 3, 5000.00, 15000.00, 'Tự động tính', 'sent_kitchen', 1, NOW(), NOW(), NOW());
