<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\HasApiTokens;

class Users extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'users';

    protected $fillable = [
        'npk',
        'name',
        'username',
        'password',
        'status',
    ];

    protected $hidden = ['password'];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'user_role',
            'user_id',
            'role_id'
        )->select('roles.id', 'role_name');
    }

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'user_permission',
            'user_id',
            'permission_id'
        )->select('permissions.id', 'permission_name');
    }

    /*
    |--------------------------------------------------------------------------
    | RBAC CHECK
    |--------------------------------------------------------------------------
    */

    public function hasRole($role)
    {
        return $this->roles()
            ->where('role_name', $role)
            ->exists();
    }

    public function hasPermission($permission)
    {
        $permissions = cache()->remember(
            "user_permissions_{$this->id}",
            3600,
            function () {
    
                $rolePermissions = $this->roles()
                    ->with('permissions')
                    ->get()
                    ->pluck('permissions')
                    ->flatten()
                    ->pluck('permission_name');
    
                $userPermissions = $this->permissions()
                    ->pluck('permission_name');
    
                return $rolePermissions
                    ->merge($userPermissions)
                    ->unique()
                    ->values()
                    ->toArray();
            }
        );
    
        return in_array($permission, $permissions);
    }

    /*
    |--------------------------------------------------------------------------
    | GET ALL PERMISSIONS (CORE)
    |--------------------------------------------------------------------------
    */

    public function getAllPermissions()
    {
        if ($this->hasRole('Super Admin')) {
            return Permission::select('id', 'permission_name')->get();
        }

        // Hapus cache sementara untuk debugging
        try {
            $rolePermissions = $this->roles()
                ->with('permissions:id,permission_name')
                ->get()
                ->pluck('permissions')
                ->flatten();

            $directPermissions = $this->permissions()
                ->get(['permissions.id', 'permission_name']);

            return $rolePermissions
                ->merge($directPermissions)
                ->unique('id')
                ->values();
        } catch (\Exception $e) {
            Log::error('getAllPermissions error for user '.$this->id.': '.$e->getMessage());
            return collect(); // return empty collection
        }
    }
}
