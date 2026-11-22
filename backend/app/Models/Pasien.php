<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pasien extends Model
{
    protected $table = 'pasien';
    protected $primaryKey = 'id_pasien';

    protected $fillable = [
        'user_id',
        'no_rm',
        'nik',
        'nama_lengkap',
        'tanggal_lahir',
        'jenis_kelamin',
        'no_hp',
        'alamat',
        'golongan_darah',
        'riwayat_alergi',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date:Y-m-d',
    ];

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id', 'id');
    }

    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranKonsultasi::class, 'id_pasien', 'id_pasien');
    }

    public function konsultasi()
    {
        return $this->hasMany(KonsultasiMedis::class, 'id_pasien', 'id_pasien');
    }
}
