<?php

namespace App\Http\Controllers;

use App\Models\Pasien;
use App\Models\Role;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasienAuthController extends Controller
{
    /**
     * Daftar Baru Pasien (Tab "Daftar Baru" di home.tsx)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap'  => 'required|string|max:150',
            'nik'           => 'required|string|max:20|unique:pasien,nik',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'no_hp'         => 'nullable|string|max:30',
            'alamat'        => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // Generate No. Rekam Medis otomatis: RM-YYYYMM-XXXX
            $prefix = 'RM-' . now()->format('Ym') . '-';
            $lastPasien = Pasien::where('no_rm', 'like', $prefix . '%')
                ->orderByDesc('id_pasien')
                ->first();
            $nextNumber = $lastPasien
                ? ((int) substr($lastPasien->no_rm, -4)) + 1
                : 1;
            $noRm = $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);

            // Buat akun di tabel users agar kompatibel dengan Sanctum & CheckTokenIdle
            $user = Users::create([
                'name'     => $validated['nama_lengkap'],
                'username' => $validated['nik'],
                'password' => Hash::make($validated['tanggal_lahir']),
                'status'   => 'active',
            ]);

            $pasienRole = Role::firstOrCreate(['role_name' => 'Pasien']);
            $user->roles()->syncWithoutDetaching([$pasienRole->id]);

            $pasien = Pasien::create([
                'user_id'       => $user->id,
                'no_rm'         => $noRm,
                'nik'           => $validated['nik'],
                'nama_lengkap'  => $validated['nama_lengkap'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
                'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
                'no_hp'         => $validated['no_hp'] ?? null,
                'alamat'        => $validated['alamat'] ?? null,
            ]);

            $token = $user->createToken('pasien-portal')->plainTextToken;

            return response()->json([
                'status'  => true,
                'message' => 'Pendaftaran akun pasien berhasil',
                'token'   => $token,
                'user'    => [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'roles'  => ['Pasien'],
                    'pasien' => $pasien,
                ],
            ], 201);
        });
    }

    /**
     * Login Pasien (Tab "Masuk Akun" di home.tsx menggunakan No. RM / NIK + Tanggal Lahir)
     */
    public function login(Request $request)
    {
        $request->validate([
            'identitas'     => 'required|string', // No. Rekam Medis atau NIK
            'tanggal_lahir' => 'required|date',
        ]);

        $pasien = Pasien::with('user')
            ->where(function ($q) use ($request) {
                $q->where('nik', $request->identitas)
                  ->orWhere('no_rm', $request->identitas);
            })
            ->whereDate('tanggal_lahir', $request->tanggal_lahir)
            ->first();

        if (!$pasien || !$pasien->user) {
            return response()->json([
                'status'  => false,
                'message' => 'Data pasien tidak ditemukan. Periksa No. RM / NIK dan Tanggal Lahir Anda.',
            ], 401);
        }

        if ($pasien->user->status !== 'active') {
            return response()->json([
                'status'  => false,
                'message' => 'Akun pasien dinonaktifkan.',
            ], 403);
        }

        $token = $pasien->user->createToken('pasien-portal')->plainTextToken;

        return response()->json([
            'status'  => true,
            'message' => 'Login pasien berhasil',
            'token'   => $token,
            'user'    => [
                'id'     => $pasien->user->id,
                'name'   => $pasien->nama_lengkap,
                'roles'  => ['Pasien'],
                'pasien' => $pasien,
            ],
        ]);
    }
}
