<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

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
        // 1. Sesuaikan app.url secara dinamis saat diakses via HTTP
        if (!$this->app->runningInConsole() && request()->getHttpHost()) {
            $scheme = request()->getScheme();
            $host   = request()->getHttpHost();
            Config::set('app.url', "{$scheme}://{$host}");
        }

        // 2. Ambil Origin / Referer dari Frontend Next.js (mis. http://localhost:3005)
        $origin  = request()->headers->get('Origin');
        $referer = request()->headers->get('Referer');
        $frontendOrigin = null;

        if ($origin) {
            $frontendOrigin = rtrim($origin, '/');
        } elseif ($referer) {
            $parsed = parse_url($referer);
            if (!empty($parsed['scheme']) && !empty($parsed['host'])) {
                $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
                $frontendOrigin = "{$parsed['scheme']}://{$parsed['host']}{$port}";
            }
        }

        // 3. Tambahkan host+port frontend ke sanctum.stateful secara dinamis
        $stateful = Config::get('sanctum.stateful', []);
        if (is_string($stateful)) {
            $stateful = array_filter(array_map('trim', explode(',', $stateful)));
        }

        if ($frontendOrigin) {
            $hostWithPort = preg_replace('#^https?://#', '', $frontendOrigin);
            if ($hostWithPort && !in_array($hostWithPort, $stateful, true)) {
                $stateful[] = $hostWithPort;
                Config::set('sanctum.stateful', $stateful);
            }
        }

        // 4. Konfigurasi CORS dinamis agar localhost:3000 - localhost:3010 tidak terblokir preflight
        $allowedOrigins = Config::get('cors.allowed_origins', []);
        $defaultDevOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3005',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3005',
        ];

        $mergedOrigins = array_values(array_unique(array_merge(
            is_array($allowedOrigins) ? $allowedOrigins : [],
            $defaultDevOrigins,
            $frontendOrigin ? [$frontendOrigin] : []
        )));

        Config::set('cors.paths', ['api/*', 'sanctum/csrf-cookie']);
        Config::set('cors.allowed_origins', $mergedOrigins);
        Config::set('cors.allowed_origins_patterns', [
            '#^http://localhost(:\d+)?$#',
            '#^http://127\.0\.0\.1(:\d+)?$#',
        ]);
        Config::set('cors.allowed_methods', ['*']);
        Config::set('cors.allowed_headers', ['*']);
        Config::set('cors.supports_credentials', true);
    }
}
