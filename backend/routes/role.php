<php

use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePermissionController;

//
// ======================
// USERS
// ======================
//
Route::get('/users', [UserController::class, 'index']);
Route::put('/users/{id}', [UserController::class, 'update']);

//
// ======================
// ROLES
// ======================
//
Route::get('/roles', [RoleController::class, 'index']);

//
// ======================
// PERMISSIONS
// ======================
//
Route::get('/permissions', [PermissionController::class, 'index']);

//
// ======================
// ROLE PERMISSIONS
// ======================
//
Route::get('/role-permissions', [RolePermissionController::class, 'index']);
Route::put('/role-permissions/{role_id}', [RolePermissionController::class, 'update']);
