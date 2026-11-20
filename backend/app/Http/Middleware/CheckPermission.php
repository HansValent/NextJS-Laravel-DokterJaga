<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$permissions  Daftar permission yang diizinkan (OR logic)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle($request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        // 1. Pastikan user sudah terautentikasi
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // 2. Super Admin selalu diizinkan (bypass semua permission)
        if ($user->roles()->where('role_name', 'Super Admin')->exists()) {
            return $next($request);
        }

        // 3. Ambil semua permission user (dengan caching 5 menit)
        try {
            $cacheKey = "user_permissions_{$user->id}";
            $userPermissions = cache()->remember($cacheKey, 300, function () use ($user) {
                return $user->getAllPermissions()
                    ->pluck('permission_name')
                    ->toArray();
            });
        } catch (\Exception $e) {
            Log::error('CheckPermission error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Permission error',
            ], 500);
        }

        // 4. Periksa apakah user memiliki setidaknya satu permission yang diperlukan (OR logic)
        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                return $next($request);
            }
        }

        // 5. Tidak ada permission yang cocok → tolak akses
        return response()->json([
            'success' => false,
            'message' => 'Forbidden',
        ], 403);
    }
}