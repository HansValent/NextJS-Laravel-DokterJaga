<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ADMIN CRUD
    |--------------------------------------------------------------------------
    |
    | Method untuk mengelola data menu oleh admin.
    | Route terkait: /api/admin/menus/...
    | Middleware: auth:sanctum + permission:menu.manage
    */

    /**
     * Mendapatkan seluruh menu (hierarki) untuk admin.
     * Response: { success: true, data: [Menu dengan children] }
     */
    public function index()
    {
        $menus = Menu::with('children')
            ->root()              // scope: hanya menu tanpa parent
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $menus,
        ]);
    }

    /**
     * Menambahkan menu baru.
     * Response: { success: true, data: Menu }
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'icon'       => 'nullable|string',
            'url'        => 'nullable|string',
            'parent_id'  => 'nullable|exists:menus,id',
            'permission' => 'nullable|string',
            'order'      => 'integer',
        ]);

        $menu = Menu::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $menu,
        ]);
    }

    /**
     * Memperbarui menu yang sudah ada.
     * Response: { success: true, data: Menu }
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'icon'       => 'nullable|string',
            'url'        => 'nullable|string',
            'parent_id'  => 'nullable|exists:menus,id|not_in:' . $id,
            'permission' => 'nullable|string',
            'order'      => 'integer',
        ]);

        $menu->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $menu,
        ]);
    }

    /**
     * Menghapus menu beserta anak-anaknya.
     * Response: { success: true }
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);

        // Hapus semua child menu terlebih dahulu
        $menu->children()->delete();
        $menu->delete();

        return response()->json(['success' => true]);
    }

    /*
    |--------------------------------------------------------------------------
    | USER SIDEBAR
    |--------------------------------------------------------------------------
    |
    | Method untuk menampilkan menu yang sesuai dengan permission
    | pengguna yang sedang login.
    | Route: /api/me/menus
    | Middleware: auth:sanctum
    */

    /**
     * Mendapatkan menu sidebar untuk user yang sedang login.
     * Hanya menu yang user-nya memiliki permission yang ditampilkan.
     *
     * Response: { success: true, data: [Menu yang sudah difilter] }
     */
    public function userMenu(Request $request)
    {
        $user = $request->user();

        // Jika user tidak ditemukan (seharusnya sudah dicegah oleh auth middleware)
        if (!$user) {
            return response()->json(['success' => false, 'data' => []], 401);
        }

        $allMenus = Menu::with('children')
            ->root()
            ->get();

        // Filter menu sesuai permission user
        $filtered = $allMenus->filter(function ($menu) use ($user) {
            return $this->checkMenuPermission($menu, $user);
        })->map(function ($menu) use ($user) {
            // Filter juga children-nya
            if ($menu->children) {
                $menu->children = $menu->children->filter(function ($child) use ($user) {
                    return $this->checkMenuPermission($child, $user);
                })->values();
            }
            return $menu;
        })->values();

        return response()->json([
            'success' => true,
            'data'    => $filtered,
        ]);
    }

    /**
     * Mengecek apakah user memiliki permission untuk mengakses suatu menu.
     *
     * @param  Menu  $menu
     * @param  \App\Models\Users  $user
     * @return bool
     */
    private function checkMenuPermission($menu, $user)
    {
        // Super Admin selalu bisa melihat semua menu
        if ($user->roles()->where('role_name', 'Super Admin')->exists()) {
            return true;
        }

        // Menu tanpa permission bersifat publik (semua user bisa lihat)
        if (empty($menu->permission)) {
            return true;
        }

        // Permission bisa berisi satu atau lebih (dipisahkan koma)
        $required = array_map('trim', explode(',', $menu->permission));

        foreach ($required as $perm) {
            if ($user->hasPermission($perm)) {
                return true;
            }
        }

        return false;
    }
}