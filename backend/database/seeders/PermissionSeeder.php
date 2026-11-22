<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::insert([
            ['permission_name' => 'POST_USER', 'route' => '/users/store'],
            ['permission_name' => 'GET_USER', 'route' => '/users'],
            ['permission_name' => 'PUT_USER', 'route' => '/users/update'],
            ['permission_name' => 'DELETE_USER', 'route' => '/users/delete'],

            //ROLE
            ['permission_name' => 'POST_ROLE', 'route' => '/roles/store'],
            ['permission_name' => 'GET_ROLE', 'route' => '/roles'],
            ['permission_name' => 'PUT_ROLE', 'route' => '/roles/update'],
            ['permission_name' => 'DELETE_ROLE', 'route' => '/roles/delete'],

            //PERMISSION
            ['permission_name' => 'POST_PERMISSION', 'route' => '/permission/store'],
            ['permission_name' => 'GET_PERMISSION', 'route' => '/permission'],
            ['permission_name' => 'PUT_PERMISSION', 'route' => '/permission/update'],
            ['permission_name' => 'DELETE_PERMISSION', 'route' => '/permission/delete'],
            
            //JADWAL
            ['permission_name' => 'POST_JADWAL', 'route' => '/jadwal/store'],
            ['permission_name' => 'GET_JADWAL', 'route' => '/jadwal'],
            ['permission_name' => 'PUT_JADWAL', 'route' => '/jadwal/update'],
            ['permission_name' => 'DELETE_JADWAL', 'route' => '/jadwal/delete'],

            //BAGIAN PARAMEDIC
            ['permission_name' => 'POST_BAGIANPARAMEDIC', 'route' => '/bagian-paramedic/store'],
            ['permission_name' => 'GET_BAGIANPARAMEDIC', 'route' => '/bagian-paramedic'],
            ['permission_name' => 'PUT_BAGIANPARAMEDIC', 'route' => '/bagian-paramedic/update'],
            ['permission_name' => 'DELETE_BAGIANPARAMEDIC', 'route' => '/bagian-paramedic/delete'],

            //PARAMEDIC
            ['permission_name' => 'POST_PARAMEDIC', 'route' => '/paramedic/store'],
            ['permission_name' => 'GET_PARAMEDIC', 'route' => '/paramedic'],
            ['permission_name' => 'PUT_PARAMEDIC', 'route' => '/paramedic/update'],
            ['permission_name' => 'DELETE_PARAMEDIC', 'route' => '/paramedic/delete'],

            //posisi
            ['permission_name' => 'POST_posisi', 'route' => '/posisi/store'],
            ['permission_name' => 'GET_posisi', 'route' => '/posisi'],
            ['permission_name' => 'PUT_posisi', 'route' => '/posisi/update'],
            ['permission_name' => 'DELETE_posisi', 'route' => '/posisi/delete'],
        ]);
    }
}
