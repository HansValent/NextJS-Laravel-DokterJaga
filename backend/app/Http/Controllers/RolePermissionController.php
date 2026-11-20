<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    // ======================
    // 📌 GET PERMISSIONS BY ROLE
    // ======================

    /**
     * Mendapatkan semua permission yang terpasang pada suatu role.
     *
     * Response: {
     *   success: true,
     *   data: [ { id_permission, permission_name }, ... ]
     * }
     */
    public function index($roleId)
    {
        $role = Role::with('permissions')->findOrFail($roleId);

        return response()->json([
            'success' => true,
            'data'    => $role->permissions->map(function ($p) {
                return [
                    'id_permission'   => $p->id,
                    'permission_name' => $p->permission_name,
                ];
            }),
        ]);
    }

    // ======================
    // 📌 SYNC PERMISSION KE ROLE
    // ======================

    /**
     * Mengganti seluruh permission yang terpasang pada role (sync).
     * Input: { permissions: [1, 2, 3, ...] }
     *
     * Response: {
     *   success: true,
     *   message: "Permission berhasil disimpan",
     *   data: [ { id_permission, permission_name }, ... ]
     * }
     */
    public function store(Request $request, $roleId)
    {
        $request->validate([
            'permissions'   => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::findOrFail($roleId);

        // Sync — mengganti semua permission sekaligus
        $role->permissions()->sync($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil disimpan',
            'data'    => $role->permissions->map(function ($p) {
                return [
                    'id_permission'   => $p->id,
                    'permission_name' => $p->permission_name,
                ];
            }),
        ]);
    }

    // ======================
    // 📌 REMOVE 1 PERMISSION
    // ======================

    /**
     * Menghapus satu permission dari role.
     *
     * Response: {
     *   success: true,
     *   message: "Permission berhasil dihapus"
     * }
     */
    public function destroy($roleId, $permissionId)
    {
        $role = Role::findOrFail($roleId);

        $role->permissions()->detach($permissionId);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dihapus',
        ]);
    }
}