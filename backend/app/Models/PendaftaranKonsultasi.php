<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendaftaranKonsultasi extends Model
{
    protected $table = 'pendaftaran_konsultasi';
    protected $primaryKey = 'id_pendaftaran';

    protected $fillable = [
        'kode_booking',
        'nomor_antrian',
        'urutan_antrian',
        'id_pasien',
        'jadwal_id',
        'tanggal_kunjungan',
        'keluhan',
        'status_antrian',
        'waktu_daftar',
        'waktu_dipanggil',
        'waktu_selesai',
    ];

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'id_pasien', 'id_pasien');
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'jadwal_id', 'id');
    }

    public function konsultasi()
    {
        return $this->hasOne(KonsultasiMedis::class, 'id_pendaftaran', 'id_pendaftaran');
    }
}
