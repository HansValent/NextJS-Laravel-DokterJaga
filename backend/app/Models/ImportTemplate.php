<?php

// app/Models/ImportTemplate.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportTemplate extends Model
{
    protected $fillable = ['name', 'type', 'mapping', 'options'];

    protected $casts = [
        'mapping' => 'array',
        'options' => 'array',
    ];
}