<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\Jadwal;

class JadwalController extends Controller
{
    /**
     * URL endpoint WebSocket server untuk broadcast data jadwal.
     * Hanya digunakan jika WEBSOCKET_ENABLED=true di .env
     */
    private string $wsUrl = 'http://localhost:4000/broadcast/jadwal';

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
     * Base query untuk mengambil data jadwal beserta relasi.
     *
     * @param  bool  $showDeleted  Sertakan data yang sudah di-soft delete?
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function baseQuery(bool $showDeleted = false)
    {
        $query = Jadwal::query()
            ->leftJoin('bagian_paramedic', 'jadwal.id_bagian_paramedic', '=', 'bagian_paramedic.id_bagian_paramedic')
            ->leftJoin('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
            ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
            ->leftJoin('users as creator', 'jadwal.created_by', '=', 'creator.id')
            ->select(
                'jadwal.id', // Menggunakan kolom 'id' asli sesuai database terbaru
                'jadwal.tanggal',
                'jadwal.id_bagian_paramedic',
                'jadwal.peran',
                'jadwal.tipe_jaga',
                'jadwal.keterangan',
                'jadwal.is_deleted',
                'jadwal.created_by',
                'jadwal.created_at',
                'jadwal.updated_at',
                'jadwal.deleted_at',
                'jadwal.created_by',
                'creator.name as creator_name',
                'paramedic.id_paramedic as paramedic_id',
                'paramedic.nama_paramedic as paramedic_nama',
                'paramedic.npk as paramedic_npk',
                'paramedic.jenis_paramedic as paramedic_jenis_paramedic',
                'posisi.id_posisi as posisi_id',
                'posisi.nama_posisi as posisi_nama'
            );

        if (!$showDeleted) {
            $query->where('jadwal.is_deleted', 0);
        }

        return $query;
    }

    // ======================
    // 📌 GET ALL / INDEX
    // ======================

    /**
     * Menampilkan daftar jadwal.
     * Mendukung filter: tanggal (start/end), posisi_id, search (nama paramedic/posisi).
     * Response:
     * {
     *   success: true,
     *   total: int,
     *   data: [ { id, tanggal, paramedic: {...}, posisi: {...}, ... } ]
     * }
     */
    public function index(Request $request)
    {
        try {
            // Tentukan apakah akan menampilkan data yang sudah dihapus
            $showDeleted = $request->boolean('show_deleted', false);

            $query = $this->baseQuery($showDeleted);

            // Filter tanggal tetap jalan
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('jadwal.tanggal', [$request->start_date, $request->end_date]);
            }

            $data = $query->orderBy('jadwal.tanggal', 'asc')->get();

            return response()->json(['success' => true, 'data' => $data], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan satu data jadwal berdasarkan ID.
     * Response:
     * {
     *   success: true,
     *   data: { id, tanggal, paramedic: {...}, posisi: {...}, ... }
     * }
     */
    public function show(Request $request, $id)
    {
        try {
            $showDeleted = $request->boolean('show_deleted', false);

            $row = $this->baseQuery($showDeleted)
                ->leftJoin('kategori_posisi', 'posisi.kategori_id', '=', 'kategori_posisi.id')
                ->leftJoin('users as updater', 'jadwal.updated_by', '=', 'updater.id')
                ->leftJoin('users as deleter', 'jadwal.deleted_by', '=', 'deleter.id')
                ->select(
                    'jadwal.id',
                    'jadwal.tanggal',
                    'jadwal.id_bagian_paramedic',
                    'paramedic.id_paramedic',
                    'paramedic.nama_paramedic',
                    'paramedic.jenis_paramedic',
                    'posisi.id_posisi',
                    'posisi.nama_posisi',
                    'jadwal.peran',
                    'jadwal.tipe_jaga',
                    'jadwal.keterangan',
                    'kategori_posisi.id as kategori_id',
                    'kategori_posisi.nama_kategori',
                    'creator.name as created_by',
                    'updater.name as updated_by',
                    'deleter.name as deleted_by',
                    'jadwal.created_at',
                    'jadwal.updated_at',
                    'jadwal.deleted_at'
                )
                ->where('jadwal.id', $id)
                ->first();

            if (!$row) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan',
                ], 404);
            }

            $data = [
                'id'                  => $row->id,
                'tanggal'             => $row->tanggal,
                'id_bagian_paramedic' => $row->id_bagian_paramedic,
                'peran'               => $row->peran,
                'tipe_jaga'           => $row->tipe_jaga,
                'keterangan'          => $row->keterangan,
                'paramedic'           => [
                    'id_paramedic'   => $row->id_paramedic,
                    'nama_paramedic' => $row->nama_paramedic,
                    'jenis_paramedic'=> $row->jenis_paramedic,
                ],
                'posisi'           => [
                    'id_posisi'   => $row->id_posisi,
                    'nama_posisi' => $row->nama_posisi,
                    'kategori_id'    => $row->kategori_id,
                    'nama_kategori'  => $row->nama_kategori,
                ],
                'created_by'          => $row->created_by,
                'updated_by'          => $row->updated_by,
                'deleted_by'          => $row->deleted_by,
                'created_at'          => $row->created_at,
                'updated_at'          => $row->updated_at,
                'deleted_at'          => $row->deleted_at,
                'is_deleted'          => $row->deleted_at ? 1 : 0,
            ];

            return response()->json([
                'success' => true,
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Jadwal show error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 CREATE
    // ======================

    /**
     * Menyimpan satu atau beberapa jadwal sekaligus.
     * Input: { tanggal, id_bagian_paramedic: [] }
     * Response sukses (201): { success: true, total_inserted: int }
     * Jika semua duplikat: { success: true, message: "...duplikat", total_inserted: 0 }
     * Error validasi (422): { success: false, errors: {...} }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'             => 'required|date',
            'id_bagian_paramedic' => 'required|integer',
            'peran'               => 'required|in:-,Utama,Backup 1,Backup 2,Backup 3',
            'tipe_jaga'           => 'required|in:-,Oncall,Onsite Pagi,Onsite Malam',
            'keterangan'          => 'nullable|string',
        ]);

        /** @var \App\Models\Users|null $user */
        $user = Auth::user();

        // 2. Jika bukan Super Admin, lakukan pembatasan berdasarkan Role
        if (!$user->hasRole(['Super Admin', 'Admin'])) {

            $bagian = DB::table('bagian_paramedic')
                ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi') 
                ->where('bagian_paramedic.id_bagian_paramedic', $request->id_bagian_paramedic)
                ->select('bagian_paramedic.id_bagian_paramedic', 'posisi.nama_posisi')
                ->first();

            // Validasi untuk Role IGD
            if ($user->hasRole('IGD')) {
                if (!$bagian || stripos($bagian->nama_posisi, 'IGD') === false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses Ditolak: Pengguna dengan Role IGD hanya boleh mengisi jadwal posisi IGD.'
                    ], 403);
                }
            }

            // Validasi untuk Role ICU
            if ($user->hasRole('ICU')) {
                if (!$bagian || stripos($bagian->nama_posisi, 'ICU') === false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses Ditolak: Pengguna dengan Role ICU hanya boleh mengisi jadwal posisi ICU.'
                    ], 403);
                }
            }
        }

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $jadwal = Jadwal::create([
                'tanggal'             => $request->tanggal,
                'id_bagian_paramedic' => $request->id_bagian_paramedic,
                'peran'               => $request->peran ?? 'Utama',
                'tipe_jaga'           => $request->tipe_jaga,
                'keterangan'          => $request->keterangan,
                'created_by'          => Auth::id() ?? 0,
            ]);

