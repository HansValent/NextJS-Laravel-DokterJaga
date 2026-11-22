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
     * Normalisasi format waktu dari frontend ('HH:mm' atau 'HH:mm:ss') ke 'HH:mm:ss'.
     */
    private function normalizeTime(?string $time, string $default): string
    {
        if (!$time) {
            return $default;
        }

        return strlen($time) === 5 ? $time . ':00' : $time;
    }

    /**
     * Base query untuk mengambil data jadwal beserta relasi dan hitung kuota pendaftaran.
     */
    private function baseQuery(bool $showDeleted = false)
    {
        $query = Jadwal::query()
            ->leftJoin('bagian_paramedic', 'jadwal.id_bagian_paramedic', '=', 'bagian_paramedic.id_bagian_paramedic')
            ->leftJoin('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
            ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
            ->leftJoin('users as creator', 'jadwal.created_by', '=', 'creator.id')
            ->select(
                'jadwal.id',
                'jadwal.tanggal',
                'jadwal.id_bagian_paramedic',
                'jadwal.peran',
                'jadwal.tipe_jaga',
                'jadwal.kuota_pasien',
                'jadwal.jam_mulai',
                'jadwal.jam_selesai',
                'jadwal.keterangan',
                'jadwal.is_deleted',
                'jadwal.created_by',
                'jadwal.created_at',
                'jadwal.updated_at',
                'jadwal.deleted_at',
                'creator.name as creator_name',
                'paramedic.id_paramedic as paramedic_id',
                'paramedic.nama_paramedic as paramedic_nama',
                'paramedic.npk as paramedic_npk',
                'paramedic.jenis_paramedic as paramedic_jenis_paramedic',
                'posisi.id_posisi as posisi_id',
                'posisi.nama_posisi as posisi_nama',
                'posisi.kode_poli as posisi_kode_poli',
                'posisi.jam_operasional as posisi_jam_operasional',
                'posisi.lokasi_ruangan as posisi_lokasi_ruangan',
                'posisi.status_poli as posisi_status_poli',
                DB::raw("(SELECT COUNT(*) FROM pendaftaran_konsultasi pk WHERE pk.jadwal_id = jadwal.id AND pk.status_antrian != 'Batal') as kuota_terisi")
            );

        if (!$showDeleted) {
            $query->where('jadwal.is_deleted', 0);
        }

        return $query;
    }

    // ======================
    // 📌 GET ALL / INDEX
    // ======================

    public function index(Request $request)
    {
        try {
            $showDeleted = $request->boolean('show_deleted', false);
            $query = $this->baseQuery($showDeleted);

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('jadwal.tanggal', [$request->start_date, $request->end_date]);
            } elseif ($request->filled('tanggal')) {
                $query->whereDate('jadwal.tanggal', $request->tanggal);
            }

            if ($request->filled('posisi_id')) {
                $query->where('posisi.id_posisi', $request->posisi_id);
            }

            if ($request->filled('paramedic_id')) {
                $query->where('paramedic.id_paramedic', $request->paramedic_id);
            }

            if ($request->filled('search')) {
                $search = '%' . $request->search . '%';
                $query->where(function ($q) use ($search) {
                    $q->where('paramedic.nama_paramedic', 'like', $search)
                      ->orWhere('posisi.nama_posisi', 'like', $search)
                      ->orWhere('jadwal.keterangan', 'like', $search);
                });
            }

            $data = $query->orderBy('jadwal.tanggal', 'asc')->get()->map(function ($item) {
                $terisi = (int) ($item->kuota_terisi ?? 0);
                $kuota = (int) ($item->kuota_pasien ?? 20);
                $item->kuota_terisi = $terisi;
                $item->sisa_kuota = max(0, $kuota - $terisi);
                return $item;
            });

            return response()->json(['success' => true, 'data' => $data], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 GET BY ID / SHOW
    // ======================

    public function show(Request $request, $id)
    {
        try {
            $showDeleted = $request->boolean('show_deleted', false);

            $row = Jadwal::query()
                ->leftJoin('bagian_paramedic', 'jadwal.id_bagian_paramedic', '=', 'bagian_paramedic.id_bagian_paramedic')
                ->leftJoin('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
                ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
                ->leftJoin('kategori_posisi', 'posisi.kategori_id', '=', 'kategori_posisi.id')
                ->leftJoin('users as creator', 'jadwal.created_by', '=', 'creator.id')
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
                    'posisi.kode_poli',
                    'posisi.jam_operasional',
                    'posisi.lokasi_ruangan',
                    'posisi.status_poli',
                    'jadwal.peran',
                    'jadwal.tipe_jaga',
                    'jadwal.kuota_pasien',
                    'jadwal.jam_mulai',
                    'jadwal.jam_selesai',
                    'jadwal.keterangan',
                    'jadwal.is_deleted',
                    'kategori_posisi.id as kategori_id',
                    'kategori_posisi.nama_kategori',
                    'creator.name as created_by',
                    'updater.name as updated_by',
                    'deleter.name as deleted_by',
                    'jadwal.created_at',
                    'jadwal.updated_at',
                    'jadwal.deleted_at',
                    DB::raw("(SELECT COUNT(*) FROM pendaftaran_konsultasi pk WHERE pk.jadwal_id = jadwal.id AND pk.status_antrian != 'Batal') as kuota_terisi")
                )
                ->when(!$showDeleted, fn($q) => $q->where('jadwal.is_deleted', 0))
                ->where('jadwal.id', $id)
                ->first();

            if (!$row) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan',
                ], 404);
            }

            $kuotaPasien = (int) ($row->kuota_pasien ?? 20);
            $kuotaTerisi = (int) ($row->kuota_terisi ?? 0);

            $data = [
                'id'                  => $row->id,
                'tanggal'             => $row->tanggal,
                'id_bagian_paramedic' => $row->id_bagian_paramedic,
                'peran'               => $row->peran,
                'tipe_jaga'           => $row->tipe_jaga,
                'kuota_pasien'        => $kuotaPasien,
                'kuota_terisi'        => $kuotaTerisi,
                'sisa_kuota'          => max(0, $kuotaPasien - $kuotaTerisi),
                'jam_mulai'           => $row->jam_mulai,
                'jam_selesai'         => $row->jam_selesai,
                'keterangan'          => $row->keterangan,
                'paramedic'           => [
                    'id_paramedic'    => $row->id_paramedic,
                    'nama_paramedic'  => $row->nama_paramedic,
                    'jenis_paramedic' => $row->jenis_paramedic,
                ],
                'posisi'              => [
                    'id_posisi'       => $row->id_posisi,
                    'nama_posisi'     => $row->nama_posisi,
                    'kode_poli'       => $row->kode_poli,
                    'jam_operasional' => $row->jam_operasional,
                    'lokasi_ruangan'  => $row->lokasi_ruangan,
                    'status_poli'     => $row->status_poli,
                    'kategori_id'     => $row->kategori_id,
                    'nama_kategori'   => $row->nama_kategori,
                ],
                'created_by'          => $row->created_by,
                'updated_by'          => $row->updated_by,
                'deleted_by'          => $row->deleted_by,
                'created_at'          => $row->created_at,
                'updated_at'          => $row->updated_at,
                'deleted_at'          => $row->deleted_at,
                'is_deleted'          => (int) $row->is_deleted,
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'             => 'required|date',
            'id_bagian_paramedic' => 'required|integer|exists:bagian_paramedic,id_bagian_paramedic',
            'peran'               => 'required|in:-,Utama,Backup 1,Backup 2,Backup 3',
            'tipe_jaga'           => 'required|in:-,Oncall,Onsite Pagi,Onsite Malam',
            'kuota_pasien'        => 'nullable|integer|min:1',
            'jam_mulai'           => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'jam_selesai'         => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'keterangan'          => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        /** @var \App\Models\Users|null $user */
        $user = Auth::user();

        if ($user && !$user->hasRole(['Super Admin', 'Admin'])) {
            $bagian = DB::table('bagian_paramedic')
                ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
                ->where('bagian_paramedic.id_bagian_paramedic', $request->id_bagian_paramedic)
                ->select('bagian_paramedic.id_bagian_paramedic', 'posisi.nama_posisi')
                ->first();

            if ($user->hasRole('IGD')) {
                if (!$bagian || stripos($bagian->nama_posisi, 'IGD') === false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses Ditolak: Pengguna dengan Role IGD hanya boleh mengisi jadwal posisi IGD.'
                    ], 403);
                }
            }

            if ($user->hasRole('ICU')) {
                if (!$bagian || stripos($bagian->nama_posisi, 'ICU') === false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses Ditolak: Pengguna dengan Role ICU hanya boleh mengisi jadwal posisi ICU.'
                    ], 403);
                }
            }
        }

        try {
            $jadwal = Jadwal::create([
                'tanggal'             => $request->tanggal,
                'id_bagian_paramedic' => $request->id_bagian_paramedic,
                'peran'               => $request->peran ?? 'Utama',
                'tipe_jaga'           => $request->tipe_jaga,
                'kuota_pasien'        => $request->kuota_pasien ?? 20,
                'jam_mulai'           => $this->normalizeTime($request->jam_mulai, '08:00:00'),
                'jam_selesai'         => $this->normalizeTime($request->jam_selesai, '14:00:00'),
                'keterangan'          => $request->keterangan,
                'created_by'          => Auth::id() ?? 0,
            ]);

            $fullData = $this->baseQuery()->where('jadwal.id', $jadwal->id)->first();
            $this->broadcast(['type' => 'create', 'entity' => 'jadwal', 'data' => $fullData]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal berhasil ditambahkan',
                'data'    => $fullData
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 UPDATE
    // ======================

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'             => 'required|date',
            'id_bagian_paramedic' => 'required|exists:bagian_paramedic,id_bagian_paramedic',
            'peran'               => ['nullable', Rule::in(['-', 'Utama', 'Backup 1', 'Backup 2', 'Backup 3'])],
            'tipe_jaga'           => ['nullable', Rule::in(['-', 'Oncall', 'Onsite Pagi', 'Onsite Malam'])],
            'kuota_pasien'        => 'nullable|integer|min:1',
            'jam_mulai'           => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'jam_selesai'         => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'keterangan'          => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        /** @var \App\Models\Users|null $user */
        $user = Auth::user();

        if ($user && !$user->hasRole(['Super Admin', 'Admin'])) {
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

        try {
            $jadwal = Jadwal::find($id);
            if (!$jadwal) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
            }

            $jadwal->update([
                'tanggal'             => $request->tanggal,
                'id_bagian_paramedic' => $request->id_bagian_paramedic,
                'peran'               => $request->peran ?? $jadwal->peran ?? 'Utama',
                'tipe_jaga'           => $request->tipe_jaga ?? $jadwal->tipe_jaga,
                'kuota_pasien'        => $request->kuota_pasien ?? $jadwal->kuota_pasien ?? 20,
                'jam_mulai'           => $this->normalizeTime($request->jam_mulai, $jadwal->jam_mulai ?? '08:00:00'),
                'jam_selesai'         => $this->normalizeTime($request->jam_selesai, $jadwal->jam_selesai ?? '14:00:00'),
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

            $this->broadcast(['type' => 'delete', 'entity' => 'jadwal', 'data' => ['id' => (int) $id]]);

            return response()->json(['success' => true, 'message' => 'Jadwal berhasil dihapus (soft delete)']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ======================
    // 📌 SHOW DELETED
    // ======================

    public function showDeleted()
    {
        try {
            $data = $this->baseQuery(true)
                ->where('jadwal.is_deleted', 1)
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

            $fullData = $this->baseQuery()->where('jadwal.id', $id)->first();
            $this->broadcast([
                'type'   => 'restore',
                'entity' => 'jadwal',
                'data'   => $fullData ?? ['id' => (int) $id],
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
                'type'   => 'permanent_delete',
                'entity' => 'jadwal',
                'data'   => ['id' => (int) $id],
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

    public function copyWeek(Request $request)
    {
        $request->validate([
            'source_start' => 'required|date',
            'source_end'   => 'required|date',
            'target_start' => 'required|date',
            'kuota_pasien' => 'nullable|integer|min:1',
            'jam_mulai'    => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'jam_selesai'  => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
        ]);

        DB::beginTransaction();
        try {
            $sourceStart = Carbon::parse($request->source_start)->startOfDay();
            $sourceEnd   = Carbon::parse($request->source_end)->endOfDay();
            $targetStart = Carbon::parse($request->target_start)->startOfDay();

            // Perbaikan arah selisih hari: dari sourceStart menuju targetStart
            $diffDays = $sourceStart->diffInDays($targetStart, false);

            $sourceJadwal = Jadwal::whereBetween('tanggal', [$sourceStart, $sourceEnd])
                ->where('is_deleted', 0)
                ->get();

            $copied  = 0;
            $skipped = 0;

            foreach ($sourceJadwal as $item) {
                $newDate = Carbon::parse($item->tanggal)->addDays($diffDays)->format('Y-m-d');

                $exists = Jadwal::whereDate('tanggal', $newDate)
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
                    'kuota_pasien'        => $item->kuota_pasien ?? $request->kuota_pasien ?? 20,
                    'jam_mulai'           => $item->jam_mulai ?? $this->normalizeTime($request->jam_mulai, '08:00:00'),
                    'jam_selesai'         => $item->jam_selesai ?? $this->normalizeTime($request->jam_selesai, '14:00:00'),
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

    public function copyDay(Request $request)
    {
        $request->validate([
            'source_date'  => 'required|date',
            'target_date'  => 'required|date',
            'kuota_pasien' => 'nullable|integer|min:1',
            'jam_mulai'    => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'jam_selesai'  => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
        ]);

        DB::beginTransaction();
        try {
            $sourceDate = Carbon::parse($request->source_date)->format('Y-m-d');
            $targetDate = Carbon::parse($request->target_date)->format('Y-m-d');

            $sourceJadwal = Jadwal::whereDate('tanggal', $sourceDate)
                ->where('is_deleted', 0)
                ->get();

            $copied  = 0;
            $skipped = 0;

            foreach ($sourceJadwal as $item) {
                $exists = Jadwal::whereDate('tanggal', $targetDate)
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
                    'kuota_pasien'        => $item->kuota_pasien ?? $request->kuota_pasien ?? 20,
                    'jam_mulai'           => $item->jam_mulai ?? $this->normalizeTime($request->jam_mulai, '08:00:00'),
                    'jam_selesai'         => $item->jam_selesai ?? $this->normalizeTime($request->jam_selesai, '14:00:00'),
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
