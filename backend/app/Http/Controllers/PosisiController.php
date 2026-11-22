<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PosisiController extends Controller
{
    /**
     * URL endpoint WebSocket server untuk broadcast data posisi.
     */
    private string $wsUrl = 'http://localhost:4000/broadcast/posisi';

    /**
     * Kirim payload ke WebSocket server secara fire-and-forget.
     */
    private function broadcast(array $payload): void
    {
        try {
            Http::timeout(2)->post($this->wsUrl, $payload);
        } catch (\Exception $e) {
            logger()->warning('WS posisi gagal: ' . $e->getMessage());
        }
    }

    /**
     * Base query untuk mengambil data posisi beserta kategori dan user tracking.
     */
    private function baseQuery()
    {
        return DB::table('posisi')
            ->leftJoin('kategori_posisi', 'posisi.kategori_id', '=', 'kategori_posisi.id')
            ->leftJoin('users as creator', 'posisi.created_by', '=', 'creator.id')
            ->leftJoin('users as updater', 'posisi.updated_by', '=', 'updater.id')
            ->leftJoin('users as deleter', 'posisi.deleted_by', '=', 'deleter.id')
            ->select(
                'posisi.id_posisi as id',
                'posisi.nama_posisi',
                'posisi.kode_poli',
                'posisi.jam_operasional',
                'posisi.lokasi_ruangan',
                'posisi.kuota_harian',
                'posisi.status_poli',
                'posisi.kategori_id',
                'posisi.urutan',
                'posisi.is_deleted',
                'kategori_posisi.nama_kategori',
                'kategori_posisi.urutan as kategori_urutan',
                'creator.name as created_by',
                'updater.name as updated_by',
                'deleter.name as deleted_by',
                'posisi.created_at',
                'posisi.updated_at',
                'posisi.deleted_at'
            );
    }

    /**
     * Terapkan filter is_deleted jika tidak diminta data yang sudah dihapus.
     */
    private function applyDeletedFilter($query, Request $request)
    {
        if (!$request->boolean('show_deleted')) {
            $query->where('posisi.is_deleted', 0);
        }
        return $query;
    }

    // ======================
    // 📌 INDEX
    // ======================

    /**
     * Menampilkan semua data posisi, diurutkan berdasarkan kategori kemudian urutan.
     */
    public function index(Request $request)
    {
        $query = $this->baseQuery();
        $query = $this->applyDeletedFilter($query, $request);

        $data = $query
            ->orderBy('kategori_posisi.urutan')
            ->orderBy('posisi.urutan')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // ======================
    // 📌 STORE
    // ======================

    /**
     * Menambahkan posisi baru dengan auto-fill urutan di posisi pertama yang tersedia.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_posisi' => 'required|string',
            'kategori_id'    => 'nullable|integer',
        ]);

        DB::beginTransaction();

        try {
            // Ambil semua urutan yang sudah ada di kategori tujuan
            $existing = DB::table('posisi')
                ->when($request->kategori_id === null,
                    fn($q) => $q->whereNull('kategori_id'),
                    fn($q) => $q->where('kategori_id', $request->kategori_id)
                )
                ->where('is_deleted', 0)
                ->orderBy('urutan')
                ->pluck('urutan')
                ->toArray();

            // Cari gap pertama untuk urutan baru
            $urutanBaru = 1;
            foreach ($existing as $u) {
                if ((int) $u === $urutanBaru) {
                    $urutanBaru++;
                } elseif ((int) $u > $urutanBaru) {
                    break; // gap ditemukan
                }
            }

            $id = DB::table('posisi')->insertGetId([
                'nama_posisi' => $request->nama_posisi,
                'posisi.kode_poli'=> $request->kode_poli,
                'posisi.jam_operasional'=> $request->jam_operasional,
                'posisi.lokasi_ruangan'=> $request->lokasi_ruangan,
                'posisi.kuota_harian'=> $request->kuota_harian,
                'posisi.status_poli'=> $request->status_poli,
                'kategori_id'    => $request->kategori_id,
                'urutan'         => $urutanBaru,
                'is_deleted'     => 0,
                'created_by'     => Auth::id() ?? 0,
                'created_at'     => now(),
                'updated_at'     => now(),
            ], 'id_posisi');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }

        $item = $this->baseQuery()
            ->where('posisi.id_posisi', $id)
            ->first();

        $this->broadcast([
            'type' => 'create',
            'data' => $item,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Created',
        ]);
    }

    // ======================
    // 📌 SHOW
    // ======================

    /**
     * Menampilkan satu data posisi berdasarkan ID.
     */
    public function show(Request $request, $id)
    {
        $query = $this->baseQuery()->where('posisi.id_posisi', $id);
        $query = $this->applyDeletedFilter($query, $request);

        $item = $query->first();

        return response()->json([
            'success' => true,
            'data'    => $item,
        ]);
    }

    // ======================
    // 📌 REORDER
    // ======================

    /**
     * Mengatur ulang urutan posisi (drag-and-drop).
     * Menggunakan teknik offset 1000 untuk mencegah tabrakan urutan.
     */
    public function reorder(Request $request)
    {
        $items = $request->input('items');

        if (!is_array($items) || empty($items)) {
            return response()->json([
                'success' => false,
                'message' => 'Payload tidak valid',
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Step 1: Offset item yang dipindahkan (beri ruang)
            foreach ($items as $item) {
                if (!isset($item['id'], $item['urutan'])) continue;

                DB::table('posisi')
                    ->where('id_posisi', $item['id'])
                    ->update(['urutan' => DB::raw('urutan + 1000')]);
            }

            // Step 2: Offset kategori target (kosongkan slot tujuan)
            foreach ($items as $item) {
                if (!isset($item['id'], $item['urutan'])) continue;

                $kategori = $item['kategori_id'] ?? null;

                DB::table('posisi')
                    ->when($kategori === null,
                        fn($q) => $q->whereNull('kategori_id'),
                        fn($q) => $q->where('kategori_id', $kategori)
                    )
                    ->where('is_deleted', 0)
                    ->where('urutan', '>=', $item['urutan'])
                    ->update(['urutan' => DB::raw('urutan + 1000')]);
            }

            // Step 3: Apply urutan final
            foreach ($items as $item) {
                if (!isset($item['id'], $item['urutan'])) continue;

                DB::table('posisi')
                    ->where('id_posisi', $item['id'])
                    ->update([
                        'kategori_id' => $item['kategori_id'] ?? null,
                        'urutan'      => $item['urutan'],
                        'updated_at'  => now(),
                    ]);
            }

            // Step 4: Normalisasi ulang semua kategori yang terdampak
            $kategoriIds = collect($items)
                ->pluck('kategori_id')
                ->map(fn($v) => $v ?? 'NULL')
                ->unique();

            foreach ($kategoriIds as $kategori) {
                $rows = DB::table('posisi')
                    ->when($kategori === 'NULL',
                        fn($q) => $q->whereNull('kategori_id'),
                        fn($q) => $q->where('kategori_id', $kategori)
                    )
                    ->where('is_deleted', 0)
                    ->orderBy('urutan')
                    ->get();

                $i = 1;
                foreach ($rows as $row) {
                    DB::table('posisi')
                        ->where('id_posisi', $row->id_posisi)
                        ->update(['urutan' => $i++]);
                }
            }

            DB::commit();

            // Broadcast data terbaru
            $updated = $this->baseQuery()->get();
            $this->broadcast([
                'type'    => 'posisi-updated',
                'payload' => [
                    'type' => 'reorder',
                    'data' => $updated,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            logger()->error('REORDER ERROR: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 UPDATE
    // ======================

    /**
     * Memperbarui data posisi (nama & kategori saja).
     * - TIDAK mengubah urutan.
     * - Jika kategori_id berubah, urutan di-reset menjadi NULL agar tidak bentrok.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_posisi' => 'required|string',
            'kategori_id'    => 'nullable|integer',
            'posisi.kode_poli'=> 'nullable|string',
            'posisi.jam_operasional'=> 'nullable|string',
            'posisi.lokasi_ruangan'=> 'nullable|string',
            'posisi.kuota_harian'=> 'nullable|string',
            'posisi.status_poli'=> 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $current = DB::table('posisi')->where('id_posisi', $id)->first();
            if (!$current) {
                throw new \Exception('Data tidak ditemukan');
            }

            $namaBaru     = $request->nama_posisi;
            $kategoriBaru = $request->kategori_id;
            $kategoriLama = $current->kategori_id;

            $updateData = [
                'nama_posisi' => $namaBaru,
                'kategori_id'    => $kategoriBaru,
                'updated_by'     => Auth::id() ?? 0,
                'updated_at'     => now(),
            ];

            // -------------------------------
            // JIKA KATEGORI BERUBAH
            // -------------------------------
            if ($kategoriBaru !== $kategoriLama) {
                // Step 1: Kosongkan urutan dulu agar tidak bentrok unique constraint
                $updateData['urutan'] = null;
                DB::table('posisi')
                    ->where('id_posisi', $id)
                    ->update($updateData);

                // Step 2: Hitung urutan baru di kategori tujuan (max + 1)
                $maxUrutan = DB::table('posisi')
                    ->when($kategoriBaru === null,
                        fn($q) => $q->whereNull('kategori_id'),
                        fn($q) => $q->where('kategori_id', $kategoriBaru)
                    )
                    ->where('is_deleted', 0)
                    ->max('urutan') ?? 0;

                $urutanBaru = $maxUrutan + 1;

                // Update urutan ke nilai baru
                DB::table('posisi')
                    ->where('id_posisi', $id)
                    ->update(['urutan' => $urutanBaru]);

                // Step 3: Normalisasi kategori LAMA (isi gap yang ditinggalkan)
                $rowsLama = DB::table('posisi')
                    ->when($kategoriLama === null,
                        fn($q) => $q->whereNull('kategori_id'),
                        fn($q) => $q->where('kategori_id', $kategoriLama)
                    )
                    ->where('is_deleted', 0)
                    ->orderBy('urutan')
                    ->get();

                $i = 1;
                foreach ($rowsLama as $row) {
                    DB::table('posisi')
                        ->where('id_posisi', $row->id_posisi)
                        ->update(['urutan' => $i++]);
                }
            } else {
                // Kategori TIDAK berubah → update data tanpa ubah urutan
                DB::table('posisi')
                    ->where('id_posisi', $id)
                    ->update($updateData);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }

        $item = $this->baseQuery()
            ->where('posisi.id_posisi', $id)
            ->first();

        $this->broadcast([
            'type' => 'update',
            'data' => $item,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Updated',
        ]);
    }

    // ======================
    // 📌 DELETE (SOFT)
    // ======================

    /**
     * Soft delete posisi dan mengosongkan urutan.
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $current = DB::table('posisi')->where('id_posisi', $id)->first();
            if (!$current) {
                throw new \Exception('Data tidak ditemukan');
            }

            $kategoriId = $current->kategori_id;

            // Hapus dari sistem urutan
            DB::table('posisi')->where('id_posisi', $id)->update([
                'is_deleted' => 1,
                'urutan'     => null,
                'deleted_at' => now(),
                'deleted_by' => Auth::id() ?? 0,
            ]);

            // Normalisasi urutan data yang tersisa
            $rows = DB::table('posisi')
                ->when($kategoriId === null,
                    fn($q) => $q->whereNull('kategori_id'),
                    fn($q) => $q->where('kategori_id', $kategoriId)
                )
                ->where('is_deleted', 0)
                ->orderBy('urutan')
                ->get();

            $i = 1;
            foreach ($rows as $row) {
                DB::table('posisi')
                    ->where('id_posisi', $row->id_posisi)
                    ->update(['urutan' => $i++]);
            }

            DB::commit();

            $this->broadcast([
                'type' => 'delete',
                'id'   => $id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Soft deleted',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 SHOW DELETED
    // ======================

    /**
     * Menampilkan data posisi yang sudah di-soft delete.
     * Response: { success: true, total: int, data: [ ... ] }
     */
    public function showDeleted()
    {
        try {
            $data = $this->baseQuery()
                ->where('posisi.is_deleted', 1)
                ->orderBy('posisi.deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'total'   => $data->count(),
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('posisi showDeleted error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 RESTORE
    // ======================

    /**
     * Mengembalikan posisi yang telah dihapus.
     * Urutan baru ditempatkan di akhir kategorinya.
     * Response: { success: true, message: "Restored", data: { ... } }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function restore($id)
    {
        DB::beginTransaction();

        try {
            $current = DB::table('posisi')
                ->where('id_posisi', $id)
                ->where('is_deleted', 1)
                ->first();

            if (!$current) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus',
                ], 404);
            }

            $kategoriId = $current->kategori_id;

            // Hitung urutan baru di akhir kategori (max + 1)
            $maxUrutan = DB::table('posisi')
                ->when($kategoriId === null,
                    fn($q) => $q->whereNull('kategori_id'),
                    fn($q) => $q->where('kategori_id', $kategoriId)
                )
                ->where('is_deleted', 0)
                ->max('urutan') ?? 0;

            DB::table('posisi')->where('id_posisi', $id)->update([
                'is_deleted' => 0,
                'urutan'     => $maxUrutan + 1,
                'deleted_at' => null,
                'deleted_by' => null,
            ]);

            DB::commit();

            $item = $this->baseQuery()
                ->where('posisi.id_posisi', $id)
                ->first();

            $this->broadcast([
                'type' => 'restore',
                'id'   => $id,
                'data' => $item,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Restored',
                'data'    => $item,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('posisi restore error: ' . $e->getMessage());

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
     * Hapus permanen data posisi dari database (hard delete).
     * Hanya bisa dilakukan pada data yang sudah di-soft delete terlebih dahulu.
     * Response: { success: true, message: "...", data: id }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function permanentDelete($id)
    {
        DB::beginTransaction();

        try {
            $exists = DB::table('posisi')
                ->where('id_posisi', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus. Lakukan soft delete terlebih dahulu.',
                ], 404);
            }

            DB::table('posisi')->where('id_posisi', $id)->delete();

            DB::commit();

            $this->broadcast([
                'type' => 'permanent_delete',
                'id'   => $id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data posisi berhasil dihapus permanen',
                'data'    => $id,
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('posisi permanentDelete error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus permanen: ' . $e->getMessage(),
            ], 500);
        }
    }
}
