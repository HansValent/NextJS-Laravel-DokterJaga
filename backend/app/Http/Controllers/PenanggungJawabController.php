<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PenanggungJawab;
use Illuminate\Validation\Rule;

class PenanggungJawabController extends Controller
{
    /**
     * URL endpoint WebSocket server untuk broadcast data Penanggung Jawab.
     */
    private string $wsUrl = 'http://localhost:4000/broadcast/pj';

    /**
     * Kirim payload ke WebSocket server secara fire-and-forget.
     *
     * @param  array  $payload
     * @return void
     */
    private function broadcast(array $payload): void
    {
        try {
            Http::timeout(2)->post($this->wsUrl, $payload);
        } catch (\Exception $e) {
            logger()->warning('WS Broadcast PJ gagal: ' . $e->getMessage());
        }
    }

    /**
     * Base query untuk mengambil data Penanggung Jawab beserta relasi.
     *
     * @param  bool  $showDeleted  Sertakan data yang sudah di-soft delete?
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function baseQuery(bool $showDeleted = false)
    {
        $query = PenanggungJawab::query()
            ->leftJoin('users as creator', 'penanggung_jawab.created_by', '=', 'creator.id')
            ->leftJoin('users as updater', 'penanggung_jawab.updated_by', '=', 'updater.id')
            ->leftJoin('users as deleter', 'penanggung_jawab.deleted_by', '=', 'deleter.id')
            ->leftJoin('paramedic as perawat', 'penanggung_jawab.id_perawat', '=', 'perawat.id_paramedic')
            ->leftJoin('paramedic as kepala_jaga', 'penanggung_jawab.id_kepala_jaga', '=', 'kepala_jaga.id_paramedic')
            ->leftJoin('paramedic as ponek', 'penanggung_jawab.id_ponek', '=', 'ponek.id_paramedic')
            ->select(
                'penanggung_jawab.id_penanggung_jawab',
                'penanggung_jawab.tanggal',
                'penanggung_jawab.id_perawat',
                'penanggung_jawab.id_kepala_jaga',
                'penanggung_jawab.id_ponek',
                'penanggung_jawab.is_deleted',
                'penanggung_jawab.created_at',
                'penanggung_jawab.updated_at',
                'penanggung_jawab.deleted_at',
                'creator.name as created_by',
                'updater.name as updated_by',
                'deleter.name as deleted_by',
                'perawat.nama_paramedic as perawat_nama',
                'kepala_jaga.nama_paramedic as kepala_jaga_nama',
                'ponek.nama_paramedic as ponek_nama'
            );

        if (!$showDeleted) {
            $query->where('penanggung_jawab.is_deleted', 0);
        }

        return $query;
    }

    /**
     * Format ulang item hasil baseQuery menjadi struktur yang diharapkan frontend.
     *
     * @param  object  $item
     * @return array
     */
    private function formatItem($item): array
    {
        return [
            'id_penanggung_jawab' => $item->id_penanggung_jawab,
            'tanggal'             => $item->tanggal,
            'id_perawat'          => $item->id_perawat,
            'id_kepala_jaga'      => $item->id_kepala_jaga,
            'id_ponek'            => $item->id_ponek,
            'perawat'             => $item->perawat_nama
                ? ['id_paramedic' => $item->id_perawat, 'nama_paramedic' => $item->perawat_nama]
                : null,
            'kepala_jaga'         => $item->kepala_jaga_nama
                ? ['id_paramedic' => $item->id_kepala_jaga, 'nama_paramedic' => $item->kepala_jaga_nama]
                : null,
            'ponek'               => $item->ponek_nama
                ? ['id_paramedic' => $item->id_ponek, 'nama_paramedic' => $item->ponek_nama]
                : null,
            'created_by'          => $item->created_by,
            'updated_by'          => $item->updated_by,
            'deleted_by'          => $item->deleted_by,
            'created_at'          => $item->created_at,
            'updated_at'          => $item->updated_at,
            'deleted_at'          => $item->deleted_at,
            'is_deleted'          => $item->is_deleted,
        ];
    }

    // ======================
    // 📌 INDEX
    // ======================

