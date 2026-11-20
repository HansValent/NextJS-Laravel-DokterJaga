<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand as BaseServeCommand;

class ServeCommand extends BaseServeCommand
{
    /**
     * Mengubah host default tanpa menghilangkan fungsi flag bawaan.
     *
     * @return string
     */
    protected function host()
    {
        // 1. Jika nanti Anda memasukkan flag --host=xxx secara manual, flag itu tetap diprioritaskan.
        // 2. Jika tidak ada flag, Laravel akan mencari variabel 'SERVER_HOST' di file .env.
        // 3. Jika di .env tidak diatur, maka otomatis menggunakan '0.0.0.0'.
        return $this->option('host') ?: env('SERVER_HOST', '0.0.0.0');
    }
}