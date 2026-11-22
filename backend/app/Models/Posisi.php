<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posisi extends Model
{
    protected $table = 'posisi';
    protected $primaryKey = 'id_posisi';
    public $timestamps = false;

    protected $fillable = [
        'nama_posisi',
        'kode_poli',
        'jam_operasional',
        'lokasi_ruangan',
        'kuota_harian',
        'status_poli',
        'kategori_id',
        'urutan',
        'is_deleted',
        'created_by',
        'updated_by',
        'deleted_by',
        'deleted_at',
    ];

    public function bagianParamedic()
    {
        return $this->hasMany(BagianParamedic::class, 'id_posisi', 'id_posisi')
            ->where('is_deleted', 0);
    }
}
