<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run()
    {
        // Pastikan permission 'menu.manage' ada
        Permission::firstOrCreate(
            ['permission_name' => 'menu.manage'],
            ['route' => null]
        );

        // Hapus dulu biar bersih (opsional)
        Menu::truncate();

        $menus = [
            [
                'name' => '📅 Jadwal',
                'icon' => 'calendar',
                'permission' => null,
                'children' => [
                    ['name' => '📅 Lihat Jadwal', 'url' => '/admin', 'permission' => 'jadwal.read'],
                    ['name' => '👨‍⚕️ Input Jadwal', 'url' => '/admin/jadwal', 'permission' => 'jadwal.create,jadwal.update'],
                ]
            ],
            [
                'name' => '👥 Penanggung Jawab',
                'url' => '/admin/penanggungjawab',
                'permission' => 'penanggung_jawab.read'
            ],
            [
                'name' => '🏥 Karyawan',
                'url' => '/admin/paramedic',
                'permission' => 'paramedic.read'
            ],
            [
                'name' => '👩‍⚕️ posisi',
                'url' => '/admin/posisi',
                'permission' => 'posisi.read'
            ],
            [
                'name' => '🧩 Mapping Karyawan',
                'url' => '/admin/bagianparamedic',
                'permission' => 'bagian_paramedic.read'
            ],
            [
                'name' => '🔐 Akses & Pengguna',
                'permission' => 'user.read,role.read,permission.read',
                'children' => [
                    ['name' => 'Users', 'url' => '/admin/RBAC/users', 'permission' => 'user.read'],
                    ['name' => 'Role', 'url' => '/admin/RBAC/roles', 'permission' => 'role.read'],
                    ['name' => 'Permission', 'url' => '/admin/RBAC/permissions', 'permission' => 'permission.read'],
                ]
            ],
        ];

        $this->createMenu($menus, null);
    }

    private function createMenu($items, $parentId)
    {
        foreach ($items as $index => $item) {
            $menu = Menu::create([
                'name'       => $item['name'],
                'icon'       => $item['icon'] ?? null,
                'url'        => $item['url'] ?? null,
                'parent_id'  => $parentId,
                'permission' => $item['permission'] ?? null,
                'order'      => $index,
            ]);

            if (!empty($item['children'])) {
                $this->createMenu($item['children'], $menu->id);
            }
        }
    }
}