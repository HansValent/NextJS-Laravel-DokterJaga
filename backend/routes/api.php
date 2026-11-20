<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/* ================= CONTROLLERS ================= */
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\ParamedicController;
use App\Http\Controllers\PosisiController;
use App\Http\Controllers\BagianParamedicController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\PenanggungJawabController;
use App\Http\Controllers\JadwalController;
use App\Http\Controllers\KategoriPosisiController;
use App\Http\Controllers\MenuController;

use App\Http\Controllers\ImportController;
use App\Http\Controllers\ImportTemplateController;
use App\Http\Controllers\KategoriPosisiController as ControllersKategoriPosisiController;
use App\Http\Controllers\KategoriSpesialisController;


Route::get('/jadwal/mod', [JadwalController::class, 'modData']);


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (tanpa autentikasi)
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('login/with-token', [AuthController::class, 'loginWithToken']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ------------------------- AUTH -------------------------
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('/user', fn(Request $request) => $request->user());

    // Permissions milik user yang sedang login
    Route::get('/me/permissions', function (Request $request) {
        return $request->user()
            ->getAllPermissions()
            ->pluck('permission_name')
            ->values();
    });

    // ------------------------- IMPORT -------------------------
    Route::prefix('import')->controller(ImportController::class)->group(function () {
        Route::post('jadwal/preview', 'previewJadwal')->middleware('permission:jadwal.create');
        Route::post('jadwal/process', 'importJadwal')->middleware('permission:jadwal.create');
        Route::post('paramedic', 'importParamedic')->middleware('permission:paramedic.create');
        Route::post('paramedic/preview', 'previewParamedic')->middleware('permission:paramedic.create');
    });

    // Template mapping
    Route::apiResource('import-templates', ImportTemplateController::class)
        ->only(['index', 'store', 'destroy']);

    // ------------------------- EXPORT -------------------------    
    Route::prefix('export')->controller(ExportController::class)->group(function () {
        Route::get('template-jadwal', 'exportTemplateJadwal');
        Route::get('template-paramedic', 'exportDataParamedic');
    });

    // ------------------------- USERS -------------------------
    Route::prefix('users')->controller(UsersController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:user.read');
        Route::post('/', 'store')->middleware('permission:user.create');
        Route::get('{id}', 'show')->middleware('permission:user.read');
        Route::put('{id}', 'update')->middleware('permission:user.update');
        Route::delete('{id}', 'destroy')->middleware('permission:user.delete');
    });

    // ------------------------- ROLES -------------------------
    Route::prefix('roles')->controller(RoleController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:role.read');
        Route::post('/', 'store')->middleware('permission:role.create');
        Route::put('{id}', 'update')->middleware('permission:role.update');
        Route::delete('{id}', 'destroy')->middleware('permission:role.delete');
    });

    // ------------------------- PERMISSIONS -------------------------
    Route::prefix('permissions')->controller(PermissionController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:permission.read');
        Route::post('/', 'store')->middleware('permission:permission.create');
        Route::put('{id}', 'update')->middleware('permission:permission.update');
        Route::delete('{id}', 'destroy')->middleware('permission:permission.delete');
    });

    // ------------------------- ROLE PERMISSION -------------------------
    Route::prefix('role-permission')->controller(RolePermissionController::class)->group(function () {
        Route::get('{roleId}', 'index')->middleware('permission:role_permission.read');
        Route::post('{roleId}', 'store')->middleware('permission:role_permission.update');
        Route::delete('{roleId}/{permissionId}', 'destroy')->middleware('permission:role_permission.delete');
    });

    // ------------------------- USER ROLE -------------------------
    Route::prefix('user-role')->controller(UserRoleController::class)->group(function () {
        Route::get('{userId}', 'index')->middleware('permission:user_role.read');
        Route::post('{userId}', 'update')->middleware('permission:user_role.update');
        Route::delete('{userId}/{roleId}', 'destroy')->middleware('permission:user_role.delete');
    });

    // ------------------------- USER PERMISSION (OVERRIDE) -------------------------
    Route::prefix('user-permission')->controller(UserPermissionController::class)->group(function () {
        Route::get('{userId}', 'index')->middleware('permission:user_permission.read');
        Route::post('{userId}', 'store')->middleware('permission:user_permission.update');
        Route::delete('{userId}/{permissionId}', 'destroy')->middleware('permission:user_permission.delete');
    });

    // ------------------------- PARAMEDIC -------------------------
    Route::prefix('paramedic')->controller(ParamedicController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:paramedic.read');
        Route::post('/', 'store')->middleware('permission:paramedic.create');
        Route::put('{id}', 'update')->middleware('permission:paramedic.update');
        Route::delete('{id}', 'destroy')->middleware('permission:paramedic.delete');
        Route::put('restore/{id}', 'restore')->middleware('permission:paramedic.restore');
        Route::delete('/{id}/permanent', 'permanentDelete')->middleware('permission:paramedic.destroy');
    });

    // ------------------------- posisi -------------------------
    Route::prefix('posisi')->controller(PosisiController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:posisi.read');
        Route::post('/', 'store')->middleware('permission:posisi.create');
        Route::put('{id}', 'update')->middleware('permission:posisi.update');
        Route::delete('{id}', 'destroy')->middleware('permission:posisi.delete');
        Route::put('restore/{id}', 'restore')->middleware('permission:posisi.restore');
        Route::post('reorder', 'reorder')->middleware('permission:posisi.reorder');
        Route::delete('/{id}/permanent', 'permanentDelete')->middleware('permission:posisi.destroy');
    });

    // ------------------------- KATEGORI posisi -------------------------
    Route::prefix('kategori-posisi')
        ->controller(ControllersKategoriPosisiController::class)
        ->middleware('permission:kategori_posisi.manage')
        ->group(function () {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::put('{id}', 'update');
            Route::delete('{id}', 'destroy');
        });

    // ------------------------- BAGIAN PARAMEDIC -------------------------
    Route::prefix('bagian-paramedic')->controller(BagianParamedicController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:bagian_paramedic.read');
        Route::get('/view', 'view')->middleware('permission:bagian_paramedic.read');
        Route::post('/', 'store')->middleware('permission:bagian_paramedic.create');
        Route::put('{id}', 'update')->middleware('permission:bagian_paramedic.update');
        Route::delete('{id}', 'destroy')->middleware('permission:bagian_paramedic.delete');
        Route::put('restore/{id}', 'restore')->middleware('permission:bagian_paramedic.restore');
        Route::delete('/{id}/permanent', 'permanentDelete')->middleware('permission:bagian_paramedic.destroy');
    });

    // ------------------------- PENANGGUNG JAWAB -------------------------
    Route::prefix('penanggung_jawab')->controller(PenanggungJawabController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:penanggung_jawab.read');
        Route::get('{id}', 'show')->middleware('permission:penanggung_jawab.read');
        Route::post('/', 'store')->middleware('permission:penanggung_jawab.create');
        Route::put('{id}', 'update')->middleware('permission:penanggung_jawab.update');
        Route::delete('{id}', 'destroy')->middleware('permission:penanggung_jawab.delete');
        Route::put('restore/{id}', 'restore')->middleware('permission:penanggung_jawab.restore');
        Route::delete('/{id}/permanent', 'permanentDelete')->middleware('permission:penanggung_jawab.destroy');
    });

    // ------------------------- JADWAL -------------------------
    Route::prefix('jadwal')->controller(JadwalController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:jadwal.read');
        Route::get('/jadwal-deleted','showDeleted')->middleware('permission:jadwal.read');
        Route::get('{id}', 'show')->middleware('permission:jadwal.read');
        Route::post('/', 'store')->middleware('permission:jadwal.create');
        Route::put('{id}', 'update')->middleware('permission:jadwal.update');
        Route::delete('{id}', 'destroy')->middleware('permission:jadwal.delete');
        Route::put('restore/{id}', 'restore')->middleware('permission:jadwal.restore');
        Route::post('copy-week', 'copyWeek')->middleware('permission:jadwal.create');
        Route::post('copy-day', 'copyDay')->middleware('permission:jadwal.create');
        Route::delete('/{id}/permanent', 'permanentDelete')->middleware('permission:jadwal.destroy');
    });

    // ------------------------- MENU (ADMIN) -------------------------
    Route::prefix('admin/menus')->controller(MenuController::class)->group(function () {
        Route::get('/', 'index')->middleware('permission:menu.manage');
        Route::post('/', 'store')->middleware('permission:menu.manage');
        Route::put('/{id}', 'update')->middleware('permission:menu.manage');
        Route::delete('/{id}', 'destroy')->middleware('permission:menu.manage');
    });

    // ------------------------- MENU (USER SIDEBAR) -------------------------
    Route::get('/me/menus', [MenuController::class, 'userMenu']);
});

/*
|--------------------------------------------------------------------------
| PUBLIC DISPLAY ROUTES (tanpa autentikasi, untuk halaman publik)
|--------------------------------------------------------------------------
*/
Route::get('jadwalDisplay', [JadwalController::class, 'index']);
Route::get('paramedicDisplay', [ParamedicController::class, 'index']);
Route::get('posisiDisplay', [PosisiController::class, 'index']);
Route::get('bagian-paramedicDisplay', [BagianParamedicController::class, 'view']);
Route::get('penanggung-jawabDisplay', [PenanggungJawabController::class, 'index']);
Route::get('penanggung-jawabCalendar', [PenanggungJawabController::class, 'calendar']);


/*
|--------------------------------------------------------------------------
| DEBUG / DELETED DATA
|--------------------------------------------------------------------------
*/
Route::get('/posisi-deleted', [PosisiController::class, 'showDeleted']);
Route::get('/paramedic-deleted', [ParamedicController::class, 'showDeleted']);
Route::get('/jadwal-deleted', [JadwalController::class, 'showDeleted']);
Route::get('/pj-deleted', [PenanggungJawabController::class, 'showDeleted']);