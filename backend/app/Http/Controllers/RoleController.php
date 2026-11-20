<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    // ======================
    // 📌 INDEX
    // ======================

    /**
     * Menampilkan semua role.
     * Non-Super Admin tidak dapat melihat role "Super Admin".
     *
     * Response: { success: true, data: [ { id_role, role_name }, ... ] }
     */
    public function index()
    {
        /** @var Users|null $user */
        $user = Auth::user();

        $roles = Role::select('id as id_role', 'role_name');

        if ($user && !$user->hasRole('Super Admin')) {
            $roles = $roles->where('role_name', '!=', 'Super Admin');
        }

        return response()->json([
            'success' => true,
            'data'    => $roles->get(),
        ]);
    }

    // ======================
    // 📌 CREATE
    // ======================

    /**
     * Menambahkan role baru.
     * Hanya Super Admin yang bisa membuat role dengan nama "Super Admin".
     *
     * Response sukses (200): { success: true, data: { ... } }
     * Gagal otorisasi (403): { success: false, message: "..." }
     */
    public function store(Request $request)
    {
        $request->validate([
            'role_name' => 'required|string|max:100',
        ]);

        /** @var Users|null $user */
        $user = Auth::user();

        if ($request->role_name === 'Super Admin' && (!$user || !$user->hasRole('Super Admin'))) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin yang dapat membuat role Super Admin',
            ], 403);
        }

        $role = Role::create([
            'role_name' => $request->role_name,
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $role,
        ]);
    }

    // ======================
    // 📌 SHOW (TIDAK DIGUNAKAN)
    // ======================

    /**
     * Tidak diimplementasikan. Route show tidak terdaftar di api.php.
     */
    public function show(string $id)
    {
        // Tidak digunakan
    }

    // ======================
    // 📌 UPDATE
    // ======================

    /**
     * Memperbarui role.
     * Role "Super Admin" tidak dapat diubah oleh non-Super Admin.
     *
     * Response sukses (200): { success: true, data: { ... } }
     * Gagal otorisasi (403): { success: false, message: "..." }
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'role_name' => 'required|string|max:100',
        ]);

        $role = Role::findOrFail($id);
        /** @var Users|null $user */
        $user = Auth::user();

        if ($role->role_name === 'Super Admin' && (!$user || !$user->hasRole('Super Admin'))) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah role Super Admin',
            ], 403);
        }

        $role->update([
            'role_name' => $request->role_name,
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $role,
        ]);
    }

    // ======================
    // 📌 DELETE
    // ======================

    /**
     * Menghapus role secara permanen (hard delete).
     * Role "Super Admin" tidak dapat dihapus oleh non-Super Admin.
     *
     * Response sukses: { message: "Deleted" }
     * Gagal otorisasi (403): { success: false, message: "..." }
     *
     * ⚠️ CATATAN: Response tidak menyertakan field `success`. Frontend harus
     *     menangani response ini secara spesifik.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        /** @var Users|null $user */
        $user = Auth::user();

        if ($role->role_name === 'Super Admin' && (!$user || !$user->hasRole('Super Admin'))) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus role Super Admin',
            ], 403);
        }

        $role->delete();

        return response()->json(['message' => 'Deleted']);
    }
}