    /**
     * Menampilkan semua data Penanggung Jawab.
     * Response: { success: true, data: [ ... ] }
     */
    public function index(Request $request)
    {
        $showDeleted = $request->has('show_deleted');

        $data = $this->baseQuery($showDeleted)
            ->orderBy('penanggung_jawab.tanggal')
            ->get()
            ->map(fn($item) => $this->formatItem($item));

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // ======================
    // 📌 SHOW
    // ======================

    /**
     * Menampilkan satu data Penanggung Jawab berdasarkan ID.
     * Response: { success: true, data: { ... } }
     */
    public function show(Request $request, $id)
    {
        $showDeleted = $request->boolean('show_deleted');

        $item = $this->baseQuery($showDeleted)
            ->where('penanggung_jawab.id_penanggung_jawab', $id)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatItem($item),
        ]);
    }

    // ======================
    // 📌 CREATE
    // ======================

    /**
     * Menambahkan data Penanggung Jawab baru.
     * Response sukses (200): { success: true, data: { ... } }
     *
     * ⚠️ CATATAN: Method ini menggunakan `insertGetId()` dan mengembalikan data
     *     langsung dari `baseQuery` (format flat). Ini berbeda dengan `index`/`show`
     *     yang menggunakan format nested. Frontend harus menangani kedua kemungkinan format.
     */
    public function store(Request $request)
    {
        $exists = PenanggungJawab::where('tanggal', $request->tanggal)
            ->where('is_deleted', 0)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Sudah ada jadwal aktif untuk tanggal tersebut.'
            ], 422);
        }

        $request->validate([
            'tanggal'        => 'required|date|unique:penanggung_jawab,tanggal,NULL,id_penanggung_jawab,is_deleted,0',
            'id_perawat'     => [
            'required',
                Rule::exists('paramedic', 'id_paramedic')->where(function ($query) {
                    $query->whereRaw('LOWER(jenis_paramedic) = ?', ['perawat'])
                          ->where('is_deleted', 0);
                }),
            ],
            'id_kepala_jaga' => 'nullable|exists:paramedic,id_paramedic',
            'id_ponek'       => 'nullable|exists:paramedic,id_paramedic',
        ]);

        $id = PenanggungJawab::insertGetId([
            'tanggal'        => $request->tanggal,
            'id_perawat'     => $request->id_perawat,
            'id_kepala_jaga' => $request->id_kepala_jaga,
            'id_ponek'       => $request->id_ponek,
            'created_by'     => Auth::id(),
            'created_at'     => now(),
            'is_deleted'     => 0,
        ]);

        $item = $this->baseQuery()
            ->where('penanggung_jawab.id_penanggung_jawab', $id)
            ->first();

        $this->broadcast([
            'type'    => 'pj-updated',
            'payload' => [
                'type'        => 'create',
                'id'          => $item->id_penanggung_jawab,
                'tanggal'     => $item->tanggal,
                'perawat'     => $item->perawat_nama,
                'kepala_jaga' => $item->kepala_jaga_nama,
                'ponek'       => $item->ponek_nama,
                'created_by'  => $item->created_by,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,   // Format flat dari baseQuery
        ]);
    }

    // ======================
    // 📌 UPDATE
    // ======================

    /**
     * Memperbarui data Penanggung Jawab.
     * Response sukses: { success: true, data: { ... } }
     *
     * ⚠️ CATATAN: Sama seperti `store`, response menggunakan format flat dari `baseQuery`.
     *     Frontend harus menangani perbedaan ini.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'tanggal'        => 'required|date|unique:penanggung_jawab,tanggal,' . $id . ',id_penanggung_jawab,is_deleted,0',
            'id_perawat'     => [
            'required',
                Rule::exists('paramedic', 'id_paramedic')->where(function ($query) {
                    $query->whereRaw('LOWER(jenis_paramedic) = ?', ['perawat'])
                          ->where('is_deleted', 0);
                }),
            ],
            'id_kepala_jaga' => 'nullable|exists:paramedic,id_paramedic',
            'id_ponek'       => 'nullable|exists:paramedic,id_paramedic',
        ]);

        $exists = PenanggungJawab::where('id_penanggung_jawab', $id)
            ->where('is_deleted', 0)
            ->exists();

        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ], 404);
        }

        PenanggungJawab::where('id_penanggung_jawab', $id)->update([
            'tanggal'        => $request->tanggal,
            'id_perawat'     => $request->id_perawat,
            'id_kepala_jaga' => $request->id_kepala_jaga,
            'id_ponek'       => $request->id_ponek,
            'updated_by'     => Auth::id(),
            'updated_at'     => now(),
        ]);

        $item = $this->baseQuery()
            ->where('penanggung_jawab.id_penanggung_jawab', $id)
            ->first();

        $this->broadcast([
            'type'    => 'pj-updated',
            'payload' => [
                'type'        => 'update',
                'id'          => $item->id_penanggung_jawab,
                'tanggal'     => $item->tanggal,
                'perawat'     => $item->perawat_nama,
                'kepala_jaga' => $item->kepala_jaga_nama,
                'ponek'       => $item->ponek_nama,
                'updated_by'  => $item->updated_by,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,   // Format flat dari baseQuery
        ]);
    }

    // ======================
    // 📌 SOFT DELETE
    // ======================

    /**
     * Soft delete data Penanggung Jawab.
     * Response sukses: { success: true, message: "Soft deleted" }
     */
    public function destroy($id)
    {
        $item = PenanggungJawab::where('id_penanggung_jawab', $id)
            ->where('is_deleted', 0)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ], 404);
        }

        $item->update([
            'is_deleted' => 1,
            'deleted_at' => now(),
            'deleted_by' => Auth::id(),
        ]);

        $this->broadcast([
            'type'    => 'pj-updated',
            'payload' => [
                'type'    => 'delete',
                'id'      => (int) $id,
                'tanggal' => $item->tanggal,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Soft deleted',
        ]);
    }

    // ======================
    // 📌 SHOW DELETED
    // ======================

    /**
     * Menampilkan semua data Penanggung Jawab yang sudah di-soft delete.
     * Response: { success: true, total: int, data: [ ... ] }
     */
    public function showDeleted()
    {
        try {
            $data = $this->baseQuery(true)
                ->where('penanggung_jawab.is_deleted', 1)
                ->orderBy('penanggung_jawab.deleted_at', 'desc')
                ->get()
                ->map(fn($item) => $this->formatItem($item));

            return response()->json([
                'success' => true,
                'total'   => $data->count(),
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('PenanggungJawab showDeleted error: ' . $e->getMessage());

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
     * Mengembalikan data Penanggung Jawab yang telah di-soft delete.
     * Response sukses: { success: true, message: "Restored", data: { ... } }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function restore($id)
    {
        try {
            // 🔹 Ambil instance model, bukan boolean
            $deletedItem = PenanggungJawab::where('id_penanggung_jawab', $id)
                ->where('is_deleted', 1)
                ->first();
    
            if (!$deletedItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus',
                ], 404);
            }
    
            // Cek apakah sudah ada data aktif untuk tanggal yang sama
            $existingActive = PenanggungJawab::where('tanggal', $deletedItem->tanggal)
                ->where('is_deleted', 0)
                ->where('id_penanggung_jawab', '!=', $id)
                ->exists();
    
            if ($existingActive) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal merestore: Sudah ada data aktif dengan tanggal yang sama (' . $deletedItem->tanggal . ')',
                ], 422);
            }
    
            // Lakukan restore
            PenanggungJawab::where('id_penanggung_jawab', $id)->update([
                'is_deleted' => 0,
                'deleted_at' => null,
                'deleted_by' => null,
            ]);
    
            $item = $this->baseQuery()
                ->where('penanggung_jawab.id_penanggung_jawab', $id)
                ->first();
    
            $this->broadcast([
                'type'    => 'pj-updated',
                'payload' => [
                    'type' => 'restore',
                    'id'   => $id,
                ],
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Restored',
                'data'    => $this->formatItem($item),
            ]);
        } catch (\Exception $e) {
            Log::error('PenanggungJawab restore error: ' . $e->getMessage());
    
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
     * Hapus permanen data Penanggung Jawab dari database (hard delete).
     * Hanya bisa dilakukan pada data yang sudah di-soft delete terlebih dahulu.
     * Response: { success: true, message: "...", data: id }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function permanentDelete($id)
    {
        try {
            $exists = PenanggungJawab::where('id_penanggung_jawab', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus. Lakukan soft delete terlebih dahulu.',
                ], 404);
            }

            PenanggungJawab::where('id_penanggung_jawab', $id)->delete();

            $this->broadcast([
                'type'    => 'pj-updated',
                'payload' => [
                    'type' => 'permanent_delete',
                    'id'   => $id,
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data penanggung jawab berhasil dihapus permanen',
                'data'    => $id,
            ], 200);
        } catch (\Exception $e) {
            Log::error('PenanggungJawab permanentDelete error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus permanen: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 CALENDAR
    // ======================

    /**
     * Mendapatkan data Penanggung Jawab dalam format kalender.
     * Response: { success: true, data: { "YYYY-MM-DD": { perawat, kepala_jaga, ponek }, ... } }
     */
    public function calendar(Request $request)
    {
        $query = PenanggungJawab::where('is_deleted', 0)
            ->leftJoin('paramedic as perawat', 'penanggung_jawab.id_perawat', '=', 'perawat.id_paramedic')
            ->leftJoin('paramedic as kepala_jaga', 'penanggung_jawab.id_kepala_jaga', '=', 'kepala_jaga.id_paramedic')
            ->leftJoin('paramedic as ponek', 'penanggung_jawab.id_ponek', '=', 'ponek.id_paramedic')
            ->select(
                'penanggung_jawab.tanggal',
                'perawat.nama_paramedic as perawat_nama',
                'kepala_jaga.nama_paramedic as kepala_jaga_nama',
                'ponek.nama_paramedic as ponek_nama'
            );

        if ($request->start && $request->end) {
            $query->whereBetween('tanggal', [$request->start, $request->end]);
        }

        $rows = $query->get();
        $map  = [];

        foreach ($rows as $item) {
            $map[$item->tanggal] = [
                'perawat'     => $item->perawat_nama,
                'kepala_jaga' => $item->kepala_jaga_nama,
                'ponek'       => $item->ponek_nama,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => $map,
        ]);
    }
}