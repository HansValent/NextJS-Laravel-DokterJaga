<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    protected $table = 'jadwal';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $guarded = [];

    protected $fillable = [
        'tanggal',
        'id_bagian_paramedic',
        'peran',
        'tipe_jaga',
        'kuota_pasien',
        'jam_mulai',
        'jam_selesai',
        'keterangan',
        'created_by',
        'updated_by',
        'deleted_by',
        'deleted_at',
        'is_deleted',
    ];

    protected $casts = [
        'kuota_pasien' => 'integer',
        'is_deleted'   => 'integer',
    ];

    public function bagian()
    {
        return $this->belongsTo(
            BagianParamedic::class,
            'id_bagian_paramedic',
            'id_bagian_paramedic'
        );
    }

    public function bagianParamedic()
    {
        return $this->belongsTo(
            BagianParamedic::class,
            'id_bagian_paramedic',
            'id_bagian_paramedic'
        );
    }

    public function creator()
    {
        return $this->belongsTo(Users::class, 'created_by', 'id');
    }

    public function pendaftaranKonsultasi()
    {
        return $this->hasMany(PendaftaranKonsultasi::class, 'jadwal_id', 'id');
    }

    public function absensi()
    {
        return $this->hasMany(AbsensiDokter::class, 'jadwal_id', 'id');
    }
}
