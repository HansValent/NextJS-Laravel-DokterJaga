<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // 🔥 TAMBAHKAN INI

if (!function_exists('broadcastJadwal')) {
    function broadcastJadwal(array $data)
    {
        try {
            Http::post('http://127.0.0.1:4000/broadcast/jadwal', $data);
        } catch (\Exception $e) {
            Log::error("WebSocket Error: " . $e->getMessage()); // tanpa backslash
        }
    }
}
