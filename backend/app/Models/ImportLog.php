<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportLog extends Model
{
    protected $table = 'import_logs';
    public $timestamps = false;
    protected $fillable = ['user_id', 'filename', 'mapping', 'total_rows', 'success_rows', 'failed_rows', 'errors'];
}