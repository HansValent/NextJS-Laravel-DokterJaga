<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    protected $table = 'jadwal';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $guarded = [];

    // ✅ RELASI YANG BENAR
    public function bagian()
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
}
