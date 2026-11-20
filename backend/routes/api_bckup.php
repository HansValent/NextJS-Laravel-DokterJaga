<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ParamedicController;
use App\Http\Controllers\posisiController;
use App\Http\Controllers\BagianParamedicController;
use App\Http\Controllers\PenanggungJawabController;
use App\Http\Controllers\JadwalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JadwalController_NEW;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UsersRoleController;
use App\Http\Controllers\UsersPermissionController;
use Illuminate\Http\Request;

/* ================= AUTH ================= */
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request){
    return $request->user();
});

Route::get('/', function () {
    return response()->json([
        'status'=>false,
        'message' => 'Akses tidak diperbolehkan'
    ], 401);
})->name('login');


/* ================= Bagian Paramedic ================= */


Route::get('/bagian-paramedic/view', [BagianParamedicController::class, 'view']);

/* ================= MASTER ================= */

// paramedic (dokter/perawat)
Route::apiResource('paramedic', ParamedicController::class);

// posisi (IGD, ICU, dll)
Route::apiResource('posisi', posisiController::class);

// 🔥 CORE SYSTEM (WAJIB ADA)
Route::apiResource('bagian-paramedic', BagianParamedicController::class);

// penanggung jawab
Route::apiResource('penanggung-jawab', PenanggungJawabController::class);

/* ================= JADWAL ================= */

// CRUD utama
// Route::apiResource('jadwal', JadwalController::class);

Route::post('jadwal', [JadwalController::class, 'store'])->middleware('auth:sanctum');

Route::get('jadwal', [JadwalController::class, 'index']);


Route::get('/jadwal/{id}', [JadwalController::class, 'show']);

// range tanggal (untuk TV / display)
Route::get('/jadwal-range', [JadwalController::class, 'range']);

Route::get('/jadwal-display', [JadwalController::class, 'display']);


/* ================= DROPDOWN / SUPPORT ================= */

// dropdown paramedic
Route::get('/paramedic-dropdown', [ParamedicController::class, 'dropdown']);

// dropdown posisi
Route::get('/posisi-dropdown', [posisiController::class, 'dropdown']);

// dropdown bagian_paramedic
Route::get('/bagian-paramedic-dropdown', [BagianParamedicController::class, 'dropdown']);
