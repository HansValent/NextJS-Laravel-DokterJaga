<?php

// database/migrations/xxxx_xx_xx_create_import_templates_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('import_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');                 // Nama template, e.g., "BEDAH UMUM"
            $table->string('type')->default('jadwal'); // jadwal, paramedic, posisi, bagian_paramedic
            $table->json('mapping')->nullable();     // Konfigurasi mapping kolom
            $table->json('options')->nullable();     // Pengaturan tambahan (header_row, dll.)
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('import_templates');
    }
};