            // Ambil data lengkap beserta join untuk broadcast ke frontend
            $fullData = $this->baseQuery()->where('jadwal.id', $jadwal->id)->first();

            $this->broadcast(['type' => 'create', 'entity' => 'jadwal', 'data' => $fullData]);

            return response()->json(['success' => true, 'message' => 'Jadwal berhasil ditambahkan', 'data' => $fullData], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 UPDATE
    // ======================

    /**
     * Memperbarui satu data jadwal.
     * Response sukses: { success: true, data: { id, tanggal, ... } }
     * Error validasi (422): { success: false, errors: {...} }
     * Tidak ditemukan (404): { success: false, message: "..." }
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'             => 'required|date',
            'id_bagian_paramedic' => 'required|exists:bagian_paramedic,id_bagian_paramedic',
            'peran'               => ['nullable', Rule::in(['-', 'Utama', 'Backup 1', 'Backup 2', 'Backup 3'])],
            'tipe_jaga'           => ['nullable', Rule::in(['-', 'Oncall', 'Onsite Pagi', 'Onsite Malam'])],
            'keterangan'          => 'nullable|string',
        ]);

        /** @var \App\Models\Users|null $user */
        $user = Auth::user();

        if (!$user->hasRole(['Super Admin', 'Admin'])) {
            $bagian = DB::table('bagian_paramedic')
                ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
                ->where('bagian_paramedic.id_bagian_paramedic', $request->id_bagian_paramedic)
                ->select('posisi.nama_posisi')
                ->first();

            if ($user->hasRole('IGD') && (!$bagian || stripos($bagian->nama_posisi, 'IGD') === false)) {
                return response()->json(['success' => false, 'message' => 'Akses Ditolak: Khusus posisi IGD.'], 403);
            }

            if ($user->hasRole('ICU') && (!$bagian || stripos($bagian->nama_posisi, 'ICU') === false)) {
                return response()->json(['success' => false, 'message' => 'Akses Ditolak: Khusus posisi ICU.'], 403);
            }
        }

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $jadwal = Jadwal::find($id);
            if (!$jadwal) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            $jadwal->update([
                'tanggal'             => $request->tanggal,
                'id_bagian_paramedic' => $request->id_bagian_paramedic,
                'peran'               => $request->peran ?? 'Utama',
                'tipe_jaga'           => $request->tipe_jaga,
                'keterangan'          => $request->keterangan,
                'updated_by'          => Auth::id(),
            ]);

            $fullData = $this->baseQuery()->where('jadwal.id', $id)->first();
            $this->broadcast(['type' => 'update', 'entity' => 'jadwal', 'data' => $fullData]);

            return response()->json(['success' => true, 'message' => 'Jadwal berhasil diupdate', 'data' => $fullData]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 SOFT DELETE
    // ======================

    /**
     * Soft delete jadwal.
     * Response: { success: true, message: "...", data: id }
     * Gagal: { success: false, message: "..." }
     */
    public function destroy($id)
    {
        try {
            $jadwal = Jadwal::find($id);
            if (!$jadwal) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            $jadwal->update([
                'is_deleted' => 1,
                'deleted_by' => Auth::id(),
                'deleted_at' => Carbon::now()
            ]);

            $this->broadcast(['type' => 'delete', 'entity' => 'jadwal', 'data' => ['id' => $id]]);

            return response()->json(['success' => true, 'message' => 'Jadwal berhasil dihapus (soft delete)']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 SHOW DELETED
    // ======================

    /**
     * Menampilkan semua jadwal yang sudah di-soft delete.
     * Response: { success: true, total: int, data: [ ... ] }
     */
    public function showDeleted()
    {
        try {
            // Kita masukkan argument 'true' agar baseQuery mengizinkan pembacaan is_deleted = 1
            $data = $this->baseQuery(true)
                ->where('jadwal.is_deleted', 1) // Khusus mengambil data yang sudah dihapus
                ->orderBy('jadwal.tanggal', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $data], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 RESTORE
    // ======================

    /**
     * Restore jadwal yang dihapus.
     * Response: { success: true, message: "...", data: id }
     */
    public function restore($id)
    {
        try {
            $exists = Jadwal::where('id', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus',
                ], 404);
            }

            Jadwal::where('id', $id)->update([
                'is_deleted' => 0,
                'deleted_at' => null,
                'deleted_by' => null,
            ]);

            $this->broadcast([
                'type'    => 'jadwal',
                'payload' => [
                    'type' => 'restore',
                    'id'   => $id,
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil merestore jadwal',
                'data'    => $id,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Jadwal restore error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal restore: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 PERMANENT DELETE
    // ======================

    /**
     * Hapus permanen data jadwal dari database (hard delete).
     * Hanya bisa dilakukan pada data yang sudah di-soft delete terlebih dahulu.
     * Response: { success: true, message: "...", data: id }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function permanentDelete($id)
    {
        try {
            $exists = Jadwal::where('id', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus. Lakukan soft delete terlebih dahulu.',
                ], 404);
            }

            Jadwal::where('id', $id)->delete();

            $this->broadcast([
                'type'    => 'jadwal',
                'payload' => [
                    'type' => 'permanent_delete',
                    'id'   => $id,
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data jadwal berhasil dihapus permanen',
                'data'    => $id,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Jadwal permanentDelete error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus permanen: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 COPY WEEK (FLEKSIBEL)
    // ======================
    
    /**
     * Menyalin jadwal dari rentang sumber ke rentang target yang ditentukan.
     * Input: { source_start, source_end, target_start }
     * Response: { success: true, message: "...", copied_count: int, skipped_count: int }
     */
    public function copyWeek(Request $request)
    {
        $request->validate([
            'source_start' => 'required|date',
            'source_end'   => 'required|date',
            'target_start' => 'required|date',   // ✅ baru
        ]);
    
        DB::beginTransaction();
        try {
            $sourceStart = Carbon::parse($request->source_start)->startOfDay();
            $sourceEnd   = Carbon::parse($request->source_end)->endOfDay();
            $targetStart = Carbon::parse($request->target_start)->startOfDay();
    
            // Hitung selisih hari antara target dan sumber
            $diffDays = $targetStart->diffInDays($sourceStart, false);
    
            $sourceJadwal = Jadwal::whereBetween('tanggal', [$sourceStart, $sourceEnd])
                ->where('is_deleted', 0)
                ->get();
    
            $copied  = 0;
            $skipped = 0;
    
            foreach ($sourceJadwal as $item) {
                $newDate = Carbon::parse($item->tanggal)->addDays($diffDays);
    
                // Cek duplikasi di tanggal target
                $exists = Jadwal::where('tanggal', $newDate)
                    ->where('id_bagian_paramedic', $item->id_bagian_paramedic)
                    ->where('peran', $item->peran)
                    ->where('tipe_jaga', $item->tipe_jaga)
                    ->where('is_deleted', 0)
                    ->exists();
    
                if ($exists) {
                    $skipped++;
                    continue;
                }
    
                Jadwal::create([
                    'tanggal'             => $newDate,
                    'id_bagian_paramedic' => $item->id_bagian_paramedic,
                    'peran'               => $item->peran,
                    'tipe_jaga'           => $item->tipe_jaga,
                    'keterangan'          => $item->keterangan,
                    'created_by'          => Auth::id() ?? 0,
                ]);
                $copied++;
            }
    
            DB::commit();
            $this->broadcast(['type' => 'refresh_all', 'entity' => 'jadwal', 'data' => []]);
    
            return response()->json([
                'success'       => true,
                'message'       => "{$copied} jadwal disalin, {$skipped} dilewati karena sudah ada.",
                'copied_count'  => $copied,
                'skipped_count' => $skipped,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Jadwal copyWeek error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menyalin: ' . $e->getMessage()], 500);
        }
    }
    
    // ======================
    // 📌 COPY DAY (SATU HARI)
    // ======================
    
    /**
     * Menyalin jadwal dari satu hari ke hari lain.
     * Input: { source_date, target_date }
     * Response: { success: true, message: "...", copied_count: int, skipped_count: int }
     */
    public function copyDay(Request $request)
    {
        $request->validate([
            'source_date' => 'required|date',
            'target_date' => 'required|date',
        ]);
    
        DB::beginTransaction();
        try {
            $sourceDate = Carbon::parse($request->source_date)->startOfDay();
            $targetDate = Carbon::parse($request->target_date)->startOfDay();
    
            $sourceJadwal = Jadwal::where('tanggal', $sourceDate)
                ->where('is_deleted', 0)
                ->get();
    
            $copied  = 0;
            $skipped = 0;
    
            foreach ($sourceJadwal as $item) {
                // Cek duplikasi di tanggal target
                $exists = Jadwal::where('tanggal', $targetDate)
                    ->where('id_bagian_paramedic', $item->id_bagian_paramedic)
                    ->where('peran', $item->peran)
                    ->where('tipe_jaga', $item->tipe_jaga)
                    ->where('is_deleted', 0)
                    ->exists();
    
                if ($exists) {
                    $skipped++;
                    continue;
                }
    
                Jadwal::create([
                    'tanggal'             => $targetDate,
                    'id_bagian_paramedic' => $item->id_bagian_paramedic,
                    'peran'               => $item->peran,
                    'tipe_jaga'           => $item->tipe_jaga,
                    'keterangan'          => $item->keterangan,
                    'created_by'          => Auth::id() ?? 0,
                ]);
                $copied++;
            }
    
            DB::commit();
            $this->broadcast(['type' => 'refresh_all', 'entity' => 'jadwal', 'data' => []]);
    
            return response()->json([
                'success'       => true,
                'message'       => "{$copied} jadwal disalin, {$skipped} dilewati karena sudah ada.",
                'copied_count'  => $copied,
                'skipped_count' => $skipped,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Jadwal copyDay error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menyalin: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint khusus untuk Next.js (SSG) – mengambil data jadwal dari MoD
     * Query: ?tanggal=YYYY-MM-DD
     */
    public function modData(Request $request)
    {
        $tanggal = $request->query('tanggal');
    
        try {
            $response = Http::timeout(10)->get('http://192.168.6.10/mod/api_jadwal.php', [
                'api_key' => '12345-ABCDE-67890',
                'tanggal' => $tanggal,
            ]);
    
            if ($response->successful()) {
                return response()->json($response->json());
            }
    
            // Jika MoD memberikan response non-200
            Log::error('MoD API error: ' . $response->status() . ' - ' . $response->body());
            return response()->json([
                'success' => false,
                'message' => 'MoD API returned ' . $response->status(),
            ], 502);
        } catch (\Exception $e) {
            Log::error('MoD fetch exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}