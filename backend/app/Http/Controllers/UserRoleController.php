<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserRoleController extends Controller
{
    // ======================
    // 📌 GET ROLES BY USER
    // ======================

    /**
     * Mendapatkan semua role yang dimiliki seorang user.
     *
     * Response: {
     *   success: true,
     *   data: [ { id_role, role_name }, ... ]
     * }
     */
    public function index($userId)
    {
        $user = Users::findOrFail($userId);

        $roles = $user->roles()->select(
            'roles.id as id_role',
            'roles.role_name'
        )->get();

        return response()->json([
            'success' => true,
            'data'    => $roles,
        ]);
    }

    // ======================
    // 📌 ASSIGN / SYNC ROLE
    // ======================

    /**
     * Mengganti seluruh role user (sync).
     *
     * Aturan:
     * - Hanya Super Admin yang bisa mengubah role user Super Admin.
     * - Non-Super Admin tidak dapat memberikan role Super Admin kepada siapapun.
     *
     * Response sukses: {
     *   success: true,
     *   message: "Role updated",
     *   data: [ { id_role, role_name }, ... ]
     * }
     */
    public function update(Request $request, $userId)
    {
        $request->validate([
            'roles'   => 'required|array|min:1',
            'roles.*' => 'required|integer|exists:roles,id',
        ]);

        $user = Users::findOrFail($userId);
        /** @var Users|null $currentUser */
        $currentUser = Auth::user();

        // Proteksi: tidak bisa mengubah role user Super Admin oleh non-Super Admin
        if ($user->hasRole('Super Admin') && (!$currentUser || !$currentUser->hasRole('Super Admin'))) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah role user Super Admin',
            ], 403);
        }

        // Proteksi: non-Super Admin tidak bisa memberikan role Super Admin
        if (!$currentUser->hasRole('Super Admin')) {
            $rolesToAssign = Role::whereIn('id', $request->roles)->pluck('role_name');
            if ($rolesToAssign->contains('Super Admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Super Admin yang dapat memberikan role Super Admin',
                ], 403);
            }
        }

        // Sanitasi role IDs (buang nilai null/kosong, pastikan integer)
        $roleIds = collect($request->roles)
            ->filter(fn($id) => !is_null($id) && $id !== '' && is_numeric($id))
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values()
            ->toArray();

        if (empty($roleIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak valid',
            ], 422);
        }

        // Sync roles (ganti semua role yang sudah ada dengan input baru)
        $user->roles()->sync($roleIds);

        // Hapus cache permission user agar segera diperbarui
        cache()->forget("user_permissions_{$userId}");

        return response()->json([
            'success' => true,
            'message' => 'Role updated',
            'data'    => $user->roles()->select(
                'roles.id as id_role',
                'roles.role_name'
            )->get(),
        ]);
    }

    // ======================
    // 📌 REMOVE ROLE
    // ======================

    /**
     * Melepas satu role dari user.
     *
     * Aturan:
     * - Role Super Admin hanya bisa dilepas oleh sesama Super Admin.
     *
     * Response sukses: { success: true, message: "Role removed" }
     */
    public function destroy($userId, $roleId)
    {
        $user = Users::findOrFail($userId);
        /** @var Users|null $currentUser */
        $currentUser = Auth::user();
        $role = Role::findOrFail($roleId);

        if ($role->role_name === 'Super Admin' && !$currentUser->hasRole('Super Admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus role Super Admin dari user',
            ], 403);
        }

        $user->roles()->detach($roleId);

        cache()->forget("user_permissions_{$userId}");

        return response()->json([
            'success' => true,
            'message' => 'Role removed',
        ]);
    }
}