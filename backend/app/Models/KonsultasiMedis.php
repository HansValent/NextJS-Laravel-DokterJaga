<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KonsultasiMedis extends Model
{
    protected $table = 'konsultasi_medis';
    protected $primaryKey = 'id_konsultasi';

    protected $fillable = [
        'id_pendaftaran',
        'id_paramedic',
        'id_pasien',
        'tanggal_konsultasi',
        'anamnesis_keluhan',
        'diagnosis',
        'tindakan_terapi',
        'resep_obat',
        'catatan_dokter',
    ];

    public function pendaftaran()
    {
        return $this->belongsTo(PendaftaranKonsultasi::class, 'id_pendaftaran', 'id_pendaftaran');
    }

    public function paramedic()
    {
        return $this->belongsTo(Paramedic::class, 'id_paramedic', 'id_paramedic');
    }

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'id_pasien', 'id_pasien');
    }
}
