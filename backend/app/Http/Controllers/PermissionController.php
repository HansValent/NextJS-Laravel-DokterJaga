<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PermissionController extends Controller
{
    // ======================
    // 📌 INDEX
    // ======================

    /**
     * Menampilkan semua permission.
     * Response: { success: true, data: [ { id_permission, permission_name, route }, ... ] }
     *
     * ⚠️ CATATAN: Kolom `id` di-tampilkan sebagai `id_permission` agar tidak bentrok
     *     dengan kemungkinan pemakaian nama `id` di frontend.
     */
    public function index()
    {
        $data = Permission::select(
            'id as id_permission',
            'permission_name',
            'route'
        )->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // ======================
    // 📌 CREATE
    // ======================

    /**
     * Menambahkan permission baru.
     * Response sukses (200): { success: true, data: { ... } }
     * Error validasi (422): { success: false, message: { ... } }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'permission_name' => 'required|string|max:255|unique:permissions,permission_name',
            'route'           => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
            ], 422);
        }

        $permission = Permission::create([
            'permission_name' => $request->permission_name,
            'route'           => $request->route,
            'created_by'      => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $permission,
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
     * Memperbarui permission.
     * Response sukses (200): { success: true, data: { ... } }
     * Error validasi (422): { success: false, message: { ... } }
     */
    public function update(Request $request, string $id)
    {
        $permission = Permission::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'permission_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('permissions', 'permission_name')->ignore($id),
            ],
            'route' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
            ], 422);
        }

        $permission->update([
            'permission_name' => $request->permission_name,
            'route'           => $request->route,
            'updated_by'      => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $permission,
        ]);
    }

    // ======================
    // 📌 DELETE
    // ======================

    /**
     * Menghapus permission secara permanen (hard delete).
     * Response sukses: { message: "Deleted" }
     *
     * ⚠️ CATATAN: Response tidak menyertakan field `success`. Frontend harus
     *     menangani response ini secara spesifik.
     */
    public function destroy(string $id)
    {
        Permission::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted']);
    }
}