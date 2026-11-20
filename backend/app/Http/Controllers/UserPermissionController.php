<?php

namespace App\Http\Controllers;

use App\Models\Users;
use Illuminate\Http\Request;

class UserPermissionController extends Controller
{
    // GET permissions user
    public function index($userId)
    {
        $user = Users::with('permissions')->findOrFail($userId);

        return response()->json([
            'success' => true,
            'data' => $user->permissions
        ]);
    }

    // ASSIGN PERMISSION (OVERRIDE)
    public function store(Request $request, $userId)
    {
        $request->validate([
            'permission_id' => 'required|array'
        ]);

        $user = Users::findOrFail($userId);

        $user->permissions()->syncWithoutDetaching($request->permission_id);

        cache()->forget("user_permissions_{$userId}");

        return response()->json([
            'success' => true,
            'message' => 'Permission assigned to user'
        ]);
    }

    // REMOVE PERMISSION
    public function destroy($userId, $permissionId)
    {
        $user = Users::findOrFail($userId);

        $user->permissions()->detach($permissionId);

        cache()->forget("user_permissions_{$userId}");

        return response()->json([
            'success' => true,
            'message' => 'Permission removed from user'
        ]);
    }
}
