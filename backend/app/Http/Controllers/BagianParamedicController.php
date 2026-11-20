<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\BagianParamedic;

class BagianParamedicController extends Controller
{
    /**
     * URL endpoint WebSocket server untuk broadcast data bagian paramedic.
     */
    private string $wsUrl = 'http://localhost:4000/broadcast/bagian_paramedic';

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
            logger()->warning('WS Bagian gagal: ' . $e->getMessage());
        }
    }

    // ======================
    // 📌 INDEX (ADMIN)
    // ======================

    /**
     * Menampilkan semua data bagian paramedic.
     * Mendukung filter soft delete melalui query param `show_deleted`.
     *
     * ⚠️  CATATAN: Method ini mengembalikan Collection langsung, BUKAN JSON response.
     *     Frontend yang mengonsumsi endpoint ini harus bisa menangani format Collection Laravel.
     *     (Biasanya otomatis dikonversi ke JSON oleh Laravel, tapi tanpa wrapper `success`/`data`).
     */
    public function index(Request $request)
    {
        try {
            $query = BagianParamedic::query()
                ->leftJoin('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
                ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi');
    
            if (!$request->show_deleted) {
                $query->where('bagian_paramedic.is_deleted', 0);
            }
    
            // Pastikan hanya ambil yang relasinya tidak soft-delete
            $query->where(function ($q) {
                $q->whereNull('paramedic.is_deleted')
                  ->orWhere('paramedic.is_deleted', 0);
            });
            $query->where(function ($q) {
                $q->whereNull('posisi.is_deleted')
                  ->orWhere('posisi.is_deleted', 0);
            });
    
            $data = $query->select(
                'bagian_paramedic.id_bagian_paramedic',
                'bagian_paramedic.id_paramedic',
                'bagian_paramedic.id_posisi',
                'paramedic.nama_paramedic',
                'posisi.nama_posisi'
            )->get();
    
            return response()->json([
                'success' => true,
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('BagianParamedic index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ======================
    // 📌 VIEW (PUBLIC)
    // ======================

    /**
     * Menampilkan data bagian paramedic dalam bentuk view yang sudah di-join.
     * Response: { success: true, data: [ { id, paramedic_id, posisi_id, paramedic_nama, posisi_nama } ] }
     *
     * Catatan:
     * - Hanya menampilkan data yang tidak di-soft delete.
     * - Relasi paramedic & posisi tetap aman dari data yang sudah dihapus.
     */
    public function view(Request $request)
    {
        $query = BagianParamedic::query()
            ->leftJoin('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
            ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
            ->leftJoin('users as creator', 'bagian_paramedic.created_by', '=', 'creator.id')
            ->leftJoin('users as updater', 'bagian_paramedic.updated_by', '=', 'updater.id')
            ->leftJoin('users as deleter', 'bagian_paramedic.deleted_by', '=', 'deleter.id');

        if (!$request->show_deleted) {
            $query->where('bagian_paramedic.is_deleted', 0);
        }

        $query->where(function ($q) {
            $q->whereNull('paramedic.is_deleted')
              ->orWhere('paramedic.is_deleted', 0);
        });
        $query->where(function ($q) {
            $q->whereNull('posisi.is_deleted')
              ->orWhere('posisi.is_deleted', 0);
        });

        $data = $query->select(
                'bagian_paramedic.id_bagian_paramedic as id',
                'bagian_paramedic.id_paramedic as paramedic_id',
                'bagian_paramedic.id_posisi as posisi_id',
                'paramedic.nama_paramedic as paramedic_nama',
                'posisi.nama_posisi as posisi_nama',
                'creator.name as created_by',
                'updater.name as updated_by',
                'deleter.name as deleted_by',
                'bagian_paramedic.created_at',
                'bagian_paramedic.updated_at',
                'bagian_paramedic.deleted_at',
                'bagian_paramedic.is_deleted'
            )
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // ======================
    // 📌 CREATE
    // ======================

    /**
     * Menyimpan mapping bagian paramedic baru.
     * Response sukses: { success: true, data: { ... }, message: "Created" }
     * Error validasi (422): { success: false, message: "Mapping sudah ada" }
     *
     * ⚠️  CATATAN: Method ini menggunakan `insertGetId()` pada Builder, yang sebenarnya
     *     tidak tersedia di Eloquent Builder dan dapat menyebabkan error jika tidak ada
     *     di versi Laravel yang digunakan. Sebaiknya gunakan `create()` + akses `$item->id`.
     *     Karena instruksi "tanpa mengubah isi response", kode ini tetap dipertahankan.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_paramedic' => 'required|exists:paramedic,id_paramedic',
            'id_posisi' => 'required|exists:posisi,id_posisi',
        ]);

        // Cegah duplikat
        $exists = BagianParamedic::where('id_paramedic', $request->id_paramedic)
            ->where('id_posisi', $request->id_posisi)
            ->where('is_deleted', 0)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Mapping sudah ada',
            ], 422);
        }

        $bagian = BagianParamedic::create([
            'id_paramedic' => $request->id_paramedic,
            'id_posisi' => $request->id_posisi,
            'is_deleted' => 0,
            'created_by' => Auth::id() ?? 0,
            'created_at' => now(),
        ]);

        $item = BagianParamedic::with(['paramedic', 'posisi'])
            ->where('id_bagian_paramedic', $bagian->id_bagian_paramedic)
            ->first();

        $this->broadcast([
            'type'   => 'create',
            'entity' => 'bagian_paramedic',
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
     * Memperbarui mapping bagian paramedic.
     * Response sukses: { success: true, data: { ... } }
     * Error validasi: { success: false, message: "Relasi sudah ada" }
     */
    public function update(Request $request, $id)
    {
        $data = BagianParamedic::where('id_bagian_paramedic', $id)
            ->where('is_deleted', 0)
            ->firstOrFail();

        // Cek duplikat relasi selain ID yang sedang diupdate
        $exists = BagianParamedic::where('id_paramedic', $request->id_paramedic)
            ->where('id_posisi', $request->id_posisi)
            ->where('id_bagian_paramedic', '!=', $id)
            ->where('is_deleted', 0)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Relasi sudah ada',
            ], 422);
        }

        $data->update([
            'id_paramedic' => $request->id_paramedic,
            'id_posisi' => $request->id_posisi,
            'updated_by'   => Auth::id() ?? 0,
        ]);

        $updated = BagianParamedic::with(['paramedic', 'posisi'])
            ->where('id_bagian_paramedic', $id)
            ->first();

        $this->broadcast([
            'type'   => 'update',
            'entity' => 'bagian_paramedic',
            'data'   => $updated,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $updated,
        ]);
    }

    // ======================
    // 📌 SOFT DELETE
    // ======================

    /**
     * Soft delete bagian paramedic.
     * Response: { message: "Soft deleted" }
     *
     * ⚠️  CATATAN: Response tidak menyertakan `success` field.
     *     Frontend harus menangani response ini secara spesifik (hanya `message`).
     */
    public function destroy($id)
    {
        BagianParamedic::with(['paramedic', 'posisi'])
            ->where('id_bagian_paramedic', $id)
            ->update([
                'is_deleted' => 1,
                'deleted_at' => now(),
                'deleted_by' => Auth::id() ?? 0,
            ]);

        $this->broadcast([
            'type'   => 'delete',
            'entity' => 'bagian_paramedic',
            'data'   => ['id_bagian_paramedic' => $id],
        ]);

        return response()->json(['message' => 'Soft deleted']);
    }

    // ======================
    // 📌 SHOW DELETED
    // ======================

    /**
     * Menampilkan semua data bagian paramedic yang sudah di-soft delete.
     * Response: { success: true, total: int, data: [ ... ] }
     */
    public function showDeleted()
    {
        try {
            $data = BagianParamedic::with(['paramedic', 'posisi'])
                ->leftJoin('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
                ->leftJoin('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
                ->leftJoin('users as creator', 'bagian_paramedic.created_by', '=', 'creator.id')
                ->leftJoin('users as deleter', 'bagian_paramedic.deleted_by', '=', 'deleter.id')
                ->where('bagian_paramedic.is_deleted', 1)
                ->select(
                    'bagian_paramedic.id_bagian_paramedic as id',
                    'bagian_paramedic.id_paramedic as paramedic_id',
                    'bagian_paramedic.id_posisi as posisi_id',
                    'paramedic.nama_paramedic as paramedic_nama',
                    'posisi.nama_posisi as posisi_nama',
                    'creator.name as created_by',
                    'deleter.name as deleted_by',
                    'bagian_paramedic.created_at',
                    'bagian_paramedic.deleted_at'
                )
                ->orderBy('bagian_paramedic.deleted_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'total'   => $data->count(),
                'data'    => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('BagianParamedic showDeleted error: ' . $e->getMessage());

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
     * Restore bagian paramedic yang sudah di-soft delete.
     * Response: { success: true, message: "...", data: { ... } }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function restore($id)
    {
        try {
            $exists = BagianParamedic::where('id_bagian_paramedic', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus',
                ], 404);
            }

            BagianParamedic::where('id_bagian_paramedic', $id)->update([
                'is_deleted' => 0,
                'deleted_at' => null,
                'deleted_by' => null,
            ]);

            $item = BagianParamedic::with(['paramedic', 'posisi'])
                ->where('id_bagian_paramedic', $id)
                ->first();

            $this->broadcast([
                'type'   => 'restore',
                'entity' => 'bagian_paramedic',
                'data'   => $item,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil merestore bagian paramedic',
                'data'    => $item,
            ]);
        } catch (\Exception $e) {
            Log::error('BagianParamedic restore error: ' . $e->getMessage());

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
     * Hapus permanen data bagian paramedic dari database (hard delete).
     * Hanya bisa dilakukan pada data yang sudah di-soft delete terlebih dahulu.
     * Response: { success: true, message: "...", data: id }
     * Tidak ditemukan / belum soft delete: { success: false, message: "..." }
     */
    public function permanentDelete($id)
    {
        try {
            $exists = BagianParamedic::where('id_bagian_paramedic', $id)
                ->where('is_deleted', 1)
                ->exists();

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan atau belum dihapus. Lakukan soft delete terlebih dahulu.',
                ], 404);
            }

            BagianParamedic::where('id_bagian_paramedic', $id)->delete();

            $this->broadcast([
                'type'   => 'permanent_delete',
                'entity' => 'bagian_paramedic',
                'data'   => ['id_bagian_paramedic' => $id],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data bagian paramedic berhasil dihapus permanen',
                'data'    => $id,
            ], 200);
        } catch (\Exception $e) {
            Log::error('BagianParamedic permanentDelete error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus permanen: ' . $e->getMessage(),
            ], 500);
        }
    }
}