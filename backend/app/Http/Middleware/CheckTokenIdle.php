<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CheckTokenIdle
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Pastikan user login dan menggunakan token Sanctum
        if ($user && $user->currentAccessToken()) {
            $token = $user->currentAccessToken();
            $lastUsed = $token->last_used_at;

            // Ambil batas idle dari durasi token expiration di .env (dalam menit)
            // Anda bisa menggantinya dengan angka fix seperti 15 atau 30 jika ingin membedakannya.
            $batasIdle = env('SANCTUM_TOKEN_EXPIRATION', 60); 

            if ($lastUsed) {
                $waktuIdle = Carbon::parse($lastUsed)->diffInMinutes(now());

                // Jika waktu diam/tidak ada aktivitas melebihi batas, hapus token (Force Logout)
                if ($waktuIdle > $batasIdle) {
                    $token->delete();
                    return response()->json([
                        'success' => false,
                        'message' => 'Sesi Anda telah berakhir karena tidak ada aktivitas.'
                    ], 401);
                }
            }

            // Jika masih aktif, update kolom last_used_at ke waktu sekarang
            // agar token diperpanjang selama user terus bergerak/klik menu
            $token->forceFill(['last_used_at' => now()])->save();
        }

        return $next($request);
    }
}