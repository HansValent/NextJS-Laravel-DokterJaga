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
        'nama_paramedic',
        'npk',
        'jenis_paramedic',
        'created_by',
        'updated_by',
    ];

    /* ================= RELATION ================= */

    public function bagianParamedic()
    {
        return $this->hasMany(
            BagianParamedic::class,
            'id_paramedic',
            'id_paramedic'
        );
    }
}
