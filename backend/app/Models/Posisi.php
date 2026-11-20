<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posisi extends Model
{
    protected $table = 'posisi';
    protected $primaryKey = 'id_posisi';
    public $timestamps = false;
    protected $fillable = [
        'kode_posisi',
        'nama_posisi',
        'kategori_id',
        'urutan',
        'created_by',
        'updated_by',
    ];
}