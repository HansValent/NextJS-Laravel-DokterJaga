<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Pastikan dijalankan hanya saat diakses via HTTP request (bukan via terminal/console)
        if (!app()->runningInConsole()) {
            
            // -----------------------------------------------------------------
            // 1. OTOMATISASI APP_URL (Berdasarkan IP/Host Backend yang diakses)
            // -----------------------------------------------------------------
            if (isset($_SERVER['HTTP_HOST'])) {
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
                
                // Mengganti APP_URL di .env secara otomatis di memori saat aplikasi berjalan
                config(['app.url' => "{$protocol}://{$_SERVER['HTTP_HOST']}"]);
            }

            // -----------------------------------------------------------------
            // 2. OTOMATISASI SANCTUM STATEFUL DOMAINS (Berdasarkan Origin Frontend)
            // -----------------------------------------------------------------
            // Membaca alamat asal (Origin atau Referer) dari Frontend Next.js yang mengirim request
            $origin = request()->headers->get('origin') ?? request()->headers->get('referer');
            
            if ($origin) {
                // Hapus "http://" atau "https://"
                $cleanDomain = preg_replace('#^https?://#', '', rtrim($origin, '/'));
                
                // Pengaman: Jika berupa Referer yang membawa path halaman (misal: 172.16.152.121:3005/jadwal),
                // potong dan ambil domain + port murninya saja (172.16.152.121:3005)
                $cleanDomain = explode('/', $cleanDomain)[0];
                
                // Ambil daftar domain stateful bawaan dari konfigurasi Laravel
                $statefulDomains = config('sanctum.stateful', []);
                
                // Jika IP & Port frontend saat ini belum terdaftar di whitelist, masukkan secara otomatis
                if (!in_array($cleanDomain, $statefulDomains)) {
                    $statefulDomains[] = $cleanDomain;
                    
                    // Suntikkan kembali ke dalam konfigurasi Sanctum di dalam memori runtime
                    config(['sanctum.stateful' => $statefulDomains]);
                }
            }
        }
    }
}