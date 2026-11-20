<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class KategoriPosisiController extends Controller
{
    /**
     * Menampilkan semua kategori posisi, diurutkan berdasarkan kolom `urutan`.
     *
     * Response:
     * {
     *   success: true,
     *   data: [ { id, nama_kategori, urutan, ... }, ... ]
     * }
     */
    public function index()
    {
        $data = DB::table('kategori_posisi')
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Menambahkan kategori posisi baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:100',
            'urutan'        => 'nullable|integer|min:1',
        ]);

        // Tentukan urutan otomatis jika tidak diisi
        $urutan = $request->urutan;
        if (!$urutan) {
            $maxUrutan = DB::table('kategori_posisi')->max('urutan');
            $urutan = $maxUrutan ? $maxUrutan + 1 : 1;
        }

        $id = DB::table('kategori_posisi')->insertGetId([
            'nama_kategori' => $request->nama_kategori,
            'urutan'        => $urutan,
            'is_deleted'    => 0,
            'created_by'    => Auth::id() ?? 0,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        $item = DB::table('kategori_posisi')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Kategori berhasil ditambahkan',
        ]);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Memperbarui kategori posisi.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:100',
            'urutan'        => 'nullable|integer|min:1',
        ]);

        $exists = DB::table('kategori_posisi')->where('id', $id)->exists();
        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        DB::table('kategori_posisi')->where('id', $id)->update([
            'nama_kategori' => $request->nama_kategori,
            'urutan'        => $request->urutan,
            'updated_by'    => Auth::id() ?? 0,
            'updated_at'    => now(),
        ]);

        $item = DB::table('kategori_posisi')->where('id', $id)->first();

        return response()->json([
            'success' => true,
            'data'    => $item,
            'message' => 'Kategori berhasil diperbarui',
        ]);
    }

    /**
     * Soft delete kategori posisi.
     */
    public function destroy(string $id)
    {
        $exists = DB::table('kategori_posisi')->where('id', $id)->exists();
        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        DB::table('kategori_posisi')->where('id', $id)->update([
            'is_deleted' => 1,
            'deleted_at' => now(),
            'deleted_by' => Auth::id() ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
