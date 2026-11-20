<?php
// app/Services/ExcelImportService.php
namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Paramedic;
use App\Models\Posisi;
use App\Models\BagianParamedic;
use App\Models\Jadwal;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use PhpOffice\PhpSpreadsheet\Writer\Csv as WriterCsv;

class ExcelImportService
{

    /**
     * Load spreadsheet dengan deteksi delimiter untuk CSV.
     */
    private function loadSpreadsheet(string $filePath): \PhpOffice\PhpSpreadsheet\Spreadsheet
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if ($extension === 'csv') {
            $reader = new Csv();
            // Deteksi delimiter dari 3 baris pertama
            $handle = fopen($filePath, 'r');
            if ($handle) {
                $delimiters = [",", "\t", ";", "|"];
                $maxCount = 0;
                $bestDelimiter = ",";

                for ($i = 0; $i < 3 && !feof($handle); $i++) {
                    $line = fgets($handle);
                    if ($line === false) break;
                    foreach ($delimiters as $delim) {
                        $count = substr_count($line, $delim);
                        if ($count > $maxCount) {
                            $maxCount = $count;
                            $bestDelimiter = $delim;
                        }
                    }
                }
                fclose($handle);
                $reader->setDelimiter($bestDelimiter);
            }
            return $reader->load($filePath);
        }

