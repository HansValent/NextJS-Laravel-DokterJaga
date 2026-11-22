<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbsensiDokter extends Model
{
    protected $table = 'absensi_dokter';
    protected $primaryKey = 'id_absensi';

    protected $fillable = [
        'jadwal_id',
        'id_paramedic',
        'tanggal',
        'waktu_masuk',
        'waktu_keluar',
        'status_kehadiran',
        'catatan',
    ];

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'jadwal_id', 'id');
    }

    public function paramedic()
    {
        return $this->belongsTo(Paramedic::class, 'id_paramedic', 'id_paramedic');
    }
}
