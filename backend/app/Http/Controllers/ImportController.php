<?php

// app/Http/Controllers/ImportController.php
namespace App\Http\Controllers;

use App\Services\ExcelImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ImportController extends Controller
{
    private $importService;

    /**
     * URL endpoint WebSocket server untuk broadcast data.
     * Hanya digunakan jika WEBSOCKET_ENABLED=true di .env
     */
    private string $wsUrl = 'http://localhost:4000/broadcast';

    public function __construct(ExcelImportService $importService)
    {
        $this->importService = $importService;

        if (!Storage::disk('local')->exists('imports')) {
            Storage::disk('local')->makeDirectory('imports');
        }
    }

    /**
     * Kirim payload ke WebSocket server secara fire-and-forget.
     *
     * @param  array  $payload
     * @return void
     */
    private function broadcast(array $payload): void
    {
        if (!env('WEBSOCKET_ENABLED', false)) {
            return;
        }

        try {
            Http::timeout(2)->post($this->wsUrl, $payload);
        } catch (\Exception $e) {
            logger()->warning('WS Broadcast gagal: ' . $e->getMessage());
        }
    }

    /**
     * Pratinjau sheet dari file yang diunggah.
     * POST /api/import/preview
     */
    // app/Http/Controllers/ImportController.php
    public function previewJadwal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file'        => 'required|mimes:xlsx,xls,csv|max:4096',
            'sheet_index' => 'nullable|integer',
            'header_row'  => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $file = $request->file('file');
            $path = $file->storeAs('imports', time() . '_' . Str::random(5) . '.' . $file->getClientOriginalExtension(), 'local');
            $fullPath = Storage::disk('local')->path($path);

            $sheetIndex = (int)$request->input('sheet_index', 0);
            $headerRow  = (int)$request->input('header_row', 1);

            // Definisikan mapping default berdasar susunan ekspor: Tanggal=0, posisi=1, Paramedic=2, Peran=3, Tipe=4, Ket=5
            $mapping = [
                'tanggal'    => ['column_indices' => [0], 'is_range' => null, 'tahun_column_index' => null],
                'posisi'  => ['column_indices' => [1]],
                'paramedic'  => ['column_indices' => [2]],
                'peran'      => ['column_indices' => [3]],
                'tipe_jaga'  => ['column_indices' => [4]],
                'keterangan' => ['column_indices' => [5]]
            ];

            $result = $this->importService->previewJadwal($fullPath, $mapping, $sheetIndex, $headerRow);

            // Tarik master data pembanding aktif untuk dilempar ke resolver dropdown UI front-end
            $existingposisi = DB::table('posisi')->where('is_deleted', 0)->orderBy('nama_posisi')->get(['id_posisi', 'nama_posisi']);
            $existingParamedic = DB::table('paramedic')->where('is_deleted', 0)->orderBy('nama_paramedic')->get(['id_paramedic', 'nama_paramedic']);

            Storage::disk('local')->delete($path);

            return response()->json([
                'success' => true,
                'data' => [
                    'headers'            => $result['headers'],
                    'preview'            => $result['preview_rows'],
                    'total_rows'          => $result['total_rows'],
                    'conflict_posisi'  => $result['conflict_posisi'],
                    'conflict_paramedic'  => $result['conflict_paramedic'],
                    'existing_posisi'  => $existingposisi,
                    'existing_paramedic'  => $existingParamedic,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Preview Jadwal Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            if (isset($path)) Storage::disk('local')->delete($path);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proses import jadwal.
     * POST /api/import/process
     */
    public function importJadwal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file'               => 'required|mimes:xlsx,xls,csv|max:4096',
            'sheet_index'        => 'required|integer',
            'header_row'         => 'required|integer',
            'conflict_posisi' => 'nullable', // Berupa JSON string atau array mapping nama_asal => id_posisi_tujuan
            'conflict_paramedic' => 'nullable'  // Berupa JSON string atau array mapping nama_asal => id_paramedic_tujuan
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $file = $request->file('file');
            $path = $file->storeAs('imports', time() . '_' . Str::random(5) . '.' . $file->getClientOriginalExtension(), 'local');
            $fullPath = Storage::disk('local')->path($path);

            $sheetIndex = (int)$request->input('sheet_index');
            $headerRow  = (int)$request->input('header_row');

            $conflictposisi = $request->input('conflict_posisi', []);
            $conflictParamedic = $request->input('conflict_paramedic', []);

            if (is_string($conflictposisi)) $conflictposisi = json_decode($conflictposisi, true) ?? [];
            if (is_string($conflictParamedic)) $conflictParamedic = json_decode($conflictParamedic, true) ?? [];

            // Mapping urutan susunan kolom default Export Template Jadwal
            $mapping = [
                'tanggal'    => ['column_indices' => [0], 'is_range' => null, 'tahun_column_index' => null],
                'posisi'  => ['column_indices' => [1]],
                'paramedic'  => ['column_indices' => [2]],
                'peran'      => ['column_indices' => [3]],
                'tipe_jaga'  => ['column_indices' => [4]],
                'keterangan' => ['column_indices' => [5]]
            ];

            $result = $this->importService->processJadwalWithConflicts(
                $fullPath,
                $mapping,
                $sheetIndex,
                $headerRow,
                $conflictposisi,
                $conflictParamedic
            );

            Storage::disk('local')->delete($path);

            return response()->json($result);
        } catch (\Exception $e) {
            if (isset($path)) Storage::disk('local')->delete($path);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function importParamedic(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
            'conflict_posisi' => 'nullable|json',
        ]);
    
        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();
    
        if (empty($rows)) {
            throw ValidationException::withMessages(['file' => 'File kosong.']);
        }
    
        // Deteksi header
        $headers = array_map(fn($h) => trim((string)$h), $rows[0] ?? []);
        $colNama = null;
        $colposisi = null;
        foreach ($headers as $idx => $header) {
            $lower = strtolower($header);
            if (strpos($lower, 'nama') !== false && strpos($lower, 'dokter') !== false) {
                $colNama = $idx;
            } elseif (strpos($lower, 'posisi') !== false) {
                $colposisi = $idx;
            }
        }
        if (is_null($colNama) || is_null($colposisi)) {
            throw ValidationException::withMessages([
                'file' => 'Header tidak dikenali. Pastikan ada kolom "Nama Dokter" dan "posisiasi".'
            ]);
        }
    
        $conflictMap = json_decode($request->input('conflict_posisi', '{}'), true) ?? [];
        $userId = Auth::id() ?? 1;
        $errors = [];
        $imported = 0;
    
        for ($i = 1; $i < count($rows); $i++) {
            $rowData = $rows[$i];
            $nama = trim($rowData[$colNama] ?? '');
            $namaposisi = trim($rowData[$colposisi] ?? '');
    
            if (empty($nama) && empty($namaposisi)) continue;
    
            if (empty($nama)) {
                $errors[] = "Baris " . ($i + 1) . ": Nama Dokter kosong.";
                continue;
            }
    
            // Cari / buat paramedic
            $paramedic = DB::table('paramedic')
                ->where('nama_paramedic', $nama)
                ->where('is_deleted', 0)
                ->first();
            $id_paramedic = $paramedic
                ? $paramedic->id_paramedic
                : DB::table('paramedic')->insertGetId([
                    'nama_paramedic' => $nama,
                    'created_by'     => $userId,
                    'created_at'     => now(),
                ]);
    
            // Cari posisi dengan metode longgar
            $id_posisi = $this->findposisiId($namaposisi);
    
            if (!$id_posisi) {
                // Tidak ditemukan → periksa conflictMap
                $action = $conflictMap[$namaposisi] ?? null;
                if ($action === 'create' || $action === true || $action === 'true' || $action === null) {
                    // Buat baru
                    $id_posisi = DB::table('posisi')->insertGetId([
                        'nama_posisi' => $namaposisi,
                        'kategori_id'    => null,
                        'urutan'         => 0,
                        'created_by'     => $userId,
                        'created_at'     => now(),
                    ]);
                } elseif (is_numeric($action)) {
                    $existing = DB::table('posisi')->where('id_posisi', $action)->where('is_deleted', 0)->first();
                    if ($existing) {
                        $id_posisi = $existing->id_posisi;
                    } else {
                        $errors[] = "Baris " . ($i + 1) . ": posisiasi ID {$action} tidak valid.";
                        continue;
                    }
                } else {
                    $errors[] = "Baris " . ($i + 1) . ": posisiasi '{$namaposisi}' tidak ditemukan. Resolusi tidak diberikan.";
                    continue;
                }
            }
    
            // Relasi bagian_paramedic
            $exists = DB::table('bagian_paramedic')
                ->where('id_paramedic', $id_paramedic)
                ->where('id_posisi', $id_posisi)
                ->where('is_deleted', 0)
                ->exists();
            if (!$exists) {
                DB::table('bagian_paramedic')->insert([
                    'id_paramedic' => $id_paramedic,
                    'id_posisi' => $id_posisi,
                    'created_by'   => $userId,
                    'created_at'   => now(),
                ]);
                $imported++;
            }
        }
    
        return response()->json([
            'success' => "Berhasil mengimpor {$imported} relasi baru.",
            'errors'  => $errors,
        ]);
    }

    public function previewParamedic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (empty($rows) || count($rows) < 2) {
                return response()->json(['success' => false, 'message' => 'File kosong atau hanya header.'], 422);
            }

            // Deteksi header
            $headers = array_map(fn($h) => trim((string)$h), $rows[0] ?? []);
            $colNama = null;
            $colposisi = null;

            foreach ($headers as $idx => $header) {
                $lower = strtolower($header);
                if (strpos($lower, 'nama') !== false && strpos($lower, 'dokter') !== false) {
                    $colNama = $idx;
                } elseif (strpos($lower, 'posisi') !== false) {
                    $colposisi = $idx;
                }
            }

            if (is_null($colNama) || is_null($colposisi)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Header tidak dikenali. Pastikan ada kolom "Nama Dokter" dan "posisiasi".'
                ], 422);
            }

            // Kumpulkan semua nama posisi dari seluruh baris untuk deteksi konflik
            $allposisiNames = [];
            $previewRows = [];

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                $nama = trim($row[$colNama] ?? '');
                $posisi = trim($row[$colposisi] ?? '');
                if ($nama === '' && $posisi === '') continue;

                if ($posisi !== '') {
                    $allposisiNames[] = $posisi;
                }

                // Simpan 10 baris pertama untuk tampilan
                if (count($previewRows) < 10) {
                    $previewRows[] = [$nama, $posisi];
                }
            }

            // posisi existing (untuk dropdown wizard)
            $existingposisi = DB::table('posisi')
                ->where('is_deleted', 0)
                ->orderBy('nama_posisi')
                ->pluck('nama_posisi', 'id_posisi')
                ->toArray();

            // Deteksi konflik: nama yang tidak ditemukan dengan metode longgar
            $conflictNames = [];
            foreach (array_unique($allposisiNames) as $name) {
                $found = $this->findposisiId($name);
                if (is_null($found)) {
                    $conflictNames[] = $name;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'preview' => $previewRows,
                    'existing_posisi' => $existingposisi,
                    'conflict_posisi' => $conflictNames,
                    'total_rows' => count($rows) - 1,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Cari ID posisi dengan pendekatan longgar.
     * 1. Exact match case‑insensitive
     * 2. LIKE %keyword% (jika hasilnya tepat satu)
     * 3. Jika tidak → null (dianggap tidak ditemukan / konflik)
     */
    private function findposisiId(string $nama): ?int
    {
        $nama = trim($nama);
        if ($nama === '') return null;

        // 1. Exact match case‑insensitive
        $exact = DB::table('posisi')
            ->where('is_deleted', 0)
            ->whereRaw('LOWER(nama_posisi) = ?', [strtolower($nama)])
            ->first();
        if ($exact) {
            return $exact->id_posisi;
        }

        // 2. LIKE search
        $likeResults = DB::table('posisi')
            ->where('is_deleted', 0)
            ->whereRaw('LOWER(nama_posisi) LIKE ?', ['%' . strtolower($nama) . '%'])
            ->get();

        if ($likeResults->count() === 1) {
            return $likeResults->first()->id_posisi;
        }

        // 3. Tidak ditemukan atau ambigu (lebih dari 1 hasil) → null
        return null;
    }

}