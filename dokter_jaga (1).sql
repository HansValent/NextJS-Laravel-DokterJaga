-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 22 Nov 2026 pada 15.11
-- Versi server: 10.11.16-MariaDB
-- Versi PHP: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `dokter_jaga`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `absensi_dokter`
--

CREATE TABLE `absensi_dokter` (
  `id_absensi` int(11) NOT NULL,
  `jadwal_id` int(11) NOT NULL,
  `id_paramedic` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `waktu_masuk` datetime DEFAULT NULL,
  `waktu_keluar` datetime DEFAULT NULL,
  `status_kehadiran` enum('Hadir','Terlambat','Digantikan Backup','Tidak Hadir') NOT NULL DEFAULT 'Hadir',
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `bagian_paramedic`
--

CREATE TABLE `bagian_paramedic` (
  `id_bagian_paramedic` int(11) NOT NULL,
  `id_paramedic` int(11) DEFAULT NULL,
  `id_posisi` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bagian_paramedic`
--

INSERT INTO `bagian_paramedic` (`id_bagian_paramedic`, `id_paramedic`, `id_posisi`, `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted_by`, `deleted_at`, `is_deleted`) VALUES
(1, 1, 5, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(2, 2, 5, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(3, 3, 5, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(4, 4, 5, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(5, 5, 30, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(6, 6, 30, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(7, 7, 30, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(8, 8, 28, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(9, 9, 28, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(10, 10, 17, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(11, 11, 17, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(12, 12, 17, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(13, 19, 24, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(14, 20, 24, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(15, 21, 24, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(16, 22, 24, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(17, 49, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(18, 50, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(19, 51, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(20, 52, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(21, 53, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(22, 54, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(23, 55, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(24, 56, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(25, 57, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(26, 58, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(27, 59, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(28, 60, 16, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(29, 61, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(30, 62, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(31, 63, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(32, 64, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(33, 65, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(34, 66, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(35, 67, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(36, 68, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(37, 69, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(38, 70, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(39, 71, 21, 1, '2026-05-26 07:48:27', NULL, NULL, NULL, NULL, 0),
(40, 13, 8, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(41, 14, 8, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(42, 15, 8, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(43, 16, 28, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(44, 17, 28, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(45, 18, 28, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(46, 23, 9, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(47, 24, 9, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(48, 25, 23, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(49, 26, 23, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(50, 27, 23, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(51, 28, 23, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(52, 29, 23, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(53, 30, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(54, 31, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(55, 32, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(56, 33, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(57, 34, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(58, 35, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(59, 36, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(60, 37, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(61, 38, 3, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(62, 39, 20, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(63, 40, 20, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(64, 41, 20, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(65, 42, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(66, 43, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(67, 44, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(68, 45, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(69, 46, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(70, 47, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(71, 48, 27, 1, '2026-05-26 08:21:38', NULL, NULL, NULL, NULL, 0),
(72, 4, 25, 1, '2026-06-05 01:17:48', NULL, NULL, NULL, NULL, 0),
(73, 1, 25, 1, '2026-06-05 01:17:48', NULL, NULL, NULL, NULL, 0),
(74, 2, 25, 1, '2026-06-05 01:17:48', NULL, NULL, NULL, NULL, 0),
(75, 4, 32, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(76, 2, 32, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(77, 3, 32, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(78, 1, 32, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(79, 72, 16, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(80, 73, 16, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(81, 5, 33, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(82, 6, 33, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(83, 7, 33, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(84, 56, 34, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(85, 57, 34, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(86, 74, 27, 1, '2026-06-05 01:31:22', NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_user_permissions_14', 'a:6:{i:0;s:16:\"dokter.dashboard\";i:1;s:18:\"dokter.jadwal.read\";i:2;s:24:\"dokter.konsultasi.manage\";i:3;s:19:\"dokter.laporan.read\";i:4;s:23:\"dokter.pendaftaran.read\";i:5;s:21:\"dokter.profile.manage\";}', 1795355435);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `import_logs`
--

CREATE TABLE `import_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `mapping` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mapping`)),
  `total_rows` int(11) DEFAULT 0,
  `success_rows` int(11) DEFAULT 0,
  `failed_rows` int(11) DEFAULT 0,
  `errors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`errors`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `import_templates`
--

CREATE TABLE `import_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'jadwal',
  `mapping` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mapping`)),
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal`
--

CREATE TABLE `jadwal` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `id_bagian_paramedic` int(11) NOT NULL,
  `peran` enum('-','Utama','Backup 1','Backup 2','Backup 3') DEFAULT 'Utama',
  `tipe_jaga` enum('-','Oncall','Onsite Pagi','Onsite Malam') DEFAULT NULL,
  `kuota_pasien` int(11) NOT NULL DEFAULT 20,
  `jam_mulai` time DEFAULT '08:00:00',
  `jam_selesai` time DEFAULT '14:00:00',
  `keterangan` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jadwal`
--

