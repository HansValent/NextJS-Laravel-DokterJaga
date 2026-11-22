<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paramedic extends Model
{
    protected $table = 'paramedic';
    protected $primaryKey = 'id_paramedic';
    public $timestamps = false;
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'nama_paramedic',
        'npk',
        'jenis_paramedic',
        'spesialisasi',
        'no_str',
        'no_sip',
        'no_hp',
        'email',
        'is_deleted',
        'created_by',
        'updated_by',
        'deleted_by',
        'deleted_at',
    ];

    public function bagianParamedic()
    {
        return $this->hasMany(BagianParamedic::class, 'id_paramedic', 'id_paramedic')
            ->where('is_deleted', 0);
    }

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id', 'id');
    }

    public function absensi()
    {
        return $this->hasMany(AbsensiDokter::class, 'id_paramedic', 'id_paramedic');
    }

    public function konsultasi()
    {
        return $this->hasMany(KonsultasiMedis::class, 'id_paramedic', 'id_paramedic');
    }
}
