<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PenanggungJawab extends Model
{
    protected $table = 'penanggung_jawab';
    protected $primaryKey = 'id_penanggung_jawab';

    protected $hidden = [
        'is_deleted',
        'deleted_at',
        'deleted_by',
    ];

    // =========================
    // TIMESTAMP CONFIG
    // =========================
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    // =========================
    // MASS ASSIGNMENT
    // =========================
    protected $fillable = [
        'tanggal',
        'id_perawat',
        'id_kepala_jaga',
        'id_ponek',
        'created_by',
        'updated_by',
        'deleted_by',
        'deleted_at',
        'is_deleted',
    ];

    // =========================
    // RELATIONS (CORE)
    // =========================

    public function perawat()
    {
        return $this->belongsTo(
            Paramedic::class,
            'id_perawat',
            'id_paramedic'
        );
    }

    public function kepalaJaga()
    {
        return $this->belongsTo(
            Paramedic::class,
            'id_kepala_jaga',
            'id_paramedic'
        );
    }

    public function ponek()
    {
        return $this->belongsTo(
            Paramedic::class,
            'id_ponek',
            'id_paramedic'
        );
    }

    // =========================
    // SCOPES (IMPORTANT)
    // =========================

    public function scopeActive($query)
    {
        return $query->where('is_deleted', 0);
    }

    // =========================
    // CLEAN API OUTPUT (AUTO FORMAT)
    // =========================

    protected $appends = [
        'perawat_nama',
        'kepala_jaga_nama',
        'ponek_nama',
    ];

    public function getPerawatNamaAttribute()
    {
        return $this->perawat?->nama_paramedic;
    }

    public function getKepalaJagaNamaAttribute()
    {
        return $this->kepalaJaga?->nama_paramedic;
    }

    public function getPonekNamaAttribute()
    {
        return $this->ponek?->nama_paramedic;
    }

    public function creator()
    {
        return $this->belongsTo(Users::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(Users::class, 'updated_by');
    }

}