INSERT INTO `jadwal` (`id`, `tanggal`, `id_bagian_paramedic`, `peran`, `tipe_jaga`, `kuota_pasien`, `jam_mulai`, `jam_selesai`, `keterangan`, `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted_by`, `deleted_at`, `is_deleted`) VALUES
(1, '2026-06-01', 37, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, '2026-11-22 09:33:04', 1, '2026-11-22 09:33:04', 1),
(2, '2026-06-01', 30, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(3, '2026-06-01', 38, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(4, '2026-06-02', 37, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(5, '2026-06-02', 31, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(6, '2026-06-02', 33, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(7, '2026-06-03', 37, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(8, '2026-06-03', 33, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(9, '2026-06-03', 35, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(10, '2026-06-04', 34, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(11, '2026-06-04', 29, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(12, '2026-06-04', 37, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(13, '2026-06-05', 30, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(14, '2026-06-05', 31, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(15, '2026-06-05', 39, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(16, '2026-06-06', 30, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(17, '2026-06-06', 32, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(18, '2026-06-06', 36, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(19, '2026-06-07', 32, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(20, '2026-06-07', 35, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(21, '2026-06-07', 34, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(22, '2026-06-08', 37, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(23, '2026-06-08', 35, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(24, '2026-06-08', 34, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(25, '2026-06-09', 31, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(26, '2026-06-09', 36, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(27, '2026-06-09', 32, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(28, '2026-06-10', 31, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(29, '2026-06-10', 39, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(30, '2026-06-10', 38, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(31, '2026-06-11', 38, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(32, '2026-06-11', 33, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(33, '2026-06-11', 30, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(34, '2026-06-12', 34, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(35, '2026-06-12', 37, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(36, '2026-06-12', 31, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(37, '2026-06-13', 29, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(38, '2026-06-13', 34, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(39, '2026-06-13', 35, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(40, '2026-06-14', 29, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(41, '2026-06-14', 36, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(42, '2026-06-14', 39, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(43, '2026-06-15', 32, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(44, '2026-06-15', 29, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(45, '2026-06-15', 33, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(46, '2026-06-16', 36, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(47, '2026-06-16', 34, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(48, '2026-06-16', 37, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(49, '2026-06-17', 35, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(50, '2026-06-17', 38, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(51, '2026-06-17', 36, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(52, '2026-06-18', 33, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(53, '2026-06-18', 32, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(54, '2026-06-18', 29, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(55, '2026-06-19', 29, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(56, '2026-06-19', 39, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(57, '2026-06-19', 31, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(58, '2026-06-20', 29, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(59, '2026-06-20', 38, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(60, '2026-06-20', 30, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(61, '2026-06-21', 33, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(62, '2026-06-21', 30, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(63, '2026-06-21', 29, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(64, '2026-06-22', 34, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(65, '2026-06-22', 37, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(66, '2026-06-22', 32, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(67, '2026-06-23', 39, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(68, '2026-06-23', 30, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(69, '2026-06-23', 38, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(70, '2026-06-24', 32, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(71, '2026-06-24', 31, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(72, '2026-06-24', 39, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(73, '2026-06-25', 31, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(74, '2026-06-25', 34, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(75, '2026-06-25', 36, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(76, '2026-06-26', 31, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(77, '2026-06-26', 29, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(78, '2026-06-26', 33, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(79, '2026-06-27', 35, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(80, '2026-06-27', 32, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(81, '2026-06-27', 37, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(82, '2026-06-28', 36, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(83, '2026-06-28', 37, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(84, '2026-06-28', 35, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(85, '2026-06-29', 30, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(86, '2026-06-29', 35, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(87, '2026-06-29', 34, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(88, '2026-06-30', 30, 'Utama', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila DPJP Utama berhalangan hubungi Back Up 1 dan Bila Back Up 1 berhalangan hubungi Back Up 2', 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(89, '2026-06-30', 33, 'Backup 1', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(90, '2026-06-30', 29, 'Backup 2', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(91, '2026-06-01', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(92, '2026-06-02', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(93, '2026-06-03', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(94, '2026-06-04', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(95, '2026-06-05', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(96, '2026-06-06', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(97, '2026-06-07', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(98, '2026-06-08', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(99, '2026-06-09', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(100, '2026-06-10', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:40', NULL, NULL, NULL, NULL, 0),
(101, '2026-06-11', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(102, '2026-06-12', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(103, '2026-06-13', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(104, '2026-06-14', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(105, '2026-06-15', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(106, '2026-06-16', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(107, '2026-06-17', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(108, '2026-06-18', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(109, '2026-06-19', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(110, '2026-06-20', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(111, '2026-06-21', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(112, '2026-06-22', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(113, '2026-06-23', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(114, '2026-06-24', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(115, '2026-06-25', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(116, '2026-06-26', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(117, '2026-06-27', 13, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(118, '2026-06-28', 14, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(119, '2026-06-29', 15, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(120, '2026-06-30', 16, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(121, '2026-06-01', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(122, '2026-06-02', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(123, '2026-06-03', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(124, '2026-06-04', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(125, '2026-06-05', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(126, '2026-06-06', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(127, '2026-06-07', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(128, '2026-06-08', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(129, '2026-06-09', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(130, '2026-06-10', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(131, '2026-06-11', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(132, '2026-06-12', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(133, '2026-06-13', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(134, '2026-06-14', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(135, '2026-06-15', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(136, '2026-06-16', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(137, '2026-06-17', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(138, '2026-06-18', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(139, '2026-06-19', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(140, '2026-06-20', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(141, '2026-06-21', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(142, '2026-06-22', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(143, '2026-06-23', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(144, '2026-06-24', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(145, '2026-06-25', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(146, '2026-06-26', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(147, '2026-06-27', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(148, '2026-06-28', 72, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(149, '2026-06-29', 73, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(150, '2026-06-30', 74, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(151, '2026-06-01', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(152, '2026-06-02', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(153, '2026-06-03', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(154, '2026-06-04', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(155, '2026-06-05', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(156, '2026-06-06', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(157, '2026-06-07', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(158, '2026-06-08', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(159, '2026-06-09', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(160, '2026-06-10', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(161, '2026-06-11', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(162, '2026-06-12', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(163, '2026-06-13', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(164, '2026-06-14', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(165, '2026-06-15', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(166, '2026-06-16', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(167, '2026-06-17', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(168, '2026-06-18', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(169, '2026-06-19', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(170, '2026-06-20', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(171, '2026-06-21', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(172, '2026-06-22', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(173, '2026-06-23', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(174, '2026-06-24', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(175, '2026-06-25', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(176, '2026-06-26', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(177, '2026-06-27', 77, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(178, '2026-06-28', 78, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(179, '2026-06-29', 75, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(180, '2026-06-30', 76, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(181, '2026-06-01', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(182, '2026-06-02', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(183, '2026-06-03', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(184, '2026-06-04', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(185, '2026-06-05', 45, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(186, '2026-06-06', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(187, '2026-06-07', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(188, '2026-06-08', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(189, '2026-06-09', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(190, '2026-06-10', 45, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(191, '2026-06-11', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(192, '2026-06-12', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(193, '2026-06-13', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(194, '2026-06-14', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(195, '2026-06-15', 45, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(196, '2026-06-16', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(197, '2026-06-17', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(198, '2026-06-18', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(199, '2026-06-19', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(200, '2026-06-20', 45, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(201, '2026-06-21', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(202, '2026-06-22', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(203, '2026-06-23', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(204, '2026-06-24', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(205, '2026-06-25', 45, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(206, '2026-06-26', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(207, '2026-06-27', 43, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(208, '2026-06-28', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(209, '2026-06-29', 44, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(210, '2026-06-30', 45, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(211, '2026-06-01', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(212, '2026-06-02', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(213, '2026-06-03', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(214, '2026-06-04', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(215, '2026-06-05', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(216, '2026-06-06', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(217, '2026-06-07', 8, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(218, '2026-06-08', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(219, '2026-06-09', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(220, '2026-06-10', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(221, '2026-06-11', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(222, '2026-06-12', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(223, '2026-06-13', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(224, '2026-06-14', 8, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(225, '2026-06-15', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(226, '2026-06-16', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(227, '2026-06-17', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(228, '2026-06-18', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(229, '2026-06-19', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(230, '2026-06-20', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(231, '2026-06-21', 8, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(232, '2026-06-22', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(233, '2026-06-23', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(234, '2026-06-24', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(235, '2026-06-25', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(236, '2026-06-26', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(237, '2026-06-27', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(238, '2026-06-28', 8, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(239, '2026-06-29', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(240, '2026-06-30', 9, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(241, '2026-06-01', 23, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(242, '2026-06-01', 23, '-', 'Onsite Pagi', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(243, '2026-06-01', 23, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(244, '2026-06-02', 21, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(245, '2026-06-02', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(246, '2026-06-03', 18, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(247, '2026-06-03', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(248, '2026-06-04', 79, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(249, '2026-06-04', 23, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(250, '2026-06-05', 22, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(251, '2026-06-05', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(252, '2026-06-06', 21, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(253, '2026-06-06', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(254, '2026-06-07', 18, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(255, '2026-06-07', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(256, '2026-06-08', 19, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(257, '2026-06-08', 19, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(258, '2026-06-09', 24, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(259, '2026-06-09', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(260, '2026-06-10', 79, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(261, '2026-06-10', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(262, '2026-06-11', 18, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(263, '2026-06-11', 80, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(264, '2026-06-12', 23, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(265, '2026-06-12', 23, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(266, '2026-06-13', 24, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(267, '2026-06-13', 24, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(268, '2026-06-14', 21, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(269, '2026-06-14', 23, '-', 'Onsite Pagi', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(270, '2026-06-14', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(271, '2026-06-15', 23, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(272, '2026-06-15', 23, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(273, '2026-06-16', 23, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(274, '2026-06-16', 23, '-', 'Onsite Pagi', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(275, '2026-06-16', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(276, '2026-06-17', 22, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(277, '2026-06-17', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(278, '2026-06-18', 79, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(279, '2026-06-18', 80, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(280, '2026-06-19', 21, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(281, '2026-06-19', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(282, '2026-06-20', 18, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(283, '2026-06-20', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(284, '2026-06-21', 22, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(285, '2026-06-21', 80, '-', 'Onsite Pagi', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(286, '2026-06-21', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(287, '2026-06-22', 79, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(288, '2026-06-22', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(289, '2026-06-23', 21, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(290, '2026-06-23', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(291, '2026-06-24', 18, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(292, '2026-06-24', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(293, '2026-06-25', 80, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(294, '2026-06-25', 80, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(295, '2026-06-26', 23, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(296, '2026-06-26', 23, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(297, '2026-06-27', 22, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(298, '2026-06-27', 26, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(299, '2026-06-28', 79, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(300, '2026-06-28', 23, '-', 'Onsite Pagi', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(301, '2026-06-28', 27, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(302, '2026-06-29', 19, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(303, '2026-06-29', 19, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(304, '2026-06-30', 80, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(305, '2026-06-30', 80, '-', 'Onsite Malam', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(306, '2026-06-01', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(307, '2026-06-02', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(308, '2026-06-03', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(309, '2026-06-04', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(310, '2026-06-05', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(311, '2026-06-06', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(312, '2026-06-07', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(313, '2026-06-08', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(314, '2026-06-09', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(315, '2026-06-10', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(316, '2026-06-11', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(317, '2026-06-12', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(318, '2026-06-13', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(319, '2026-06-14', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(320, '2026-06-15', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(321, '2026-06-16', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(322, '2026-06-17', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(323, '2026-06-18', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(324, '2026-06-19', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(325, '2026-06-20', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(326, '2026-06-21', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(327, '2026-06-22', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(328, '2026-06-23', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(329, '2026-06-24', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(330, '2026-06-25', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(331, '2026-06-26', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(332, '2026-06-27', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(333, '2026-06-28', 81, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(334, '2026-06-29', 82, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(335, '2026-06-30', 83, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(336, '2026-06-01', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(337, '2026-06-02', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(338, '2026-06-03', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(339, '2026-06-04', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(340, '2026-06-05', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(341, '2026-06-06', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(342, '2026-06-07', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(343, '2026-06-08', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(344, '2026-06-09', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(345, '2026-06-09', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(346, '2026-06-10', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(347, '2026-06-11', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(348, '2026-06-12', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(349, '2026-06-13', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(350, '2026-06-14', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(351, '2026-06-15', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(352, '2026-06-16', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(353, '2026-06-17', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(354, '2026-06-18', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(355, '2026-06-19', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(356, '2026-06-20', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(357, '2026-06-21', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(358, '2026-06-22', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(359, '2026-06-23', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(360, '2026-06-24', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(361, '2026-06-25', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(362, '2026-06-26', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(363, '2026-06-27', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(364, '2026-06-28', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(365, '2026-06-29', 84, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(366, '2026-06-30', 85, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(367, '2026-06-01', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(368, '2026-06-02', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(369, '2026-06-03', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(370, '2026-06-04', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0);
INSERT INTO `jadwal` (`id`, `tanggal`, `id_bagian_paramedic`, `peran`, `tipe_jaga`, `kuota_pasien`, `jam_mulai`, `jam_selesai`, `keterangan`, `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted_by`, `deleted_at`, `is_deleted`) VALUES
(371, '2026-06-05', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(372, '2026-06-06', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(373, '2026-06-07', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(374, '2026-06-08', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(375, '2026-06-09', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(376, '2026-06-10', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(377, '2026-06-11', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(378, '2026-06-12', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(379, '2026-06-13', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(380, '2026-06-14', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(381, '2026-06-15', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(382, '2026-06-16', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(383, '2026-06-17', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(384, '2026-06-18', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(385, '2026-06-19', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(386, '2026-06-20', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(387, '2026-06-21', 64, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(388, '2026-06-22', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(389, '2026-06-23', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(390, '2026-06-24', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(391, '2026-06-25', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(392, '2026-06-26', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(393, '2026-06-27', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(394, '2026-06-28', 62, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(395, '2026-06-29', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(396, '2026-06-30', 63, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(397, '2026-06-01', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'dr. Cadangan : dr. Meila Sutanti, SpTHT-KL', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(398, '2026-06-02', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'jika DPJP Utama tidak dapat dihubungi atau berhalangan.', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(399, '2026-06-03', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(400, '2026-06-04', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(401, '2026-06-05', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(402, '2026-06-06', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(403, '2026-06-07', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(404, '2026-06-08', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'dr. Cadangan : Prof. dr. Bambang H., SpTHT-KL', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(405, '2026-06-09', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'jika DPJP Utama tidak dapat dihubungi atau berhalangan.', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(406, '2026-06-10', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(407, '2026-06-11', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(408, '2026-06-12', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(409, '2026-06-13', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(410, '2026-06-14', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(411, '2026-06-15', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'dr. Cadangan : dr. Dina Putri Nasution, SpTHT – KL', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(412, '2026-06-16', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'jika DPJP Utama tidak dapat dihubungi atau berhalangan.', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(413, '2026-06-17', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(414, '2026-06-18', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(415, '2026-06-19', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(416, '2026-06-20', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(417, '2026-06-21', 10, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(418, '2026-06-22', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'dr. Cadangan : dr. Meila Sutanti, SpTHT-KL', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(419, '2026-06-23', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'jika DPJP Utama tidak dapat dihubungi atau berhalangan.', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(420, '2026-06-24', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(421, '2026-06-25', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(422, '2026-06-26', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(423, '2026-06-27', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(424, '2026-06-28', 11, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(425, '2026-06-29', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'dr. Cadangan : Prof. dr. Bambang H., SpTHT-KL', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(426, '2026-06-30', 12, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'jika DPJP Utama tidak dapat dihubungi atau berhalangan.', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(427, '2026-06-01', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(428, '2026-06-02', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(429, '2026-06-03', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(430, '2026-06-04', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(431, '2026-06-05', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(432, '2026-06-06', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(433, '2026-06-07', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(434, '2026-06-08', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(435, '2026-06-09', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(436, '2026-06-10', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(437, '2026-06-11', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(438, '2026-06-12', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(439, '2026-06-13', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(440, '2026-06-14', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(441, '2026-06-15', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(442, '2026-06-16', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(443, '2026-06-17', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(444, '2026-06-18', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(445, '2026-06-19', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(446, '2026-06-20', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(447, '2026-06-21', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(448, '2026-06-22', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(449, '2026-06-23', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(450, '2026-06-24', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(451, '2026-06-25', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(452, '2026-06-26', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(453, '2026-06-27', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(454, '2026-06-28', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(455, '2026-06-29', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(456, '2026-06-30', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga Fransiskus', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(457, '2026-06-01', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(458, '2026-06-02', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(459, '2026-06-03', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(460, '2026-06-04', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(461, '2026-06-05', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(462, '2026-06-06', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(463, '2026-06-07', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(464, '2026-06-08', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(465, '2026-06-09', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(466, '2026-06-10', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(467, '2026-06-11', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(468, '2026-06-12', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(469, '2026-06-13', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(470, '2026-06-14', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(471, '2026-06-15', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(472, '2026-06-16', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(473, '2026-06-17', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(474, '2026-06-18', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(475, '2026-06-19', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(476, '2026-06-20', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(477, '2026-06-21', 42, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(478, '2026-06-22', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(479, '2026-06-23', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(480, '2026-06-24', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(481, '2026-06-25', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(482, '2026-06-26', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(483, '2026-06-27', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(484, '2026-06-28', 40, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(485, '2026-06-29', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(486, '2026-06-30', 41, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Jaga ICU', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(487, '2026-06-01', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(488, '2026-06-02', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(489, '2026-06-03', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(490, '2026-06-04', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(491, '2026-06-05', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(492, '2026-06-06', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(493, '2026-06-07', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(494, '2026-06-08', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(495, '2026-06-09', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(496, '2026-06-10', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(497, '2026-06-11', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(498, '2026-06-12', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(499, '2026-06-13', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(500, '2026-06-14', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(501, '2026-06-15', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(502, '2026-06-16', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(503, '2026-06-17', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(504, '2026-06-18', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(505, '2026-06-19', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(506, '2026-06-20', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(507, '2026-06-21', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(508, '2026-06-22', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(509, '2026-06-23', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(510, '2026-06-24', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(511, '2026-06-25', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(512, '2026-06-26', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(513, '2026-06-27', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(514, '2026-06-28', 47, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(515, '2026-06-29', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(516, '2026-06-30', 46, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(517, '2026-06-01', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', 'Bila Dokter Jaga tidak dapat dihubungi, mohon untuk dapat menghubungi Dokter jaga diurutan selanjutnya.', 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(518, '2026-06-02', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(519, '2026-06-03', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(520, '2026-06-04', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(521, '2026-06-05', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(522, '2026-06-06', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(523, '2026-06-07', 51, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(524, '2026-06-08', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(525, '2026-06-09', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(526, '2026-06-10', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(527, '2026-06-11', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(528, '2026-06-12', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(529, '2026-06-13', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(530, '2026-06-14', 52, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(531, '2026-06-15', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(532, '2026-06-16', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(533, '2026-06-17', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(534, '2026-06-18', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(535, '2026-06-19', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(536, '2026-06-20', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(537, '2026-06-21', 48, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(538, '2026-06-22', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(539, '2026-06-23', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(540, '2026-06-24', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(541, '2026-06-25', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(542, '2026-06-26', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(543, '2026-06-27', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(544, '2026-06-28', 49, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(545, '2026-06-29', 50, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(546, '2026-06-30', 50, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(547, '2026-06-01', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(548, '2026-06-02', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(549, '2026-06-03', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(550, '2026-06-04', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(551, '2026-06-05', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(552, '2026-06-06', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(553, '2026-06-07', 57, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(554, '2026-06-08', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(555, '2026-06-09', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(556, '2026-06-10', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(557, '2026-06-11', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(558, '2026-06-12', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(559, '2026-06-13', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(560, '2026-06-14', 58, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(561, '2026-06-15', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(562, '2026-06-16', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(563, '2026-06-17', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(564, '2026-06-18', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(565, '2026-06-19', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(566, '2026-06-20', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(567, '2026-06-21', 59, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(568, '2026-06-22', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(569, '2026-06-23', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(570, '2026-06-24', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(571, '2026-06-25', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(572, '2026-06-26', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(573, '2026-06-27', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(574, '2026-06-28', 60, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(575, '2026-06-29', 61, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(576, '2026-06-30', 61, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(577, '2026-06-01', 86, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(578, '2026-06-02', 86, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(579, '2026-06-03', 86, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(580, '2026-06-04', 86, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(581, '2026-06-05', 86, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(582, '2026-06-06', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(583, '2026-06-07', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(584, '2026-06-08', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(585, '2026-06-09', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(586, '2026-06-10', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(587, '2026-06-11', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(588, '2026-06-12', 65, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(589, '2026-06-13', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(590, '2026-06-14', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(591, '2026-06-15', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(592, '2026-06-16', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(593, '2026-06-17', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(594, '2026-06-18', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(595, '2026-06-19', 66, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(596, '2026-06-20', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(597, '2026-06-21', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(598, '2026-06-22', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(599, '2026-06-23', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(600, '2026-06-24', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(601, '2026-06-25', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(602, '2026-06-26', 67, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(603, '2026-06-27', 68, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(604, '2026-06-28', 68, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(605, '2026-06-29', 68, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0),
(606, '2026-06-30', 68, '-', 'Oncall', 20, '08:00:00', '14:00:00', NULL, 1, '2026-06-05 02:02:41', NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kategori_posisi`
--

CREATE TABLE `kategori_posisi` (
  `id` int(11) NOT NULL,
  `nama_kategori` varchar(100) DEFAULT NULL,
  `urutan` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kategori_posisi`
--

INSERT INTO `kategori_posisi` (`id`, `nama_kategori`, `urutan`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_by`, `deleted_at`, `is_deleted`) VALUES
(1, '🚨 Unit Gawat Darurat', 1, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(2, '🩺 Penyakit Dalam & Spesialis', 2, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(3, '🔪 Bedah', 3, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(4, '⚡ Bedah Lanjut & Penunjang', 4, NULL, NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `konsultasi_medis`
--

CREATE TABLE `konsultasi_medis` (
  `id_konsultasi` int(11) NOT NULL,
  `id_pendaftaran` int(11) NOT NULL,
  `id_paramedic` int(11) NOT NULL,
  `id_pasien` int(11) NOT NULL,
  `tanggal_konsultasi` datetime NOT NULL DEFAULT current_timestamp(),
  `anamnesis_keluhan` text NOT NULL,
  `diagnosis` text NOT NULL,
  `tindakan_terapi` text DEFAULT NULL,
  `resep_obat` text DEFAULT NULL,
  `catatan_dokter` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `permission` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menus`
--

INSERT INTO `menus` (`id`, `name`, `icon`, `url`, `parent_id`, `permission`, `order`, `created_at`, `updated_at`) VALUES
(1, 'Jadwal', '📅', NULL, NULL, 'jadwal.read', 1, '2026-05-02 12:30:13', '2026-05-20 07:35:25'),
(2, 'Lihat Jadwal', '📅 ', '/admin', 1, 'jadwal.read', 0, '2026-05-02 12:30:13', '2026-05-02 12:30:13'),
(3, 'Input Jadwal', '👨‍⚕️', '/admin/jadwal', 1, 'jadwal.create,jadwal.update', 1, '2026-05-02 12:30:13', '2026-05-15 01:57:09'),
(4, 'Penanggung Jawab', '👥 ', '/admin/penanggungjawab', NULL, 'penanggung_jawab.read', 1, '2026-05-02 12:30:13', '2026-05-02 12:30:13'),
(5, 'Karyawan', '🏥', '/admin/paramedic', NULL, 'paramedic.read', 2, '2026-05-02 12:30:13', '2026-05-26 06:50:51'),
(6, 'Posisi', '👩‍⚕️', '/admin/posisi', NULL, 'posisi.read', 3, '2026-05-02 12:30:13', '2026-05-26 06:51:07'),
(7, 'Medical Staff', '🧩', NULL, NULL, 'bagian_paramedic.read', 4, '2026-05-02 12:30:13', '2026-05-26 06:51:11'),
(8, 'Akses & Pengguna', '🔐', NULL, NULL, 'user.read,role.read,permission.read', 5, '2026-05-02 12:30:13', '2026-05-26 06:51:20'),
(9, 'Users', NULL, '/admin/RBAC/users', 8, 'user.read', 0, '2026-05-02 12:30:13', '2026-05-02 12:30:13'),
(10, 'Role', NULL, '/admin/RBAC/roles', 8, 'role.read', 1, '2026-05-02 12:30:13', '2026-05-02 12:30:13'),
(11, 'Permission', NULL, '/admin/RBAC/permissions', 8, 'permission.read', 2, '2026-05-02 12:30:13', '2026-05-02 12:30:13'),
(12, 'Menu', '📋', '/admin/menus', 8, 'menu.manage', 3, NULL, NULL),
(14, 'Import Jadwal', '📥', '/admin/import', 1, 'jadwal.import', 2, '2026-05-15 01:56:56', '2026-05-19 07:57:01'),
(15, 'Medical Staff List', '📝', '/admin/bagianparamedic/TableMapping', 7, 'bagian_paramedic.read', 1, '2026-05-18 06:24:34', '2026-05-18 06:27:14'),
(16, 'Medical Staff Mapping', '👩🏻‍⚕️', '/admin/bagianparamedic', 7, 'bagian_paramedic.read', 0, '2026-05-18 06:27:07', '2026-05-18 06:27:07'),
(17, 'Import Paramedic', '👨🏻‍⚕️', '/admin/import/paramedic', 7, 'paramedic.import', 2, '2026-05-18 06:40:07', '2026-05-26 06:50:43');

-- --------------------------------------------------------

--
-- Struktur dari tabel `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(2, '0001_01_01_000000_create_users_table', 1),
(3, '0001_01_01_000001_create_cache_table', 1),
(4, '0001_01_01_000002_create_jobs_table', 1),
(5, '2026_04_15_043516_create_personal_access_tokens_table', 1),
(6, '2026_04_16_033627_create_roles_table', 1),
(7, '2026_04_16_034042_create_user_role_table', 1),
(8, '2026_04_16_050617_create_permissions_table', 1),
(9, '2026_04_16_050640_create_role_permission_table', 1),
(10, '2026_04_16_050659_create_user_permission_table', 1),
(13, '2026_05_02_190847_create_menus_table', 2),
(14, '2026_05_13_143921_create_import_templates', 3);

-- --------------------------------------------------------

--
-- Struktur dari tabel `paramedic`
--

CREATE TABLE `paramedic` (
  `id_paramedic` int(11) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `nama_paramedic` varchar(150) DEFAULT NULL,
  `npk` varchar(255) DEFAULT NULL,
  `jenis_paramedic` varchar(50) DEFAULT NULL,
  `spesialisasi` varchar(150) DEFAULT NULL,
  `no_str` varchar(100) DEFAULT NULL,
  `no_sip` varchar(100) DEFAULT NULL,
  `no_hp` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `paramedic`
--

INSERT INTO `paramedic` (`id_paramedic`, `user_id`, `nama_paramedic`, `npk`, `jenis_paramedic`, `spesialisasi`, `no_str`, `no_sip`, `no_hp`, `email`, `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted_by`, `deleted_at`, `is_deleted`) VALUES
(1, NULL, 'dr. Hardjo Prawira, Sp. P.D, Subsp. Kv. (K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', 1, '2026-05-29 04:41:48', NULL, NULL, 0),
(2, NULL, 'dr. Rachmat Hamonangan, Sp. P.D, Subsp. Kv. (K), FINASIM, FICA, FACP.', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(3, NULL, 'dr. Onny Witjaksono, Sp JP', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(4, NULL, 'dr. Ike Adriana, Sp JP, FIHA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(5, NULL, 'dr. Hendra Koncoro, MBiomed, Sp.PD, KGEH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(6, NULL, 'dr. R. Eddy Setijoso, Sp.PD, KGEH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(7, NULL, 'dr. Indria Melianti, SpPD-KGEH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(8, NULL, 'dr. Affan Priyambodo Permana, Sp.BS', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(9, NULL, 'dr. Octavianus Darmawan, Mbiomed, SpN', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(10, NULL, 'Prof. dr. Bambang H., SpTHT-KL', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(11, NULL, 'dr. Dina Putri Nasution, SpTHT – KL', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(12, NULL, 'dr. Meila Sutanti, SpTHT-KL', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(13, NULL, 'Prof. dr. Wiwien Heru Wiyono, PhD, Sp.P (K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(14, NULL, 'dr. Mohamad Fahmi, Sp.P (K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(15, NULL, 'dr. Andika Chandra P, PhD, Sp.P (K), Onk, FAPSR', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(16, NULL, 'dr. Yohanes Yanni, SpS', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(17, NULL, 'dr. Silvester Christanto, SpS', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(18, NULL, 'dr. Widyawati Suhendro , SpN', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(19, NULL, 'dr. A. P. Wawolumaja, SpB, FInaCS', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(20, NULL, 'dr. Felix Febryano Hangandi, SpB', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(21, NULL, 'dr. Odetta Natatilova Halim, SpB', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(22, NULL, 'dr. Desy Natalia, SpB', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(23, NULL, 'dr. Ande Fachniadin, SpBS', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(24, NULL, 'dr. Renindra Ananda Aman, SpBS(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(25, NULL, 'Prof. Dr. dr. Akmal Taher, SpU(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(26, NULL, 'dr. Robertus bebet P., SpU(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(27, NULL, 'dr. Albert Ivan Parasian, SpU', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(28, NULL, 'Dr. dr. J. C. Prihadi., SpU(K), MPH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(29, NULL, 'dr. G. Reinaldi Situmorang, SpU(K), PhD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(30, NULL, 'dr. Nadia Nastassia P. Putri Shah Ifran, SpOT(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(31, NULL, 'dr. Claudia Santosa, SpOT', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(32, NULL, 'dr. Maria Florencia Deslivia, SpOT., PhD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(33, NULL, 'dr. Bagus Pramantha, SpOT', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(34, NULL, 'dr. Ifran Saleh, SpOT(K) Spine', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(35, NULL, 'dr. Sigit Daru Cahayadi, SpOT', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(36, NULL, 'dr. J. B. Endrotomo S., SpOT(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(37, NULL, 'dr. Astuti Pitarini, SpOT (K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(38, NULL, 'dr. Erica Kholinne, SpOT(K)., PhD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(39, NULL, 'dr. Adianto Nugroho, SpB. Subsp. BD(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(40, NULL, 'dr. Cosmas Gora Triaswhoro, SpB. Subsp. BD(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(41, NULL, 'dr. Maria Mayasari, SpB., Subsp.BD(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(42, NULL, 'dr. Yosef Maria Seno Adjie, SpOG(K)', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(43, NULL, 'dr. Ekarini Aryasatiani, SpOG', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(44, NULL, 'dr. Ivanna Theresa S., SpOG, MPH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(45, NULL, 'dr. Noviyani Sugiarto, SpOG', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(46, NULL, 'dr. Citra Dewi, SpOG', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', 1, '2026-05-29 04:42:00', NULL, NULL, 0),
(47, NULL, 'dr. Wahyudi Wirawan, M. Biomed., SpOG., Subsp. KFm', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(48, NULL, 'dr. Yohanes Alda, SpOG', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(49, NULL, 'dr. Anastasia Asylia Dinakrisma, Sp.PD-KGer', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(50, NULL, 'dr. Emon Winardi Danudirgo, Sp.PD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(51, NULL, 'dr. L. Aswin Pramono, Sp.PD-KEMD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(52, NULL, 'dr. Galuh Chandra Kirana, Sp.PD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(53, NULL, 'dr. Jo, Carolina Margaret, Sp.PD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(54, NULL, 'dr. Nur Chandra Bunawan, Sp.PD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(55, NULL, 'dr. Robert Sinto, Sp.PD-KPTI', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(56, NULL, 'dr. Fransiska, Sp.PD-KGH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(57, NULL, 'dr. Steven David P,  Sp.PD-KGH', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(58, NULL, 'dr. Santy Sijabat, SpPD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(59, NULL, 'dr. Antonius S. Wirawan., SpPD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(60, NULL, 'dr. Haris Akman, SPPD', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(61, NULL, 'dr. Maria Martina Siboe, SpA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(62, NULL, 'dr. Elisabeth Yohmi, SpA, IBCLC', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(63, NULL, 'dr. Eveline Panjaiatan , SpA, IBCLC', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(64, NULL, 'dr. J. Mila H. C., SpA, Mkes', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(65, NULL, 'dr. William Cheng, SPA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(66, NULL, 'dr. Ratno Juniarto M. Sidauruk., SpA, Subsp. PCT', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(67, NULL, 'dr. Jeanne Laurensie Sihombing., SpA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(68, NULL, 'dr. Ayu Nuriani, SpA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(69, NULL, 'dr. Ria Yoanita, SpA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(70, NULL, 'dr. Retta Fayma Sihombing, M. Med.Sc.,SpA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(71, NULL, 'dr. Talitha Arinda Putri, SpA', NULL, 'Dokter', NULL, NULL, NULL, NULL, NULL, 1, '2026-05-26 07:48:27', NULL, '2026-05-29 07:15:23', NULL, NULL, 0),
(72, NULL, 'dr. Ardeno Kristianto, SpPD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(73, NULL, 'dr. Valerie Hirsy Putri, Sp.PD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-06-05 01:31:21', NULL, NULL, NULL, NULL, 0),
(74, NULL, 'dr. Royanto Darmaputra, SpOG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-06-05 01:31:22', NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `pasien`
--

CREATE TABLE `pasien` (
  `id_pasien` int(11) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `no_rm` varchar(50) NOT NULL,
  `nik` varchar(20) NOT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `no_hp` varchar(30) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `golongan_darah` varchar(5) DEFAULT NULL,
  `riwayat_alergi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `username` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `penanggung_jawab`
--

CREATE TABLE `penanggung_jawab` (
  `id_penanggung_jawab` int(11) NOT NULL,
  `tanggal` date DEFAULT NULL,
  `id_perawat` int(11) DEFAULT NULL,
  `id_kepala_jaga` int(11) DEFAULT NULL,
  `id_ponek` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pendaftaran_konsultasi`
--

CREATE TABLE `pendaftaran_konsultasi` (
  `id_pendaftaran` int(11) NOT NULL,
  `kode_booking` varchar(30) NOT NULL,
  `nomor_antrian` varchar(20) NOT NULL,
  `urutan_antrian` int(11) NOT NULL,
  `id_pasien` int(11) NOT NULL,
  `jadwal_id` int(11) NOT NULL,
  `tanggal_kunjungan` date NOT NULL,
  `keluhan` text DEFAULT NULL,
  `status_antrian` enum('Menunggu','Dipanggil','Selesai','Batal') NOT NULL DEFAULT 'Menunggu',
  `waktu_daftar` timestamp NULL DEFAULT current_timestamp(),
  `waktu_dipanggil` timestamp NULL DEFAULT NULL,
  `waktu_selesai` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `permission_name` varchar(255) NOT NULL,
  `route` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `permissions`
--

INSERT INTO `permissions` (`id`, `permission_name`, `route`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'user.create', '/users', NULL, NULL, NULL, NULL),
(2, 'user.read', '/users', NULL, NULL, NULL, NULL),
(3, 'user.update', '/users/{id}', NULL, NULL, NULL, NULL),
(4, 'user.delete', '/users/{id}', NULL, NULL, NULL, NULL),
(5, 'role.create', '/roles', NULL, NULL, NULL, NULL),
(6, 'role.read', '/roles', NULL, NULL, NULL, NULL),
(7, 'role.update', '/roles/{id}', NULL, NULL, NULL, NULL),
(8, 'role.delete', '/roles/{id}', NULL, NULL, NULL, NULL),
(9, 'permission.create', '/permission', NULL, NULL, NULL, NULL),
(10, 'permission.read', '/permission', NULL, NULL, NULL, NULL),
(11, 'permission.update', '/permission/{id}', NULL, NULL, NULL, NULL),
(12, 'permission.delete', '/permission/{id}', NULL, NULL, NULL, NULL),
(13, 'jadwal.create', '/jadwal', NULL, NULL, NULL, NULL),
(14, 'jadwal.read', '/jadwal', NULL, NULL, NULL, NULL),
(15, 'jadwal.update', '/jadwal/{id}', NULL, NULL, NULL, NULL),
(16, 'jadwal.delete', '/jadwal/{id}', NULL, NULL, NULL, NULL),
(17, 'bagian_paramedic.create', '/bagian-paramedic', NULL, NULL, NULL, NULL),
(18, 'bagian_paramedic.read', '/bagian-paramedic', NULL, NULL, NULL, NULL),
(19, 'bagian_paramedic.update', '/bagian-paramedic/{id}', NULL, NULL, NULL, NULL),
(20, 'bagian_paramedic.delete', '/bagian-paramedic/{id}', NULL, NULL, NULL, NULL),
(21, 'paramedic.create', '/paramedic', NULL, NULL, NULL, NULL),
(22, 'paramedic.read', '/paramedic', NULL, NULL, NULL, NULL),
(23, 'paramedic.update', '/paramedic/{id}', NULL, NULL, NULL, NULL),
(24, 'paramedic.delete', '/paramedic/{id}', NULL, NULL, NULL, NULL),
(25, 'posisi.create', '/posisi', NULL, NULL, NULL, NULL),
(26, 'posisi.read', '/posisi', NULL, NULL, NULL, NULL),
(27, 'posisi.update', '/posisi/{id}', NULL, NULL, NULL, NULL),
(28, 'posisi.delete', '/posisi/{id}', NULL, NULL, NULL, NULL),
(29, 'penanggung_jawab.read', '/penanggung_jawab', NULL, NULL, NULL, NULL),
(30, 'penanggung_jawab.create', '/penanggung_jawab', NULL, NULL, NULL, NULL),
(31, 'penanggung_jawab.update', '/penanggung_jawab/{id}', NULL, NULL, NULL, NULL),
(32, 'penanggung_jawab.delete', '/penanggung_jawab/{id}', NULL, NULL, NULL, NULL),
(44, 'role_permission.delete', '/role-permission/{roleId}', '2026-04-24 02:25:38', '2026-04-24 02:25:38', 1, NULL),
(46, 'user_role.delete', '/user-role/{userId}', '2026-04-24 02:25:39', '2026-04-24 02:25:39', 1, NULL),
(48, 'user_permission.delete', '/user-permission/{roleId}', '2026-04-24 02:25:39', '2026-04-24 02:25:39', 1, NULL),
(49, 'kategori_posisi.create', '/posisi-reorder', '2026-04-27 02:42:06', '2026-04-27 02:42:42', 1, 1),
(50, 'kategori_posisi.read', '/kategori-posisi', '2026-04-27 07:15:00', '2026-04-27 07:15:14', 1, 1),
(52, 'akses_pengguna.read', NULL, NULL, NULL, NULL, NULL),
(53, 'paramedic.restore', NULL, NULL, NULL, NULL, NULL),
(54, 'posisi.restore', NULL, NULL, NULL, NULL, NULL),
(55, 'penanggung_jawab.restore', NULL, NULL, NULL, NULL, NULL),
(56, 'jadwal.restore', NULL, NULL, NULL, NULL, NULL),
(57, 'posisi.reorder', NULL, NULL, NULL, NULL, NULL),
(58, 'role_permission.read', NULL, NULL, NULL, NULL, NULL),
(59, 'role_permission.update', NULL, NULL, NULL, NULL, NULL),
(60, 'user_role.read', NULL, NULL, NULL, NULL, NULL),
(61, 'user_role.update', NULL, NULL, NULL, NULL, NULL),
(62, 'user_permission.read', NULL, NULL, NULL, NULL, NULL),
(63, 'user_permission.update', NULL, NULL, NULL, NULL, NULL),
(64, 'menu.manage', 'admin/menus', '2026-05-02 12:17:12', '2026-05-02 12:17:24', 1, 1),
(65, 'kategori_posisi.manage', '/kategori-posisi', '2026-05-06 07:56:00', '2026-05-07 01:20:08', 1, 1),
(67, 'jadwal.destroy', 'jadwal.destroy', '2026-05-11 01:33:13', '2026-05-11 01:33:13', 1, NULL),
(68, 'paramedic.destroy', 'paramedic.destroy', '2026-05-11 01:33:13', '2026-05-11 01:33:13', 1, NULL),
(69, 'posisi.destroy', 'posisi.destroy', '2026-05-11 01:33:13', '2026-05-11 01:33:13', 1, NULL),
(70, 'bagian_paramedic.destroy', 'bagian_paramedic.destroy', '2026-05-11 01:33:14', '2026-05-11 01:33:14', 1, NULL),
(71, 'penanggung_jawab.destroy', 'penanggung_jawab.destroy', '2026-05-11 01:33:14', '2026-05-11 01:33:14', 1, NULL),
(72, 'bagian_paramedic.restore', '/bagian-paramedic/{id}', '2026-05-19 04:13:01', '2026-05-19 04:13:22', 1, 1),
(73, 'jadwal.import', 'jadwal.import', '2026-05-19 07:56:17', '2026-05-19 07:56:17', 1, NULL),
(74, 'paramedic.import', 'paramedic.import', '2026-05-19 07:56:17', '2026-05-19 07:56:17', 1, NULL),
(75, 'asdas', 'asdas', '2026-06-04 02:46:29', '2026-06-04 02:46:29', 1, NULL),
(77, 'dokter.dashboard', '/dokter/dashboard', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(78, 'dokter.jadwal.read', '/dokter/jadwal', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(79, 'dokter.pendaftaran.read', '/dokter/pendaftaran', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(80, 'dokter.konsultasi.manage', '/dokter/konsultasi', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(81, 'dokter.laporan.read', '/dokter/laporan', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(82, 'dokter.profile.manage', '/dokter/profile', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(83, 'laporan.admin.read', '/admin/laporan', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(84, 'pasien.portal.access', '/pasien', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(132, 'App\\Models\\Users', 7, 'carolus-connect', 'a43b0d1818b6188325df751bee18d7f18d80bcedd685743f9f22d3147c35f4d5', '[\"*\"]', '2026-05-06 08:37:08', NULL, '2026-05-06 08:37:07', '2026-05-06 08:37:08'),
(143, 'App\\Models\\Users', 1, 'api-user', '129c1e7ccb80c436e25def394681f8ed9ea5739d35cb59228d817abd47f8cccd', '[\"*\"]', '2026-05-13 03:42:44', NULL, '2026-05-13 03:40:44', '2026-05-13 03:42:44'),
(145, 'App\\Models\\Users', 1, 'api-user', '296f9a645f93d71b9ed40db8a5046d6b1569366f4284bc54b49bc046e3d6fe24', '[\"*\"]', '2026-05-19 06:30:36', NULL, '2026-05-19 04:23:17', '2026-05-19 06:30:36'),
(146, 'App\\Models\\Users', 1, 'api-user', '435d0ac852ed33abad09eee3b46633a885c834259e537a9b4f9cd300429e5444', '[\"*\"]', '2026-05-19 06:33:40', NULL, '2026-05-19 06:33:40', '2026-05-19 06:33:40'),
(147, 'App\\Models\\Users', 1, 'api-user', '46d952fbf9a73dc569a33d9bb6ed8cdcbd29dac9c01ef2699b0bb2f6f29fb503', '[\"*\"]', '2026-05-19 06:36:55', NULL, '2026-05-19 06:36:06', '2026-05-19 06:36:55'),
(148, 'App\\Models\\Users', 1, 'api-user', '4f3bf0794e471e9d59fb6056b6940a9a81e7de6ff44de96880ac3bcccc7845c3', '[\"*\"]', '2026-05-19 07:09:09', NULL, '2026-05-19 06:37:01', '2026-05-19 07:09:09'),
(149, 'App\\Models\\Users', 1, 'api-user', '626b38a9cc4735cefc19d6276dc10176165157aaad5dc369fb9ec779ece3568f', '[\"*\"]', '2026-05-19 07:52:55', NULL, '2026-05-19 07:15:44', '2026-05-19 07:52:55'),
(150, 'App\\Models\\Users', 7, 'api-user', '710149e018023037bfd05bdfc2349ede5213f064ff65c940447efad6b3b279e2', '[\"*\"]', '2026-05-19 07:54:15', NULL, '2026-05-19 07:54:11', '2026-05-19 07:54:15'),
(151, 'App\\Models\\Users', 4, 'api-user', '29b7f629c23429fa079c4fdf5e0318727704fbc66f776bec7f2904e01a74f7a1', '[\"*\"]', '2026-05-19 07:55:12', NULL, '2026-05-19 07:54:27', '2026-05-19 07:55:12'),
(152, 'App\\Models\\Users', 1, 'api-user', 'aa62a3c1c0666698db65a1f1ae5d987c2036f2a0cc9e42b2c32cbe4731382656', '[\"*\"]', '2026-05-19 07:57:33', NULL, '2026-05-19 07:55:20', '2026-05-19 07:57:33'),
(153, 'App\\Models\\Users', 1, 'api-user', 'e254f2618da07883aff76874753be90246e3de532febbfcfb7777e8df0a2efb8', '[\"*\"]', '2026-05-19 07:57:41', NULL, '2026-05-19 07:57:41', '2026-05-19 07:57:41'),
(154, 'App\\Models\\Users', 4, 'api-user', '16368ade21c31f2078f2de502360617984bfb5b4e6ca938f71f003eebb86e0c6', '[\"*\"]', '2026-05-19 07:58:06', NULL, '2026-05-19 07:57:58', '2026-05-19 07:58:06'),
(155, 'App\\Models\\Users', 1, 'api-user', '2e64209239f15c4c6367a71d1cbf29c2d8ec423c00e54428da6c7d93aa80131a', '[\"*\"]', '2026-05-19 08:16:30', NULL, '2026-05-19 08:02:47', '2026-05-19 08:16:30'),
(156, 'App\\Models\\Users', 1, 'api-user', '31fc7d81c46fd9e4d8c5b81c48c52be7315a85793a9a06c2581dcc980e7d0fe5', '[\"*\"]', '2026-05-20 04:30:15', NULL, '2026-05-20 00:55:57', '2026-05-20 04:30:15'),
(157, 'App\\Models\\Users', 1, 'api-user', 'f404e6dab42fb995ace585a02ae5365c034d37ad6ebad318d8a0484bd9baaa59', '[\"*\"]', '2026-05-20 04:33:02', NULL, '2026-05-20 04:30:25', '2026-05-20 04:33:02'),
(158, 'App\\Models\\Users', 1, 'api-user', '8d65a8934c8ae1b51cc1b970fa6a5aded54c25d56a894bc01646d581ede56d06', '[\"*\"]', '2026-05-20 05:10:43', NULL, '2026-05-20 04:33:10', '2026-05-20 05:10:43'),
(159, 'App\\Models\\Users', 1, 'api-user', '28434d04620409083fece046b7d153eeea45c59a50f8eea0ba006453ed016eb0', '[\"*\"]', '2026-05-20 07:46:09', NULL, '2026-05-20 05:07:51', '2026-05-20 07:46:09'),
(160, 'App\\Models\\Users', 1, 'api-user', 'a62e14ba2c8da85a3caeebc77eebf79c4324e80212c4b5dce5f76f934d6d9d08', '[\"*\"]', '2026-05-20 07:24:44', NULL, '2026-05-20 07:23:43', '2026-05-20 07:24:44'),
(161, 'App\\Models\\Users', 10, 'api-user', 'cb7da87767f3ab342ac042b8dfbe74f866ff40a94117e03ebd85ecbe2c7d78e0', '[\"*\"]', '2026-05-20 07:25:49', NULL, '2026-05-20 07:25:12', '2026-05-20 07:25:49'),
(162, 'App\\Models\\Users', 1, 'api-user', '5850523f5fc06a8e4d26f518ffee5680fe868373dd81a6a2c290f39a0787b1d1', '[\"*\"]', '2026-05-20 07:27:19', NULL, '2026-05-20 07:26:26', '2026-05-20 07:27:19'),
(163, 'App\\Models\\Users', 10, 'api-user', 'fb2275fc844f5bc8eb4014374838d137253d4239a1a93d56ea11f37ca74659a1', '[\"*\"]', '2026-05-20 08:09:40', NULL, '2026-05-20 07:27:43', '2026-05-20 08:09:40'),
(164, 'App\\Models\\Users', 10, 'api-user', '38e62a90312d22a4637408e46d730bea197a1be713b357b279b00398ead80824', '[\"*\"]', '2026-05-20 07:34:50', NULL, '2026-05-20 07:33:39', '2026-05-20 07:34:50'),
(165, 'App\\Models\\Users', 1, 'api-user', '27aa0c5d8b472bbc6ed72d8239c23a951bca1314a44d2def63ebe0eeb392c4b0', '[\"*\"]', '2026-05-21 02:41:11', NULL, '2026-05-21 02:41:07', '2026-05-21 02:41:11'),
(166, 'App\\Models\\Users', 1, 'api-user', '00d829b879ead94f5a503e471123782378cba58337b69a766a222119404e50cc', '[\"*\"]', '2026-05-21 02:43:17', NULL, '2026-05-21 02:43:13', '2026-05-21 02:43:17'),
(167, 'App\\Models\\Users', 1, 'api-user', '2d0ada3ff203290a0da8ed8bb41bfe29d7bd2d66b98738a7d3dc7ea27fcd5642', '[\"*\"]', '2026-05-21 02:59:31', NULL, '2026-05-21 02:49:42', '2026-05-21 02:59:31'),
(168, 'App\\Models\\Users', 1, 'api-user', 'e41f60f2600768590e0773b346016e068f100f5f86c9639b3e3982261d924e5a', '[\"*\"]', '2026-05-21 03:26:27', NULL, '2026-05-21 03:03:17', '2026-05-21 03:26:27'),
(169, 'App\\Models\\Users', 1, 'api-user', '22a0babc16caaf796aff53bd61053dcfbdb343d4c0ced5fafce8f1ebf1e6f480', '[\"*\"]', '2026-05-21 08:15:09', NULL, '2026-05-21 03:09:08', '2026-05-21 08:15:09'),
(170, 'App\\Models\\Users', 1, 'api-user', 'bff43299df320c78437a04443c9221f764b65ff3f99ffb293c88aaf76de8b5d2', '[\"*\"]', '2026-05-21 07:44:55', NULL, '2026-05-21 07:44:55', '2026-05-21 07:44:55'),
(171, 'App\\Models\\Users', 1, 'api-user', '1e835109f162f632b559afbc98b634e9bbaab014a3de1695d17f98743cb95dc3', '[\"*\"]', '2026-05-22 05:35:23', NULL, '2026-05-22 01:08:37', '2026-05-22 05:35:23'),
(172, 'App\\Models\\Users', 1, 'api-user', '252e91969fca64e09dc101b94bd4d94c29b96fc6f3ac76ecf21b63887ecb02c8', '[\"*\"]', '2026-05-22 06:37:53', NULL, '2026-05-22 05:35:51', '2026-05-22 06:37:53'),
(173, 'App\\Models\\Users', 1, 'api-user', '192ab4a65bb7618153d491601af6ee974fab2612687aa38b1f6bf8612e4cf8b1', '[\"*\"]', '2026-05-22 07:50:14', NULL, '2026-05-22 06:38:34', '2026-05-22 07:50:14'),
(174, 'App\\Models\\Users', 1, 'api-user', '90fce7aa7d4ff2dad50f54789af21c3be298a74f44e337045ce486b5ad32c8f3', '[\"*\"]', NULL, NULL, '2026-05-22 08:07:41', '2026-05-22 08:07:41'),
(175, 'App\\Models\\Users', 1, 'api-user', 'bf271411a43f0758c944ec892554f07ca19422fa1c2dbf07878098b5a90cf9ae', '[\"*\"]', NULL, NULL, '2026-05-22 08:07:50', '2026-05-22 08:07:50'),
(176, 'App\\Models\\Users', 1, 'api-user', '0009d3d160fd82c7adc6c01c7bfeb54246dc32140242ecf1ffadbe8c87000167', '[\"*\"]', NULL, NULL, '2026-05-22 08:08:08', '2026-05-22 08:08:08'),
(177, 'App\\Models\\Users', 1, 'api-user', 'b0e070de6ff253cbc9a2bc6a05bb52b95c186bc34ba7506f9f64e062b258ff22', '[\"*\"]', NULL, NULL, '2026-05-22 08:08:19', '2026-05-22 08:08:19'),
(178, 'App\\Models\\Users', 1, 'api-user', '81ae07c4f17f2fda4195a9dcc970997d501d61b220267237928eee15a4ed7883', '[\"*\"]', NULL, NULL, '2026-05-22 08:08:58', '2026-05-22 08:08:58'),
(179, 'App\\Models\\Users', 1, 'api-user', '83e5b4fef5bf05ca31e07f26447c3940dabc178e826d4b702614a4b2fd602328', '[\"*\"]', NULL, NULL, '2026-05-22 08:09:33', '2026-05-22 08:09:33'),
(180, 'App\\Models\\Users', 1, 'api-user', 'acf463e7b491194cd59c31cd561fc73470bf27fb77c76b02f498dbc5f4b323c8', '[\"*\"]', NULL, NULL, '2026-05-22 08:11:08', '2026-05-22 08:11:08'),
(181, 'App\\Models\\Users', 1, 'api-user', 'a4080404fd7887f3b7df4522215931f69cf6acc94314bab24112876605cc5f57', '[\"*\"]', NULL, NULL, '2026-05-22 08:13:21', '2026-05-22 08:13:21'),
(182, 'App\\Models\\Users', 1, 'api-user', '02ac6c8b7b0fd46de94fdae5cb23e6e9e1deb2e67018240a306ac7901513b6dc', '[\"*\"]', NULL, NULL, '2026-05-22 08:14:23', '2026-05-22 08:14:23'),
(183, 'App\\Models\\Users', 1, 'api-user', '2a72711cbd1d6c99755f1cf01cdc2ec357d405fc55083a45d0bcc2b4abec412e', '[\"*\"]', NULL, NULL, '2026-05-22 08:17:28', '2026-05-22 08:17:28'),
(184, 'App\\Models\\Users', 1, 'api-user', '74c66e33c42c5efa0acd80660fecc42f6eeb1e8e62b0ae20354ad46257ab8d3d', '[\"*\"]', NULL, NULL, '2026-05-22 08:18:56', '2026-05-22 08:18:56'),
(185, 'App\\Models\\Users', 1, 'api-user', '89ee00ddef309125d50bc4201ee3ae3ec40e4de9a09c4c5745420d9eb8ff949b', '[\"*\"]', '2026-05-26 08:24:23', NULL, '2026-05-22 08:24:24', '2026-05-26 08:24:23'),
(186, 'App\\Models\\Users', 1, 'api-user', 'bf0db4a2b5f8a88034831b336c4aab9965949b702be3bdb5e36dc0bef7609715', '[\"*\"]', '2026-05-26 01:27:17', NULL, '2026-05-25 01:28:52', '2026-05-26 01:27:17'),
(187, 'App\\Models\\Users', 1, 'api-user', '4bc289cbe0b0b45270bea4963eb13ed62e1c877b07ad6bb62c420dd6eb13e572', '[\"*\"]', '2026-05-29 02:26:12', NULL, '2026-05-28 01:46:23', '2026-05-29 02:26:12'),
(188, 'App\\Models\\Users', 1, 'api-user', '6064a79237ea66edd024b8f209a2dfb3908676ab128f9e7cd09510ff70ba060d', '[\"*\"]', '2026-05-28 06:52:28', NULL, '2026-05-28 01:53:15', '2026-05-28 06:52:28'),
(189, 'App\\Models\\Users', 1, 'api-user', 'd2642e04ff31e758215870eb925f376e5470dc9a6da51f56f089d63577168431', '[\"*\"]', '2026-05-28 06:52:29', NULL, '2026-05-28 02:20:53', '2026-05-28 06:52:29'),
(190, 'App\\Models\\Users', 1, 'api-user', 'a64f193943217969f47d37ca2072ade0f198e9c77f6f7c16209ba991c1a0e7f9', '[\"*\"]', '2026-05-29 02:52:44', NULL, '2026-05-29 02:52:37', '2026-05-29 02:52:44'),
(191, 'App\\Models\\Users', 1, 'api-user', '1c6d0787951b10717d4c892f1dcde9239f6a71b0d32166ab91773353fba2635f', '[\"*\"]', '2026-05-29 04:07:03', NULL, '2026-05-29 03:39:22', '2026-05-29 04:07:03'),
(192, 'App\\Models\\Users', 1, 'api-user', 'ce59a9b0bbd3ec3ca02a5b7bc3f83ed05d3e8753404bffc63bc21cdbe6db324f', '[\"*\"]', '2026-05-29 04:42:00', NULL, '2026-05-29 04:16:18', '2026-05-29 04:42:00'),
(193, 'App\\Models\\Users', 1, 'api-user', '544b906c4613cec6f1d2d4fd3622b54ad52a60be2b3a50d737da4ff0acde81f8', '[\"*\"]', '2026-05-29 07:02:36', NULL, '2026-05-29 06:34:13', '2026-05-29 07:02:36'),
(194, 'App\\Models\\Users', 1, 'api-user', 'cf3770ccd70292db21e2ec63c74c0bf16f64047e983c484c2563b93c34a14360', '[\"*\"]', '2026-05-29 07:35:00', NULL, '2026-05-29 07:13:28', '2026-05-29 07:35:00'),
(195, 'App\\Models\\Users', 1, 'api-user', '75c188dab3401a8d606f1ef23cebea4a5bdbde868289ae4b3ee198c4263f4cb5', '[\"*\"]', '2026-05-29 07:46:03', NULL, '2026-05-29 07:16:58', '2026-05-29 07:46:03'),
(196, 'App\\Models\\Users', 1, 'api-user', 'd27941bf5b0c8a9d0d82e4e30cb8a524ec89a860a735c9b93b253b0c0be92936', '[\"*\"]', '2026-05-29 07:26:27', NULL, '2026-05-29 07:22:34', '2026-05-29 07:26:27'),
(197, 'App\\Models\\Users', 1, 'api-user', '9983405da17605f03f0e12c4583f73e1e8de0f6aecf497d156f67e2974c8c99a', '[\"*\"]', '2026-05-29 08:30:13', NULL, '2026-05-29 07:46:54', '2026-05-29 08:30:13'),
(198, 'App\\Models\\Users', 1, 'api-user', '6aade3916383fb937b8888898ddb533e1160bbac7c4deff3db1d41167429d41e', '[\"*\"]', '2026-05-29 08:07:30', NULL, '2026-05-29 07:47:39', '2026-05-29 08:07:30'),
(199, 'App\\Models\\Users', 12, 'api-user', 'ccfaf975dcc658ecb78ed7044a5a392ab721a48c7af3af3029dbceedeb652d1f', '[\"*\"]', '2026-05-29 08:08:47', NULL, '2026-05-29 08:08:02', '2026-05-29 08:08:47'),
(200, 'App\\Models\\Users', 11, 'api-user', 'b7499f8022493690412d3fb1a822370c933b090b248fddacaa93fd334d6687cc', '[\"*\"]', '2026-05-29 08:12:11', NULL, '2026-05-29 08:09:10', '2026-05-29 08:12:11'),
(201, 'App\\Models\\Users', 1, 'api-user', 'c24cb0cd48b554078a7940bfe69b41f0e0a032cb3d5b3b036338cf76f85f5f85', '[\"*\"]', '2026-05-29 08:15:21', NULL, '2026-05-29 08:12:48', '2026-05-29 08:15:21'),
(202, 'App\\Models\\Users', 1, 'api-user', '1e0b2dc41e5417b20d7ea07eebc65d5b0b618ff9bed1b7074ff71d7ab65e79c9', '[\"*\"]', '2026-06-02 01:27:38', NULL, '2026-06-02 01:00:40', '2026-06-02 01:27:38'),
(203, 'App\\Models\\Users', 1, 'api-user', 'e1588108f92588ee1ca5bd4a9e8602c8a44b3139f41932e4d3441747d9b81a4b', '[\"*\"]', '2026-06-02 04:05:16', NULL, '2026-06-02 03:59:20', '2026-06-02 04:05:16'),
(204, 'App\\Models\\Users', 1, 'api-user', '22cf13bf740234e197780ebbd5848fba05560479c83a3ffffbd74af4da7a25cf', '[\"*\"]', '2026-06-02 07:21:14', NULL, '2026-06-02 06:22:39', '2026-06-02 07:21:14'),
(205, 'App\\Models\\Users', 1, 'api-user', '27d35c16fc4623e36f4dd3c95f3f295e6109edafcd0ba557382472eb06514a12', '[\"*\"]', '2026-06-02 07:30:40', NULL, '2026-06-02 07:30:30', '2026-06-02 07:30:40'),
(206, 'App\\Models\\Users', 1, 'api-user', '10e855f5a850842879013eb92c095143e38bf8affee4ea2522afafaafd38ffb3', '[\"*\"]', '2026-06-03 08:21:45', NULL, '2026-06-03 08:13:34', '2026-06-03 08:21:45'),
(207, 'App\\Models\\Users', 1, 'api-user', 'c61a664e61b588e716b562beac341cb2aaffea5c8953a404cb3793b02ea9f364', '[\"*\"]', '2026-06-04 01:02:02', NULL, '2026-06-04 00:50:46', '2026-06-04 01:02:02'),
(208, 'App\\Models\\Users', 1, 'api-user', 'bd38497958906d3e98401d2a78348ffd100bfbe43d1e2b2e740dd48c2b5b851b', '[\"*\"]', '2026-06-04 02:29:09', NULL, '2026-06-04 01:59:26', '2026-06-04 02:29:09'),
(209, 'App\\Models\\Users', 1, 'api-user', 'e602abebeda3dfd819d99898b5badf547d2716496374657cfb4eb403c48e9af0', '[\"*\"]', '2026-06-04 02:16:54', NULL, '2026-06-04 02:16:53', '2026-06-04 02:16:54'),
(210, 'App\\Models\\Users', 1, 'api-user', '7598e7e85641c0df7d49597ffa9f44ab78ba42ac82fc947d3f7849b373f83908', '[\"*\"]', '2026-06-04 02:55:14', NULL, '2026-06-04 02:18:50', '2026-06-04 02:55:14'),
(211, 'App\\Models\\Users', 1, 'api-user', '650b2a588e333a209702ba9c7e4bb598705fd031bcc23c7cddf53d8f6dd9bfcb', '[\"*\"]', '2026-06-04 03:37:25', NULL, '2026-06-04 03:12:36', '2026-06-04 03:37:25'),
(212, 'App\\Models\\Users', 1, 'api-user', '45d8df5244668cf2c4df4a938ddc526dee0a411635ca8af3004567667203a652', '[\"*\"]', '2026-06-04 04:11:14', NULL, '2026-06-04 03:37:34', '2026-06-04 04:11:14'),
(213, 'App\\Models\\Users', 1, 'api-user', '12f1b7422b30d912de7a5f40e82bd9f11cc5bdf7a920401470bc91dc0d76c1ec', '[\"*\"]', '2026-06-04 05:32:54', NULL, '2026-06-04 04:39:39', '2026-06-04 05:32:54'),
(214, 'App\\Models\\Users', 1, 'api-user', 'b30f5efa7efe45e23649abdc3a3ace169394ff12c7c8a20e054332a2be53ba77', '[\"*\"]', '2026-06-04 06:15:11', NULL, '2026-06-04 06:06:18', '2026-06-04 06:15:11'),
(215, 'App\\Models\\Users', 1, 'api-user', 'b0db50504d827c7b6378bae0211c931128510cf57bfc621c800ad9620b25fad0', '[\"*\"]', '2026-06-04 08:00:24', NULL, '2026-06-04 07:09:39', '2026-06-04 08:00:24'),
(216, 'App\\Models\\Users', 1, 'api-user', 'eab018899f0a4bdc4358f3498cde78b36b011e05cea6b665757c7da5c7aad738', '[\"*\"]', '2026-06-04 08:21:25', NULL, '2026-06-04 08:15:24', '2026-06-04 08:21:25'),
(217, 'App\\Models\\Users', 1, 'api-user', '3cde7dd362876dc8412681692c2bbae5fd528293ddb8f6020b7eda3db93d7ef2', '[\"*\"]', '2026-06-05 02:08:59', NULL, '2026-06-05 01:14:44', '2026-06-05 02:08:59'),
(218, 'App\\Models\\Users', 1, 'api-user', '5600fa84dec64f1005017847e887184446b00a70bf820a9d7eb936998a64700c', '[\"*\"]', '2026-06-05 02:35:05', NULL, '2026-06-05 02:15:12', '2026-06-05 02:35:05'),
(219, 'App\\Models\\Users', 1, 'api-user', 'ff657d9e632d1032e18b2cc03ce40952d826b0dd9046edfd9a6b00da4d635b51', '[\"*\"]', '2026-06-05 08:02:04', NULL, '2026-06-05 07:37:44', '2026-06-05 08:02:04'),
(220, 'App\\Models\\Users', 1, 'api-user', '6e3f0dc9b01055b556d61f39901512d8f3dd830f5dd9873eec91629cadecc01c', '[\"*\"]', '2026-06-08 07:53:39', NULL, '2026-06-08 07:52:24', '2026-06-08 07:53:39'),
(221, 'App\\Models\\Users', 1, 'carolus-connect', 'f188122c59b00522fd9078ca036a534cbba648c58a8e4559487098b514b8278e', '[\"*\"]', '2026-06-08 08:19:28', NULL, '2026-06-08 07:55:11', '2026-06-08 08:19:28'),
(222, 'App\\Models\\Users', 1, 'api-user', '14e28f15b5a84d3ab427190e2d01d1df5986392b3774a266c79032e05934b1db', '[\"*\"]', '2026-06-09 01:39:28', NULL, '2026-06-09 01:27:01', '2026-06-09 01:39:28'),
(223, 'App\\Models\\Users', 1, 'api-user', '8aaedbd950dfcb2fc8713de922cc7e0f34dd479707d24d7b5227edcdf35437fc', '[\"*\"]', '2026-06-09 04:39:24', NULL, '2026-06-09 04:32:40', '2026-06-09 04:39:24'),
(224, 'App\\Models\\Users', 1, 'api-user', '0e50d4c30a3d1781b38f92414e4b626c25b586a10a022d426b9794f313d93a33', '[\"*\"]', '2026-06-09 08:08:26', NULL, '2026-06-09 08:08:25', '2026-06-09 08:08:26'),
(225, 'App\\Models\\Users', 1, 'api-user', '76f5756e99da0d23eb78d22a5075fe19130960f1367b42959f95e72316271556', '[\"*\"]', '2026-06-10 01:59:41', NULL, '2026-06-10 01:03:55', '2026-06-10 01:59:41'),
(226, 'App\\Models\\Users', 1, 'api-user', '0c082aa4e271d1f6fd84333ae84e7183e14f1ef68875aa928ca5ea9ef9c38d20', '[\"*\"]', '2026-06-10 07:25:39', NULL, '2026-06-10 07:15:15', '2026-06-10 07:25:39'),
(227, 'App\\Models\\Users', 1, 'api-user', '9d2d92d0f8b474f83fb216c4c2d01bb8312182055489de3722050c684d86ff45', '[\"*\"]', '2026-11-05 13:02:40', NULL, '2026-11-05 13:02:36', '2026-11-05 13:02:40'),
(228, 'App\\Models\\Users', 1, 'api-user', '47b4b60394b4c6d324df9ad36f4f799e976154a79becdc2435bbeaad19c4eadb', '[\"*\"]', NULL, NULL, '2026-11-06 03:14:27', '2026-11-06 03:14:27'),
(229, 'App\\Models\\Users', 1, 'api-user', '2683053db9400819c23ac1e19dc1a6c0d05945383e03ea100fccc48fe6d31200', '[\"*\"]', NULL, NULL, '2026-11-06 03:36:08', '2026-11-06 03:36:08'),
(230, 'App\\Models\\Users', 1, 'api-user', '25f15dab8e5c3f3bec7e97bb81d5a34b2fbaf7b0a79bef121365554dedc449bc', '[\"*\"]', '2026-11-06 03:36:34', NULL, '2026-11-06 03:36:23', '2026-11-06 03:36:34'),
(231, 'App\\Models\\Users', 1, 'api-user', 'e3ec1f23f9f62072965f97c667be33d34a899c641a3af5f75580747d2983a5da', '[\"*\"]', '2026-11-20 14:27:06', NULL, '2026-11-20 14:20:27', '2026-11-20 14:27:06'),
(232, 'App\\Models\\Users', 1, 'api-user', '2910ff36cb94c3b1aac3c515b1945f5839c722a2114344409cb956b51c18380b', '[\"*\"]', '2026-11-22 09:10:25', NULL, '2026-11-22 08:46:20', '2026-11-22 09:10:25'),
(233, 'App\\Models\\Users', 1, 'api-user', '2b722c346255063e586183848bfd487f90500259ab03483a87db0e4a4bcc7f45', '[\"*\"]', '2026-11-22 09:18:36', NULL, '2026-11-22 09:15:03', '2026-11-22 09:18:36'),
(234, 'App\\Models\\Users', 1, 'api-user', '5bcd01f2711c8aeb4e39a30a5253783f24d8775aefafb93a1cf6b6d24c3864ac', '[\"*\"]', '2026-11-22 09:32:01', NULL, '2026-11-22 09:29:42', '2026-11-22 09:32:01'),
(235, 'App\\Models\\Users', 14, 'api-user', '1b507b579fa0b023e52a673a8abaefaf8fc5d353a395ca42d0e67c34fc9b5669', '[\"*\"]', '2026-11-22 09:32:38', NULL, '2026-11-22 09:32:12', '2026-11-22 09:32:38'),
(236, 'App\\Models\\Users', 1, 'api-user', '7db1290bbc871088fc3c7a7a54dbc54c1d90bd87bcf91c0d4b8d6897ca7d84e2', '[\"*\"]', '2026-11-22 09:33:05', NULL, '2026-11-22 09:32:57', '2026-11-22 09:33:05'),
(239, 'App\\Models\\Users', 14, 'api-user', 'a9cd2c21cc2abe8fe05e84d8763438efd3f1d19232fc9c2f942975272f2ac392', '[\"*\"]', '2026-11-22 13:45:36', NULL, '2026-11-22 13:45:27', '2026-11-22 13:45:36');

-- --------------------------------------------------------

--
-- Struktur dari tabel `posisi`
--

CREATE TABLE `posisi` (
  `id_posisi` int(11) NOT NULL,
  `nama_posisi` varchar(150) DEFAULT NULL,
  `kode_poli` varchar(10) DEFAULT NULL,
  `jam_operasional` varchar(100) DEFAULT '08:00 - 16:00',
  `lokasi_ruangan` varchar(100) DEFAULT NULL,
  `kuota_harian` int(11) NOT NULL DEFAULT 20,
  `status_poli` enum('Buka','Tutup') NOT NULL DEFAULT 'Buka',
  `kategori_id` int(11) DEFAULT NULL,
  `urutan` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `posisi`
--

INSERT INTO `posisi` (`id_posisi`, `nama_posisi`, `kode_poli`, `jam_operasional`, `lokasi_ruangan`, `kuota_harian`, `status_poli`, `kategori_id`, `urutan`, `created_by`, `created_at`, `updated_by`, `updated_at`, `deleted_by`, `deleted_at`, `is_deleted`) VALUES
(1, 'BANGSAL 1', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 5, NULL, '2026-03-31 20:52:52', 1, '2026-05-29 06:41:01', NULL, NULL, 0),
(2, 'PENYAKIT SYARAF', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 8, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(3, 'BEDAH ORTHOPEDI DAN TRAUMATOLOGI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 3, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(4, 'IGD PAGI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 1, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 06:41:01', NULL, NULL, 0),
(5, 'PENYAKIT JANTUNG DAN PEMBULUH DARAH', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 4, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(6, 'BEDAH ANAK', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 7, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(7, 'IGD SORE', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 2, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 06:41:01', NULL, NULL, 0),
(8, 'PENYAKIT PARU', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 6, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(9, 'BEDAH SYARAF', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 1, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(10, 'IGD MALAM', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 3, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 06:41:01', NULL, NULL, 0),
(11, 'PENYAKIT DALAM KONSULTAN PENCERNAAN HATI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 2, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(12, 'BEDAH MULUT', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 8, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(13, 'ICU', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 4, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 06:41:01', NULL, NULL, 0),
(14, 'PENYAKIT MATA', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 10, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(15, 'BEDAH THORAX', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 4, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(16, 'PENYAKIT DALAM', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 1, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(17, 'TELINGA HIDUNG TENGGOROK (THT-KL)', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 11, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(18, 'BEDAH VASKULER', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 1, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(19, 'PENYAKIT JIWA', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 9, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(20, 'BEDAH DIGESTIF', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 5, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(21, 'ANAK', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 3, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(22, 'ANESTESIOLOGI DAN REANIMASI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 4, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(23, 'BEDAH UROLOGI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 6, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(24, 'BEDAH UMUM', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 3, 2, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 08:13:57', NULL, NULL, 0),
(25, 'KARDIOLOGI - INTERVENSI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 6, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(26, 'BEDAH PLASTIK', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 2, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(27, 'KEBIDANAN DAN PENYAKIT KANDUNGAN', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 7, NULL, '2026-03-31 20:52:52', NULL, '2026-05-29 06:41:01', NULL, NULL, 0),
(28, 'NEUROLOGI - INTERVENSI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 7, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(29, 'RADIOLOGI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 8, NULL, '2026-03-31 20:52:52', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(30, 'Endoskopi', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 5, 1, '2026-05-26 07:48:27', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(31, 'BANGSAL 2', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 1, 6, 1, '2026-05-29 06:40:19', 1, '2026-05-29 06:41:01', NULL, NULL, 0),
(32, 'KARDIOLOGI - KONSUL', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 4, 5, 1, '2026-06-05 01:31:21', NULL, '2026-06-05 02:00:39', NULL, NULL, 0),
(33, 'PENYAKIT DALAM KONSULTAN GASTROENTEROLOGI HEPATOLOGI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 3, 1, '2026-06-05 01:31:21', NULL, '2026-06-05 02:19:21', NULL, NULL, 0),
(34, 'PENYAKIT DALAM KONSULTAN GINJAL DAN HIPERTENSI', NULL, '08:00 - 16:00', NULL, 20, 'Buka', 2, 7, 1, '2026-06-05 01:31:21', NULL, '2026-06-05 02:19:21', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'Super Admin', '2026-04-16 00:48:36', '2026-04-16 00:48:36', NULL, NULL),
(2, 'Admin', '2026-04-16 00:48:36', '2026-04-16 00:48:36', NULL, NULL),
(3, 'Editor', '2026-04-16 00:48:36', '2026-04-16 00:48:36', NULL, NULL),
(4, 'Users', '2026-04-16 00:48:36', '2026-04-23 03:10:08', NULL, 1),
(8, 'Power User', '2026-05-20 07:25:49', '2026-05-20 07:25:49', 10, NULL),
(9, 'ICU', '2026-05-29 04:05:07', '2026-05-29 04:05:07', 1, NULL),
(10, 'IGD', '2026-05-29 04:05:12', '2026-05-29 04:05:12', 1, NULL),
(11, 'Dokter', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL),
(12, 'Pasien', '2026-11-22 06:03:31', '2026-11-22 06:03:31', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `role_permission`
--

CREATE TABLE `role_permission` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `role_permission`
--

INSERT INTO `role_permission` (`role_id`, `permission_id`) VALUES
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 13),
(2, 14),
(2, 15),
(2, 16),
(2, 17),
(2, 18),
(2, 19),
(2, 20),
(2, 21),
(2, 22),
(2, 23),
(2, 24),
(2, 25),
(2, 26),
(2, 27),
(2, 28),
(3, 13),
(3, 14),
(3, 15),
(3, 16),
(3, 17),
(3, 18),
(3, 19),
(3, 20),
(3, 21),
(3, 22),
(3, 23),
(3, 24),
(3, 25),
(3, 26),
(3, 27),
(3, 28),
(4, 13),
(4, 14),
(4, 15),
(4, 16),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(3, 31),
(3, 29),
(3, 30),
(3, 32),
(2, 29),
(2, 30),
(2, 31),
(2, 32),
(1, 44),
(1, 46),
(1, 48),
(1, 49),
(1, 50),
(4, 22),
(4, 26),
(4, 29),
(4, 18),
(3, 57),
(2, 57),
(1, 57),
(1, 52),
(1, 53),
(1, 54),
(1, 55),
(1, 56),
(1, 58),
(1, 59),
(1, 60),
(1, 61),
(1, 62),
(1, 63),
(2, 50),
(2, 49),
(2, 52),
(3, 49),
(3, 50),
(4, 50),
(1, 64),
(2, 64),
(2, 54),
(2, 53),
(2, 56),
(2, 55),
(2, 6),
(2, 5),
(2, 7),
(2, 8),
(2, 60),
(2, 61),
(2, 58),
(2, 10),
(3, 2),
(3, 6),
(1, 65),
(2, 65),
(3, 65),
(1, 2),
(1, 67),
(1, 68),
(1, 69),
(1, 70),
(1, 71),
(2, 67),
(2, 68),
(2, 69),
(2, 70),
(2, 71),
(1, 72),
(4, 30),
(4, 31),
(4, 32),
(1, 73),
(1, 74),
(8, 1),
(9, 13),
(9, 14),
(9, 15),
(9, 16),
(9, 56),
(9, 67),
(10, 13),
(10, 14),
(10, 15),
(10, 16),
(10, 56),
(10, 67),
(9, 18),
(9, 22),
(9, 26),
(9, 50),
(10, 26),
(10, 50),
(10, 18),
(10, 22),
(9, 17),
(9, 21),
(10, 17),
(10, 21),
(1, 1),
(8, 2),
(8, 3),
(8, 4),
(8, 5),
(8, 6),
(8, 7),
(8, 8),
(8, 9),
(8, 10),
(8, 11),
(8, 12),
(8, 13),
(8, 14),
(8, 15),
(8, 16),
(8, 17),
(8, 18),
(8, 19),
(8, 20),
(8, 21),
(8, 22),
(8, 23),
(8, 24),
(8, 25),
(8, 26),
(8, 27),
(8, 28),
(8, 29),
(8, 30),
(8, 31),
(8, 32),
(8, 44),
(8, 46),
(8, 48),
(8, 49),
(8, 50),
(8, 52),
(8, 53),
(8, 54),
(8, 55),
(8, 56),
(8, 57),
(8, 58),
(8, 59),
(8, 60),
(8, 61),
(8, 62),
(8, 63),
(8, 64),
(8, 65),
(8, 67),
(8, 68),
(8, 69),
(8, 70),
(8, 71),
(8, 72),
(8, 73),
(8, 74),
(1, 83),
(2, 83),
(11, 77),
(11, 78),
(11, 80),
(11, 81),
(11, 79),
(11, 82),
(12, 84);

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('AZeESNbYxloWqS2PjZWt2mzt0D10U5mbvjmbp6hZ', NULL, '172.16.152.121', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQllaWEpiVDlNdXFKOHh6a0FaaFpzVmswOUtxM3R6c1JIbEFGWmU4UCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjY6Imh0dHA6Ly8xNzIuMTYuMTUyLjEyMTo4MDAwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1779329809),
('ZoWVEOpIlrwGPkFMdIXN5JXNpqqwB21rRxQvaQ3z', NULL, '172.16.65.172', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQm10dE1zdU8wWGh3U3lkRDloc2REajNlUUlJcmlHN2c5am5xRW52byI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjY6Imh0dHA6Ly8xNzIuMTYuMTUyLjEyMTo4MDAwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1779329818);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `npk` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `npk`, `name`, `username`, `password`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, '0001', 'Admin', 'admin', '$2y$12$vvaNSfjyy2e4xuMtDZCuj.jPFpbldNnX5r.p9yz7z9AVGwpVQYx/.', 'active', NULL, '2026-04-16 18:32:02', '2026-05-20 04:33:02'),
(4, NULL, 'Users', 'users', '$2y$12$JvXuOadwGVrDd4K.sPYjsO18X7ONTvSgLX2cCVxNgIS2fdNKNbG7C', 'active', NULL, '2026-04-16 21:54:43', '2026-04-29 04:43:55'),
(5, NULL, 'Editor', 'editor', '$2y$12$67IQtsWiCgkfHeU5PxCd0O8acNBxBQcO2amCVZVvtAbdAL5molxMe', 'active', NULL, '2026-04-16 22:01:42', '2026-05-04 04:52:51'),
(7, '123', 'HansV', 'HansV', '$2y$12$Vq/fPUbo6iUzhl7T7CA83eNHDO04U6D4AObKEuA5UTT.2rs3IFhX2', 'active', NULL, '2026-04-23 03:43:04', '2026-05-04 04:53:02'),
(10, '5103', 'Martinus Harry', '5103', '$2y$12$DfiwE9bCCxL0SE3RfdQpnOw6WqzZykgYGlvepVVhNQR4HzSzkeYQq', 'active', NULL, '2026-05-20 07:24:43', '2026-05-20 07:24:43'),
(11, NULL, 'IGD', 'IGD 01', '$2y$12$sr5uEcgVEZJGMPbwHr2nh.fZj7iyml/RF11zlWH8vQDlFzrrMU1qu', 'active', NULL, '2026-05-29 07:47:45', '2026-05-29 07:47:45'),
(12, NULL, 'ICU', 'ICU 01', '$2y$12$UCn0NxlxY7fgt.L5cQ9S/.rX02mRhFggRi.ijwCLfkI92C3uYxV0.', 'active', NULL, '2026-05-29 07:48:06', '2026-05-29 07:48:06'),
(13, '5742', 'Nova', 'Nova', '$2y$12$BOen9iRbU8laW3dME8iR.OKcui5W0Xub824vtpzsvazfA/vQwtY2q', 'active', NULL, '2026-06-08 08:19:19', '2026-06-08 08:19:19'),
(14, NULL, 'Hans', 'HaVal', '$2y$12$5alHXJzZ3MJF5zal/aRgAeYA9ryTem6brZS4D.Yoq2DVZ1Xt2M3a6', 'active', NULL, '2026-11-22 09:18:31', '2026-11-22 09:31:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_permission`
--

CREATE TABLE `user_permission` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_permission`
--

INSERT INTO `user_permission` (`user_id`, `permission_id`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL),
(1, 2, NULL, NULL),
(1, 3, NULL, NULL),
(1, 4, NULL, NULL),
(1, 5, NULL, NULL),
(1, 6, NULL, NULL),
(1, 7, NULL, NULL),
(1, 8, NULL, NULL),
(1, 9, NULL, NULL),
(1, 10, NULL, NULL),
(1, 11, NULL, NULL),
(1, 12, NULL, NULL),
(1, 13, NULL, NULL),
(1, 14, NULL, NULL),
(1, 15, NULL, NULL),
(1, 16, NULL, NULL),
(1, 17, NULL, NULL),
(1, 18, NULL, NULL),
(1, 19, NULL, NULL),
(1, 20, NULL, NULL),
(1, 21, NULL, NULL),
(1, 22, NULL, NULL),
(1, 23, NULL, NULL),
(1, 24, NULL, NULL),
(1, 25, NULL, NULL),
(1, 26, NULL, NULL),
(1, 27, NULL, NULL),
(1, 28, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_role`
--

CREATE TABLE `user_role` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_role`
--

INSERT INTO `user_role` (`user_id`, `role_id`, `created_at`, `updated_at`) VALUES
(5, 3, NULL, NULL),
(5, 2, NULL, NULL),
(4, 4, NULL, NULL),
(7, 1, NULL, NULL),
(1, 1, NULL, NULL),
(10, 8, NULL, NULL),
(11, 10, NULL, NULL),
(12, 9, NULL, NULL),
(13, 2, NULL, NULL),
(13, 1, NULL, NULL),
(14, 11, NULL, NULL);

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `absensi_dokter`
--
ALTER TABLE `absensi_dokter`
  ADD PRIMARY KEY (`id_absensi`),
  ADD UNIQUE KEY `uk_absensi_jadwal_dokter` (`jadwal_id`,`id_paramedic`),
  ADD KEY `fk_absensi_paramedic` (`id_paramedic`);

--
-- Indeks untuk tabel `bagian_paramedic`
--
ALTER TABLE `bagian_paramedic`
  ADD PRIMARY KEY (`id_bagian_paramedic`),
  ADD KEY `fk_bagian_paramedic_paramedic` (`id_paramedic`),
  ADD KEY `fk_bagian_paramedic_spesialis` (`id_posisi`);

--
-- Indeks untuk tabel `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indeks untuk tabel `import_logs`
--
ALTER TABLE `import_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `import_templates`
--
ALTER TABLE `import_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_jadwal_bagian_paramedic` (`id_bagian_paramedic`);

--
-- Indeks untuk tabel `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indeks untuk tabel `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `kategori_posisi`
--
ALTER TABLE `kategori_posisi`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `konsultasi_medis`
--
ALTER TABLE `konsultasi_medis`
  ADD PRIMARY KEY (`id_konsultasi`),
  ADD UNIQUE KEY `id_pendaftaran` (`id_pendaftaran`),
  ADD KEY `fk_konsul_paramedic` (`id_paramedic`),
  ADD KEY `fk_konsul_pasien` (`id_pasien`);

--
-- Indeks untuk tabel `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menus_parent_id_foreign` (`parent_id`);

--
-- Indeks untuk tabel `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `paramedic`
--
ALTER TABLE `paramedic`
  ADD PRIMARY KEY (`id_paramedic`),
  ADD UNIQUE KEY `npk` (`npk`),
  ADD KEY `fk_paramedic_user` (`user_id`);

--
-- Indeks untuk tabel `pasien`
--
ALTER TABLE `pasien`
  ADD PRIMARY KEY (`id_pasien`),
  ADD UNIQUE KEY `no_rm` (`no_rm`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `fk_pasien_user` (`user_id`);

--
-- Indeks untuk tabel `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`username`);

--
-- Indeks untuk tabel `penanggung_jawab`
--
ALTER TABLE `penanggung_jawab`
  ADD PRIMARY KEY (`id_penanggung_jawab`),
  ADD KEY `fk_pj_perawat` (`id_perawat`),
  ADD KEY `fk_pj_kepala` (`id_kepala_jaga`),
  ADD KEY `fk_pj_ponek` (`id_ponek`);

--
-- Indeks untuk tabel `pendaftaran_konsultasi`
--
ALTER TABLE `pendaftaran_konsultasi`
  ADD PRIMARY KEY (`id_pendaftaran`),
  ADD UNIQUE KEY `kode_booking` (`kode_booking`),
  ADD UNIQUE KEY `uk_pasien_jadwal` (`id_pasien`,`jadwal_id`),
  ADD KEY `fk_daftar_jadwal` (`jadwal_id`);

--
-- Indeks untuk tabel `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_permission_name` (`permission_name`),
  ADD KEY `idx_permission_name` (`permission_name`);

--
-- Indeks untuk tabel `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indeks untuk tabel `posisi`
--
ALTER TABLE `posisi`
  ADD PRIMARY KEY (`id_posisi`),
  ADD UNIQUE KEY `unique_kategori_urutan` (`kategori_id`,`urutan`),
  ADD KEY `idx_kategori_urutan` (`kategori_id`,`urutan`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `role_permission`
--
ALTER TABLE `role_permission`
  ADD KEY `role_permission_role_id_foreign` (`role_id`),
  ADD KEY `role_permission_permission_id_foreign` (`permission_id`);

--
-- Indeks untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_npk_unique` (`npk`);

--
-- Indeks untuk tabel `user_permission`
--
ALTER TABLE `user_permission`
  ADD KEY `user_permission_permission_id_foreign` (`permission_id`),
  ADD KEY `user_permission_user_id_foreign` (`user_id`);

--
-- Indeks untuk tabel `user_role`
--
ALTER TABLE `user_role`
  ADD KEY `user_role_user_id_foreign` (`user_id`),
  ADD KEY `user_role_role_id_foreign` (`role_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `absensi_dokter`
--
ALTER TABLE `absensi_dokter`
  MODIFY `id_absensi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `bagian_paramedic`
--
ALTER TABLE `bagian_paramedic`
  MODIFY `id_bagian_paramedic` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `import_logs`
--
ALTER TABLE `import_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `import_templates`
--
ALTER TABLE `import_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=607;

--
-- AUTO_INCREMENT untuk tabel `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `kategori_posisi`
--
ALTER TABLE `kategori_posisi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `konsultasi_medis`
--
ALTER TABLE `konsultasi_medis`
  MODIFY `id_konsultasi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `paramedic`
--
ALTER TABLE `paramedic`
  MODIFY `id_paramedic` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT untuk tabel `pasien`
--
ALTER TABLE `pasien`
  MODIFY `id_pasien` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `penanggung_jawab`
--
ALTER TABLE `penanggung_jawab`
  MODIFY `id_penanggung_jawab` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pendaftaran_konsultasi`
--
ALTER TABLE `pendaftaran_konsultasi`
  MODIFY `id_pendaftaran` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT untuk tabel `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=240;

--
-- AUTO_INCREMENT untuk tabel `posisi`
--
ALTER TABLE `posisi`
  MODIFY `id_posisi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `absensi_dokter`
--
ALTER TABLE `absensi_dokter`
  ADD CONSTRAINT `fk_absensi_jadwal` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_absensi_paramedic` FOREIGN KEY (`id_paramedic`) REFERENCES `paramedic` (`id_paramedic`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `bagian_paramedic`
--
ALTER TABLE `bagian_paramedic`
  ADD CONSTRAINT `fk_bagian_paramedic_paramedic` FOREIGN KEY (`id_paramedic`) REFERENCES `paramedic` (`id_paramedic`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bagian_paramedic_spesialis` FOREIGN KEY (`id_posisi`) REFERENCES `posisi` (`id_posisi`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  ADD CONSTRAINT `fk_jadwal_bagian_paramedic` FOREIGN KEY (`id_bagian_paramedic`) REFERENCES `bagian_paramedic` (`id_bagian_paramedic`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `konsultasi_medis`
--
ALTER TABLE `konsultasi_medis`
  ADD CONSTRAINT `fk_konsul_paramedic` FOREIGN KEY (`id_paramedic`) REFERENCES `paramedic` (`id_paramedic`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_konsul_pasien` FOREIGN KEY (`id_pasien`) REFERENCES `pasien` (`id_pasien`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_konsul_pendaftaran` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran_konsultasi` (`id_pendaftaran`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `paramedic`
--
ALTER TABLE `paramedic`
  ADD CONSTRAINT `fk_paramedic_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pasien`
--
ALTER TABLE `pasien`
  ADD CONSTRAINT `fk_pasien_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `penanggung_jawab`
--
ALTER TABLE `penanggung_jawab`
  ADD CONSTRAINT `fk_pj_kepala` FOREIGN KEY (`id_kepala_jaga`) REFERENCES `paramedic` (`id_paramedic`),
  ADD CONSTRAINT `fk_pj_perawat` FOREIGN KEY (`id_perawat`) REFERENCES `paramedic` (`id_paramedic`),
  ADD CONSTRAINT `fk_pj_ponek` FOREIGN KEY (`id_ponek`) REFERENCES `paramedic` (`id_paramedic`);

--
-- Ketidakleluasaan untuk tabel `pendaftaran_konsultasi`
--
ALTER TABLE `pendaftaran_konsultasi`
  ADD CONSTRAINT `fk_daftar_jadwal` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_daftar_pasien` FOREIGN KEY (`id_pasien`) REFERENCES `pasien` (`id_pasien`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `posisi`
--
ALTER TABLE `posisi`
  ADD CONSTRAINT `fk_spesialis_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_posisi` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_permission`
--
ALTER TABLE `user_permission`
  ADD CONSTRAINT `user_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permission_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `user_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_role_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
