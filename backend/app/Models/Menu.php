<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Menu extends Model
{
    protected $fillable = ['name', 'icon', 'url', 'parent_id', 'permission', 'order'];

    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order');
    }

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id')->orderBy('order');
    }

    /**
     * Cek apakah user tertentu memiliki akses ke menu ini.
     * Permission kosong/null berarti semua user yang login bisa melihat.
     */
    public function hasPermission($user = null)
    {
        if (!$user) $user = Auth::user();
        if (!$user) return false;
        if (empty($this->permission)) return true;

        // Super Admin selalu bisa
        if ($user->roles()->where('role_name', 'Super Admin')->exists()) {
            return true;
        }

        $userPermissions = $user->getAllPermissions()->pluck('permission_name');
        $required = array_map('trim', explode(',', $this->permission));
        foreach ($required as $perm) {
            if ($userPermissions->contains($perm)) return true;
        }
        return false;
    }
}