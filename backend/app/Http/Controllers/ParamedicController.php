<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Paramedic;

class ParamedicController extends Controller
{
    /**
     * URL endpoint WebSocket server untuk broadcast data paramedic.
     */
    private string $wsUrl = 'http://localhost:4000/broadcast/paramedic';

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
            logger()->warning('WS Paramedic gagal: ' . $e->getMessage());
        }
    }

    /**
     * Base query untuk mengambil data paramedic beserta informasi creator/updater/deleter.
     *
     * @param  bool  $showDeleted  Sertakan data yang sudah di-soft delete?
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function baseQuery(bool $showDeleted = false)
    {
        $query = Paramedic::query()
            ->leftJoin('users as creator', 'paramedic.created_by', '=', 'creator.id')
            ->leftJoin('users as updater', 'paramedic.updated_by', '=', 'updater.id')
            ->leftJoin('users as deleter', 'paramedic.deleted_by', '=', 'deleter.id')
            ->select(
                'paramedic.id_paramedic as id',
                'paramedic.nama_paramedic',
                'paramedic.npk',
                'paramedic.jenis_paramedic',
                'paramedic.is_deleted',
                'paramedic.created_at',
                'paramedic.updated_at',
                'paramedic.deleted_at',
                'creator.name as created_by',
                'updater.name as updated_by',
                'deleter.name as deleted_by'
            );

        if (!$showDeleted) {
            $query->where('paramedic.is_deleted', 0);
        }

        return $query;
    }

    // ======================
    // 📌 INDEX
    // ======================

    /**
     * Menampilkan semua data paramedic.
     * Response: { success: true, data: [ ... ] }
     */
    public function index(Request $request)
    {
        $showDeleted = $request->boolean('show_deleted');

        $data = $this->baseQuery($showDeleted)
            ->orderBy('paramedic.nama_paramedic')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // ======================
    // 📌 SHOW
    // ======================

    /**
     * Menampilkan satu data paramedic berdasarkan ID.
     * Response sukses: { success: true, data: { ... } }
     * Tidak ditemukan:  { success: false, message: "Data not found" }
     */
    public function show(Request $request, $id)
    {
        $showDeleted = $request->boolean('show_deleted');

        $item = $this->baseQuery($showDeleted)
            ->where('paramedic.id_paramedic', $id)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $item,
        ]);
    }

    // ======================
    // 📌 CREATE
    // ======================

    /**
     * Menambahkan data paramedic baru.
     * Response sukses (200): { success: true, data: { ... }, message: "Created" }
     *
     * ⚠️ CATATAN: Method ini menggunakan `insertGetId()` pada Eloquent Builder.
     *     Di beberapa versi Laravel, ini bisa error. Idealnya gunakan `create()`.
     *     Karena instruksi "tidak mengubah isi response", kode ini tetap dipertahankan.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_paramedic'  => 'required|string|max:255',
            'npk'             => 'nullable|string|max:255|unique:paramedic,npk',
            'jenis_paramedic' => 'nullable|string|max:100',
        ]);

        $id = Paramedic::insertGetId([
            'nama_paramedic'  => $request->nama_paramedic,
            'npk'             => $request->npk, 
            'jenis_paramedic' => $request->jenis_paramedic,
            'is_deleted'      => 0,
            'created_by'      => Auth::id() ?? 0,
            'created_at'      => now(),
        ]);

        $item = $this->baseQuery()
            ->where('paramedic.id_paramedic', $id)
            ->first();

        $this->broadcast([
            'type'   => 'create',
            'entity' => 'paramedic',
            'data'   => $item,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Created',
        ]);
    }

    // ======================
    // 📌 UPDATE
    // ======================

    /**
     * Memperbarui data paramedic.
     * Response sukses: { success: true, data: { ... }, message: "Updated" }
     * Tidak ditemukan: { success: false, message: "Data not found" }
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_paramedic'  => 'required|string|max:255',
            'npk'             => 'nullable|string|max:255|unique:paramedic,npk,'.$id.',id_paramedic',
            'jenis_paramedic' => 'nullable|string|max:100',
        ]);

        $exists = Paramedic::where('id_paramedic', $id)
            ->where('is_deleted', 0)
            ->exists();

        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ], 404);
        }

        Paramedic::where('id_paramedic', $id)->update([
            'nama_paramedic'  => $request->nama_paramedic,
            'npk'             => $request->npk,
            'jenis_paramedic' => $request->jenis_paramedic,
            'updated_by'      => Auth::id() ?? 0,
            'updated_at'      => now(),
        ]);

        $item = $this->baseQuery()
            ->where('paramedic.id_paramedic', $id)
            ->first();

        $this->broadcast([
            'type'   => 'update',
            'entity' => 'paramedic',
            'data'   => $item,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Updated',
        ]);
    }

    // ======================
    // 📌 SOFT DELETE
    // ======================

    /**
     * Soft delete data paramedic.
     * Response sukses: { success: true, message: "Soft deleted" }
     * Tidak ditemukan: { success: false, message: "Data not found" }
     */
    public function destroy($id)
    {
        $exists = Paramedic::where('id_paramedic', $id)
            ->where('is_deleted', 0)
            ->exists();

        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ], 404);
        }

        Paramedic::where('id_paramedic', $id)->update([
            'is_deleted' => 1,
            'deleted_at' => now(),
            'deleted_by' => Auth::id() ?? 0,
        ]);

        $this->broadcast([
            'type'   => 'delete',
            'entity' => 'paramedic',
            'data'   => ['id_paramedic' => $id],
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
     * Menampilkan semua data paramedic yang sudah di-soft delete.
     * Response: { success: true, total: int, data: [ ... ] }
     */
    public function showDeleted()
    {
        try {
            $data = $this->baseQuery(true)
                ->where('paramedic.is_deleted', 1)
                ->orderBy('paramedic.deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'total'   => $data->count(),
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Paramedic showDeleted error: ' . $e->getMessage());

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
     * Mengembalikan data paramedic yang telah di-soft delete.
     * Response sukses: { success: true, message: "Restored", data: { ... } }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function restore($id)
    {
        try {
            $exists = Paramedic::where('id_paramedic', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus',
                ], 404);
            }

            Paramedic::where('id_paramedic', $id)->update([
                'is_deleted' => 0,
                'deleted_at' => null,
                'deleted_by' => null,
            ]);

            $item = $this->baseQuery()
                ->where('paramedic.id_paramedic', $id)
                ->first();

            $this->broadcast([
                'type'   => 'restore',
                'entity' => 'paramedic',
                'data'   => ['id_paramedic' => $id],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Restored',
                'data'    => $item,
            ]);
        } catch (\Exception $e) {
            Log::error('Paramedic restore error: ' . $e->getMessage());

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
     * Hapus permanen data paramedic dari database (hard delete).
     * Hanya bisa dilakukan pada data yang sudah di-soft delete terlebih dahulu.
     * Response: { success: true, message: "...", data: id }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function permanentDelete($id)
    {
        try {
            $exists = Paramedic::where('id_paramedic', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus. Lakukan soft delete terlebih dahulu.',
                ], 404);
            }

            Paramedic::where('id_paramedic', $id)->delete();

            $this->broadcast([
                'type'   => 'permanent_delete',
                'entity' => 'paramedic',
                'data'   => ['id_paramedic' => $id],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data paramedic berhasil dihapus permanen',
                'data'    => $id,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Paramedic permanentDelete error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus permanen: ' . $e->getMessage(),
            ], 500);
        }
    }
}