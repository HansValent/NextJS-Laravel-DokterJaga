<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BagianParamedic extends Model
{
    protected $table = 'bagian_paramedic';
    protected $primaryKey = 'id_bagian_paramedic';
    public $timestamps = false;

    protected $fillable = [
        'id_paramedic',
        'id_posisi',
        'created_by',
        'is_deleted',
        'created_at',
        'updated_by',
        'deleted_by',
        'deleted_at',
        'updated_at',
    ];

    // RELASI

    public function paramedic()
    {
        return $this->belongsTo(Paramedic::class, 'id_paramedic', 'id_paramedic');
    }

    public function posisi()
    {
        return $this->belongsTo(posisi::class, 'id_posisi', 'id_posisi');
    }

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class, 'id_bagian_paramedic', 'id_bagian_paramedic');
    }
}