        return IOFactory::load($filePath);
    }

    /**
     * Mendapatkan pratinjau sheet dari file Excel (header + 5 baris pertama).
     */
    public function previewJadwal(string $filePath, array $mapping, int $sheetIndex = 0, int $headerRow = 1): array
    {
        try {
            $spreadsheet = $this->loadSpreadsheet($filePath);
            $sheet = $spreadsheet->getSheet($sheetIndex) ?? $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
        } catch (\Exception $e) {
            throw new \Exception('File tidak dapat dibaca: ' . $e->getMessage());
        }

        if (empty($rows) || count($rows) <= $headerRow) {
            return [
                'preview_rows' => [],
                'conflict_posisi' => [],
                'conflict_paramedic' => [],
                'total_rows' => 0
            ];
        }

        // Ambil urutan kolom dari konfig mapping template (Sesuai Export Template Jadwal)
        $posisiCols = $mapping['posisi']['column_indices'] ?? [1];
        $paramedicCols = $mapping['paramedic']['column_indices'] ?? [2];
        $peranCols      = $mapping['peran']['column_indices'] ?? [3];
        $tipeJagaCols   = $mapping['tipe_jaga']['column_indices'] ?? [4];
        $keteranganCols = $mapping['keterangan']['column_indices'] ?? [5];

        $previewRows = [];
        $allposisiNames = [];
        $allParamedicNames = [];
        $totalRows = 0;

        for ($i = $headerRow; $i < count($rows); $i++) {
            $row = $rows[$i];

            // Abaikan jika baris kosong
            $posisiVal = trim((string)($row[$posisiCols[0]] ?? ''));
            $paramedicVal = trim((string)($row[$paramedicCols[0]] ?? ''));

            // Lewati jika kedua sel inti kosong
            if ($posisiVal === '' && $paramedicVal === '') {
                continue;
            }

            $totalRows++;

            $posisiRaw = trim((string)($row[$posisiCols[0]] ?? ''));
            $paramedicRaw = trim((string)($row[$paramedicCols[0]] ?? ''));
            $peranRaw     = trim((string)($row[$peranCols[0]] ?? '-'));
            $tipeJagaRaw  = trim((string)($row[$tipeJagaCols[0]] ?? '-'));
            $keterangan   = trim((string)($row[$keteranganCols[0]] ?? ''));

            if ($posisiRaw !== '') $allposisiNames[] = $posisiRaw;
            if ($paramedicRaw !== '') $allParamedicNames[] = $paramedicRaw;

            // Generate tanggal contoh menggunakan resolver asli milik Anda
            $resolvedDates = $this->resolveTanggal($mapping, $row);
            $tanggalPreview = $resolvedDates ? implode(', ', $resolvedDates) : trim((string)($row[$mapping['tanggal']['column_indices'][0] ?? 0] ?? ''));

            if (count($previewRows) < 10) {
                $posisiObj = $this->resolveposisiByName($posisiRaw, []);
                $paramedicObj = $this->resolveParamedicByName($paramedicRaw, []);

                $isValid = true;
                $note = 'Valid';

                if (!$resolvedDates) {
                    $isValid = false;
                    $note = 'Format Tanggal tidak valid.';
                } elseif (!$posisiObj) {
                    $isValid = false;
                    $note = "posisi '{$posisiRaw}' memerlukan resolusi konflik.";
                } elseif (!$paramedicObj) {
                    $isValid = false;
                    $note = "Paramedic '{$paramedicRaw}' memerlukan resolusi konflik.";
                }

                $previewRows[] = [
                    'row'            => $i + 1,
                    'tanggal'        => $tanggalPreview,
                    'nama_posisi' => $posisiRaw,
                    'nama_paramedic' => $paramedicRaw,
                    'peran'          => $peranRaw,
                    'tipe_jaga'      => $tipeJagaRaw,
                    'keterangan'     => $keterangan,
                    'is_valid'       => $isValid,
                    'note'           => $note
                ];
            }
        }

        // Cari keunikan nama yang tidak ditemukan di DB untuk dilempar ke Front-end conflict wizard
        $conflictposisi = [];
        foreach (array_unique($allposisiNames) as $name) {
            if (is_null($this->resolveposisiByName($name, []))) {
                $conflictposisi[] = $name;
            }
        }

        $conflictParamedic = [];
        foreach (array_unique($allParamedicNames) as $name) {
            if (is_null($this->resolveParamedicByName($name, []))) {
                $conflictParamedic[] = $name;
            }
        }

        return [
            'headers'            => array_slice($rows[$headerRow - 1], 0, 6),
            'preview_rows'       => $previewRows,
            'conflict_posisi' => $conflictposisi,
            'conflict_paramedic' => $conflictParamedic,
            'total_rows'         => $totalRows
        ];
    }

    /**
     * Proses import jadwal berdasarkan mapping dan resolusi konflik.
     */
    public function processJadwalWithConflicts(string $filePath, array $mapping, int $sheetIndex, int $headerRow, array $conflictposisi, array $conflictParamedic)
    {
        $spreadsheet = $this->loadSpreadsheet($filePath);
        $sheet = $spreadsheet->getSheet($sheetIndex) ?? $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        DB::beginTransaction();
        $inserted = 0;
        $skipped = 0;
        $errors = [];
        $skippedDetails = [];
        $userId = Auth::id() ?? 0;

        if (empty($rows) || count($rows) <= $headerRow) {
            return ['success' => false, 'message' => 'Tidak ada data untuk diproses.', 'inserted' => 0, 'skipped' => 0, 'errors' => []];
        }

        $posisiCols = $mapping['posisi']['column_indices'] ?? [1];
        $paramedicCols = $mapping['paramedic']['column_indices'] ?? [2];
        $peranCols      = $mapping['peran']['column_indices'] ?? [3];
        $tipeJagaCols   = $mapping['tipe_jaga']['column_indices'] ?? [4];
        $keteranganCols = $mapping['keterangan']['column_indices'] ?? [5];

        try {
            for ($i = $headerRow; $i < count($rows); $i++) {
                $row = $rows[$i];

                $posisiRaw = trim((string)($row[$posisiCols[0]] ?? ''));
                $paramedicRaw = trim((string)($row[$paramedicCols[0]] ?? ''));
                $peranRaw     = trim((string)($row[$peranCols[0]] ?? '-'));
                $tipeJagaRaw  = trim((string)($row[$tipeJagaCols[0]] ?? '-'));
                $keterangan   = trim((string)($row[$keteranganCols[0]] ?? ''));

                if ($posisiRaw === '' && $paramedicRaw === '') {
                    continue;
                }

                // 1. Ambil array tanggal menggunakan fungsi resolveTanggal bawaan Anda
                $dates = $this->resolveTanggal($mapping, $row);
                if (!$dates) {
                    $errors[] = "Baris " . ($i + 1) . ": Format tanggal tidak valid.";
                    continue;
                }

                // 2. Ambil model posisi berdasarkan nama / conflictMap
                $posisiObj = $this->resolveposisiByName($posisiRaw, $conflictposisi);
                if (!$posisiObj) {
                    $errors[] = "Baris " . ($i + 1) . ": posisi '{$posisiRaw}' tidak ditemukan.";
                    continue;
                }

                // 3. Ambil model Paramedic berdasarkan nama / conflictMap
                $paramedicObj = $this->resolveParamedicByName($paramedicRaw, $conflictParamedic);
                if (!$paramedicObj) {
                    $errors[] = "Baris " . ($i + 1) . ": Paramedic '{$paramedicRaw}' tidak ditemukan.";
                    continue;
                }

                // 4. Hubungkan Paramedic dan posisi pada tabel pivot `bagian_paramedic` jika belum ada
                $bagianParamedic = DB::table('bagian_paramedic')
                    ->where('id_paramedic', $paramedicObj->id_paramedic)
                    ->where('id_posisi', $posisiObj->id_posisi)
                    ->where('is_deleted', 0)
                    ->first();

                if ($bagianParamedic) {
                    $idBagianParamedic = $bagianParamedic->id_bagian_paramedic;
                } else {
                    $idBagianParamedic = DB::table('bagian_paramedic')->insertGetId([
                        'id_paramedic' => $paramedicObj->id_paramedic,
                        'id_posisi' => $posisiObj->id_posisi,
                        'created_by'   => $userId,
                        'created_at'   => now(),
                        'is_deleted'   => 0
                    ]);
                }

                // 5. Validasi Aturan Nilai Enum Sesuai Database / JadwalController
                $peranFinal = in_array($peranRaw, ['Utama', 'Backup 1', 'Backup 2', 'Backup 3', '-']) ? $peranRaw : '-';
                $tipeFinal  = in_array($tipeJagaRaw, ['Oncall', 'Onsite Pagi', 'Onsite Malam', '-']) ? $tipeJagaRaw : '-';

                // 6. Simpan baris jadwal ke database
                foreach ($dates as $tanggalStr) {
                    $exists = DB::table('jadwal')
                        ->where('tanggal', $tanggalStr)
                        ->where('id_bagian_paramedic', $idBagianParamedic)
                        ->where('peran', $peranFinal)
                        ->where('tipe_jaga', $tipeFinal)
                        ->where('is_deleted', 0)
                        ->exists();

                    if ($exists) {
                        $skipped++;
                        $skippedDetails[] = "Baris " . ($i + 1) . ": Duplikat – {$paramedicRaw} di posisi {$posisiRaw} pada tanggal {$tanggalStr}";
                        continue;
                    }

                    DB::table('jadwal')->insert([
                        'tanggal'             => $tanggalStr,
                        'id_bagian_paramedic' => $idBagianParamedic,
                        'peran'               => $peranFinal,
                        'tipe_jaga'           => $tipeFinal,
                        'keterangan'          => $keterangan ?: null,
                        'created_by'          => $userId,
                        'created_at'          => now(),
                        'is_deleted'          => 0
                    ]);
                    $inserted++;
                }
            }

            DB::commit();
            return [
                'success'  => true,
                'inserted' => $inserted,
                'skipped'  => $skipped,
                'errors'   => $errors,
                'skipped_details' => $skippedDetails,
                'message'  => "Berhasil memproses jadwal: {$inserted} disimpan, {$skipped} dilewati.",
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Gagal memproses baris berkas import: ' . $e->getMessage(),
                'inserted' => 0,
                'skipped' => 0,
                'errors' => [$e->getMessage()]
            ];
        }
    }


    /**
     * Resolve posisi dari mapping (manual atau kolom).
     */
    private function resolveposisi(array $mapping, array $row, array $conflictMap): ?posisi
    {
        $specConfig = $mapping['posisi'] ?? [];

        // ==================== MODE MANUAL ====================
        if (($specConfig['source'] ?? '') === 'manual') {
            $input = trim($specConfig['value'] ?? '');
            if (empty($input)) return null;

            // 1. Coba cari berdasarkan kode_posisi
            $posisi = Posisi::where('kode_posisi', $input)
                        ->where('is_deleted', 0)->first();

            // 2. Jika tidak ada, cari berdasarkan nama_posisi
            if (!$posisi) {
                $posisi = Posisi::where('nama_posisi', $input)
                            ->where('is_deleted', 0)->first();
            }

            // 3. Jika tetap tidak ditemukan, gunakan resolusi konflik
            if (!$posisi) {
                if (isset($conflictMap[$input]) && $conflictMap[$input] === 'create') {
                    // Buat posisi baru (nama sebagai kode sementara)
                    $kode = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $input));
                    $kode = substr($kode, 0, 10);
                    $posisi = posisi::create([
                        'kode_posisi' => $kode,
                        'nama_posisi' => $input,
                        'kategori_id'    => null,
                        'urutan'         => 0,
                        'created_by'     => Auth::id() ?? 1,
                        'created_at'     => now(),
                    ]);
                } elseif (is_numeric($conflictMap[$input] ?? null)) {
                    $posisi = posisi::find($conflictMap[$input]);
                }
            }
            return $posisi;
        }

        // ==================== MODE KOLOM (dari file Excel) ====================
        $col = $specConfig['column_index'] ?? 0;
        $kode = trim($row[$col] ?? '');
        if (empty($kode)) return null;

        // Cari berdasarkan kode_posisi
        $posisi = Posisi::where('kode_posisi', $kode)
                    ->where('is_deleted', 0)->first();

        // Fallback: Jika tidak ketemu lewat kode, coba cari berdasarkan nama_posisi
        if (!$posisi) {
            $posisi = Posisi::where('nama_posisi', $kode)
                        ->where('is_deleted', 0)->first();
        }

        if (!$posisi) {
            if (isset($conflictMap[$kode]) && $conflictMap[$kode] === 'create') {
                $kodeBaru = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $kode));
                $kodeBaru = substr($kodeBaru, 0, 10);
                $posisi = posisi::create([
                    'kode_posisi' => $kodeBaru ?: 'SPEC_NEW',
                    'nama_posisi' => $kode,
                    'kategori_id'    => null,
                    'urutan'         => 0,
                    'created_by'     => Auth::id() ?? 1,
                    'created_at'     => now(),
                ]);
            } elseif (is_numeric($conflictMap[$kode] ?? null)) {
                $posisi = posisi::find($conflictMap[$kode]);
            }
        }
        return $posisi;
    }

    /**
     * Pendekatan loose matching untuk pencarian ID posisi
     */
    private function findposisiId(string $nama): ?int
    {
        $nama = trim($nama);
        if ($nama === '') return null;

        $exact = DB::table('posisi')->where('is_deleted', 0)->whereRaw('LOWER(nama_posisi) = ?', [strtolower($nama)])->first();
        if ($exact) return $exact->id_posisi;

        $likeResults = DB::table('posisi')->where('is_deleted', 0)->whereRaw('LOWER(nama_posisi) LIKE ?', ['%' . strtolower($nama) . '%'])->get();
        if ($likeResults->count() === 1) return $likeResults->first()->id_posisi;

        return null;
    }

    /**
     * Pendekatan loose matching untuk pencarian ID Paramedic
     */
    private function findParamedicId(string $nama): ?int
    {
        $nama = trim($nama);
        if ($nama === '') return null;

        $exact = DB::table('paramedic')->where('is_deleted', 0)->whereRaw('LOWER(nama_paramedic) = ?', [strtolower($nama)])->first();
        if ($exact) return $exact->id_paramedic;

        $likeResults = DB::table('paramedic')->where('is_deleted', 0)->whereRaw('LOWER(nama_paramedic) LIKE ?', ['%' . strtolower($nama) . '%'])->get();
        if ($likeResults->count() === 1) return $likeResults->first()->id_paramedic;

        return null;
    }

    /**
     * Resolve paramedic berdasarkan nama
     */
    private function resolveParamedicByName(string $nama, array $conflictMap): ?Paramedic
    {
        $nama = trim($nama);
        if (empty($nama)) return null;

        // 1. Cari di database
        $paramedic = Paramedic::where('nama_paramedic', $nama)
                        ->where('is_deleted', 0)
                        ->first();

        if ($paramedic) {
            return $paramedic;
        }

        // 2. Tidak ditemukan → periksa conflictMap
        if (isset($conflictMap[$nama])) {
            $value = $conflictMap[$nama];

            // a. Buat baru
            if ($value === 'create') {
                $paramedic = Paramedic::create([
                    'nama_paramedic' => $nama,
                    'created_by'     => Auth::id() ?? 1,
                    'created_at'     => now(),
                ]);
                return $paramedic;
            }

            // b. Mapping ke ID numeric
            if (is_numeric($value)) {
                $paramedic = Paramedic::where('id_paramedic', $value)
                                ->where('is_deleted', 0)
                                ->first();
                return $paramedic;
            }
        }

        return null;
    }

    /**
     * Resolve posisi berdasarkan Nama sesuai instruksi
     */
    private function resolveposisiByName(string $nama, array $conflictMap): ?Posisi
    {
        $nama = trim($nama);
        if (empty($nama)) return null;

        // 1. Cari di database
        $posisi = Posisi::where('nama_posisi', $nama)
                    ->where('is_deleted', 0)
                    ->first();

        if ($posisi) {
            return $posisi;
        }

        // 2. Tidak ditemukan → periksa conflictMap
        if (isset($conflictMap[$nama])) {
            $value = $conflictMap[$nama];

            // a. Buat baru
            if ($value === 'create') {
                $posisi = Posisi::create([
                    'nama_posisi' => $nama,
                    'kategori_id'    => null,
                    'urutan'         => 0,
                    'created_by'     => Auth::id() ?? 1,
                    'created_at'     => now(),
                ]);
                return $posisi;
            }

            // b. Mapping ke ID numeric (ID dari master)
            if (is_numeric($value)) {
                $posisi = Posisi::where('id_posisi', $value)
                            ->where('is_deleted', 0)
                            ->first();
                return $posisi;
            }
        }

        return null;
    }


    /**
     * Resolve tanggal: bisa tunggal atau range, auto detect dari ada/tidaknya '-'
     * @return array|null Array of dates (Y-m-d) atau null jika gagal
     */
    private function resolveTanggal(array $mapping, array $row): ?array
    {
        $tglConfig = $mapping['tanggal'] ?? [];
        $columns = $tglConfig['column_indices'] ?? [];
        if (empty($columns)) return null;
    
        $rawValue = trim($row[$columns[0]] ?? '');
        if ($rawValue === '') return null;
    
        // 1. Deteksi rentang dengan pola Indonesia: "22/04-24/04/2026", "22/04-24/04 2026", "22/04-24/04"
        if (preg_match('#^(\d{1,2}[\/\-]\d{1,2})\s*-\s*(\d{1,2}[\/\-]\d{1,2})(?:\s*\/?\s*(\d{4}))?$#', $rawValue, $matches)) {
            $startRaw = $matches[1];
            $endRaw   = $matches[2];
            $year     = $matches[3] ?? null;
    
            if (!$year) {
                $yearColumn = $tglConfig['tahun_column_index'] ?? null;
                $year = $yearColumn !== null ? trim($row[$yearColumn] ?? '') : null;
            }
            $year = $year ?: date('Y');
    
            return $this->parseDateRangeIndonesian($startRaw, $endRaw, $year);
        }
    
        // 2. Jika bukan rentang, anggap sebagai tanggal tunggal
        $tanggal = $this->parseSingleDateIndonesian($rawValue, $tglConfig, $row);
        return $tanggal ? [$tanggal] : null;
    }


    /**
     * Parse tanggal tunggal dengan format Indonesia:
     * - DD-MM-YYYY, DD/MM/YYYY, DD-MM, DD/MM (tanpa tahun → tahun sekarang)
     */
    private function parseSingleDateIndonesian(string $rawValue, array $tglConfig, array $row): ?string
    {
        $rawValue = trim($rawValue);
        if (empty($rawValue)) return null;

        // Daftar format yang didukung (tambah Y-m-d sebagai fallback)
        $formats = ['d/m/Y', 'd-m-Y', 'd/m', 'd-m', 'Y-m-d'];

        $yearColumn = $tglConfig['tahun_column_index'] ?? null;
        $yearFromCol = $yearColumn !== null ? trim($row[$yearColumn] ?? '') : null;

        foreach ($formats as $fmt) {
            try {
                $date = Carbon::createFromFormat($fmt, $rawValue);
            } catch (\Exception $e) {
                continue;
            }

            if (in_array($fmt, ['d/m', 'd-m'])) {
                $year = $yearFromCol ?: date('Y');
                $date->year((int)$year);
            }
            // Jika format Y-m-d, tidak perlu ubah tahun

            return $date->format('Y-m-d');
        }

        return null;
    }

    /**
     * Parse rentang tanggal Indonesia: startRaw dan endRaw sudah bagian tanggal (dengan/tanpa tahun),
     * year sudah ditentukan.
     */
    private function parseDateRangeIndonesian(string $startRaw, string $endRaw, string $year): ?array
    {
        $startDate = $this->parseDatePart($startRaw, $year);
        $endDate   = $this->parseDatePart($endRaw, $year);

        if (!$startDate || !$endDate) return null;

        return $this->generateDateRange($startDate, $endDate);
    }

    /**
     * Parse satu bagian tanggal (bisa "d/m", "d-m", "d/m/Y", "d-m-Y").
     * Jika tidak ada tahun, gunakan $year.
     */
    private function parseDatePart(string $part, string $year): ?Carbon
    {
        $part = trim($part);
        if (empty($part)) return null;

        $formats = ['d/m/Y', 'd-m-Y', 'd/m', 'd-m'];
        foreach ($formats as $fmt) {
            try {
                $date = Carbon::createFromFormat($fmt, $part);
            } catch (\Exception $e) {
                continue;
            }

            if (in_array($fmt, ['d/m', 'd-m'])) {
                $date->year((int)$year);
            }
            return $date;
        }

        return null;
    }


    /* *
     * Parse tanggal tunggal dari berbagai format
     */
    /* private function parseSingleDate(string $rawValue, array $tglConfig, array $row): ?string
    {
        // Format yang didukung (tambah MM/DD/YYYY)
        $formats = [
            'Y-m-d', 'd/m/Y', 'd-m-Y', 'm/d/Y', 'n/j/Y',
            'd/m/y', 'd-m-y', 'm/d/y', 'n/j/y',
            'd M Y', 'd F Y'
        ];

        $yearColumn = $tglConfig['tahun_column_index'] ?? null;
        $year = $yearColumn !== null ? trim($row[$yearColumn] ?? '') : null;

        foreach ($formats as $fmt) {
            try {
                $date = Carbon::createFromFormat($fmt, $rawValue);
                if ($year && strlen($year) === 4) {
                    $date->year((int)$year);
                }
                return $date->format('Y-m-d');
            } catch (\Exception $e) {}
        }

        // Fallback
        try {
            $date = Carbon::parse($rawValue);
            if ($year && strlen($year) === 4) {
                $date->year((int)$year);
            }
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    } */

    /**
     * Parse rentang tanggal, format: "22/04-24/04" atau "22/04/2026-24/04/2026" atau "22-04-2026/24-04-2026"
     */
    /* private function parseDateRange(string $rawValue, array $tglConfig, array $row): ?array
    {
        $rawValue = trim($rawValue);
        $year = null;

        // Cari tahun di akhir: "22/04-24/04 2026" atau "22/04-24/04/2026"
        if (preg_match('/\s(\d{4})$/', $rawValue, $m)) {
            $year = $m[1];
            $rawValue = preg_replace('/\s\d{4}$/', '', $rawValue);
        } elseif (preg_match('/(\d{4})$/', $rawValue, $m) && substr_count($rawValue, '/') > 1) {
            // format "22/04-24/04/2026"
            $year = $m[1];
            $rawValue = preg_replace('/\/?\d{4}$/', '', $rawValue);
        }

        // Pisahkan start-end berdasarkan "-" (asumsi "-" hanya di tengah)
        $parts = explode('-', $rawValue);
        if (count($parts) !== 2) return null;

        $startRaw = trim($parts[0]);
        $endRaw   = trim($parts[1]);

        // Jika tahun tidak ditemukan, ambil dari kolom tahun terpisah atau tahun sistem
        $yearColumn = $tglConfig['tahun_column_index'] ?? null;
        if (!$year) {
            $year = $yearColumn !== null ? trim($row[$yearColumn] ?? '') : null;
        }
        if (!$year) {
            $year = date('Y');  // fallback, bisa juga gunakan tahun dari sistem
        }

        $startDate = $this->parseDateWithYear($startRaw, $year);
        $endDate   = $this->parseDateWithYear($endRaw, $year);

        if (!$startDate || !$endDate) return null;

        return $this->generateDateRange($startDate, $endDate);
    } */

    /**
     * Helper: parse tanggal dengan tahun (jika tahun tidak ada di string, gunakan dari parameter)
     */
    /* private function parseDateWithYear(string $dateStr, ?string $year): ?\Carbon\Carbon
    {
        $formats = ['d/m', 'd-m', 'd/m/Y', 'd-m-Y', 'd/m/y', 'd-m-y', 'Y-m-d', 'd M Y'];
        foreach ($formats as $fmt) {
            try {
                $date = \Carbon\Carbon::createFromFormat($fmt, $dateStr);
                // Jika format tidak mengandung tahun, set tahun dari parameter
                if (!preg_match('/[Yy]/', $fmt) && $year) {
                    $date->year((int)$year);
                }
                return $date;
            } catch (\Exception $e) {}
        }
        // Fallback parse
        try {
            $date = \Carbon\Carbon::parse($dateStr);
            if ($year && $date->year === (int)date('Y')) {
                $date->year((int)$year);
            }
            return $date;
        } catch (\Exception $e) {
            return null;
        }
    } */

    /**
     * Generate array tanggal antara start dan end (inclusive)
     */
    private function generateDateRange(\Carbon\Carbon $start, \Carbon\Carbon $end): array
    {
        $dates = [];
        $current = $start->copy()->startOfDay();
        $last = $end->copy()->startOfDay();
        while ($current->lte($last)) {
            $dates[] = $current->format('Y-m-d');
            $current->addDay();
        }
        return $dates;
    }

}