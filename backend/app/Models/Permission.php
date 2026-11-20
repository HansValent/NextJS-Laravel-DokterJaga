<?php

namespace App\Models;

use App\Http\Controllers\UsersController;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['permission_name', 'route', 'created_by', 'updated_by'];

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }  

    public function users()
    {
        return $this->belongsToMany(
            Users::class,
            'user_permission',
            'permission_id',
            'user_id'
        );
    }

}
