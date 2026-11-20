<?php

namespace App\Http\Controllers;

use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UsersController extends Controller
{
    // ======================
    // 📌 GET ALL USERS
    // ======================

    /**
     * Menampilkan semua user beserta role & permission mereka.
     *
     * Response: {
     *   success: true,
     *   data: [ { id, npk, name, username, status, roles: [...], permissions: [...] }, ... ]
     * }
     */
    public function index()
    {
        $users = Users::with(['roles', 'permissions'])->get();

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    // ======================
    // 📌 GET USER BY ID
    // ======================

    /**
     * Menampilkan satu user berdasarkan ID.
     *
     * Response: {
     *   success: true,
     *   data: { id, npk, name, username, status, roles: [...], permissions: [...] }
     * }
     */
    public function show($id)
    {
        $user = Users::with(['roles', 'permissions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    // ======================
    // 📌 CREATE USER
    // ======================

    /**
     * Membuat user baru.
     * NPK bersifat opsional, role wajib minimal 1.
     *
     * Response sukses (200): {
     *   success: true,
     *   data: { id, npk, name, username, status, roles: [...], permissions: [...] }
     * }
     */
    public function store(Request $request)
    {
        $request->validate([
            'npk'         => 'nullable|string|max:255|unique:users,npk',
            'name'        => 'required|string|max:100',
            'username'    => 'required|string|max:100|unique:users,username',
            'password'    => 'required|string|min:6',
            'status'      => 'required|in:active,inactive',
            'roles'       => 'required|array|min:1',
            'roles.*'     => 'exists:roles,id',
        ]);

        $user = Users::create([
            'npk'      => $request->npk,          // nullable
            'name'     => $request->name,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'status'   => $request->status ?? 'active',
        ]);

        if ($request->roles) {
            $user->roles()->sync($request->roles);
        }

        if ($request->permissions) {
            $user->permissions()->sync($request->permissions);
        }

        return response()->json([
            'success' => true,
            'data'    => $user->load(['roles', 'permissions']),
        ]);
    }

    // ======================
    // 📌 UPDATE USER
    // ======================

    /**
     * Memperbarui data user (NPK, nama, username, status, password opsional).
     *
     * Aturan:
     * - Hanya Super Admin yang bisa mengubah user dengan role Super Admin.
     * - NPK bersifat opsional, harus unik jika diisi.
     *
     * Response sukses: {
     *   success: true,
     *   data: { id, npk, name, username, status, ... }
     * }
     */
    public function update($id, Request $request)
    {
        $user = Users::findOrFail($id);
        /** @var Users|null $currentUser */
        $currentUser = Auth::user();

        if ($user->hasRole('Super Admin') && (!$currentUser || !$currentUser->hasRole('Super Admin'))) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah/hapus user Super Admin',
            ], 403);
        }

        $validated = $request->validate([
            'npk'      => 'nullable|string|max:255|unique:users,npk,' . $id,
            'name'     => 'required|string|max:100',
            'username' => 'required|string|max:100|unique:users,username,' . $id,
            'status'   => 'required|in:active,inactive',
            'password' => 'nullable|string|min:6',
        ]);

        $data = [
            'npk'      => $validated['npk'] ?? $user->npk,  // jika tidak dikirim, pertahankan nilai lama
            'name'     => $validated['name'],
            'username' => $validated['username'],
            'status'   => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = bcrypt($validated['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    // ======================
    // 📌 DELETE USER
    // ======================

    /**
     * Menghapus user secara permanen (hard delete).
     *
     * Aturan:
     * - Hanya Super Admin yang bisa menghapus user dengan role Super Admin.
     *
     * Response sukses: { success: true }
     */
    public function destroy($id)
    {
        /** @var Users|null $user */
        $user = Users::findOrFail($id);
        /** @var Users|null $currentUser */
        $currentUser = Auth::user();

        if ($user->hasRole('Super Admin') && (!$currentUser || !$currentUser->hasRole('Super Admin'))) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus user Super Admin',
            ], 403);
        }

        $user->roles()->detach();
        $user->permissions()->detach();
        $user->delete();

        return response()->json(['success' => true]);
    }
}