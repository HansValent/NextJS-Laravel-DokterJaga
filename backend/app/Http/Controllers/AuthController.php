<?php

namespace App\Http\Controllers;

use App\Models\Paramedic;
use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class AuthController extends Controller
{
    /**
     * Registrasi pengguna baru.
     */
    public function register(Request $request)
    {
        $rules = [
            'name'     => 'required',
            'username' => 'required|string|unique:users,username',
            'password' => 'required',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'proses validasi gagal',
                'data'    => $validator->errors(),
            ], 401);
        }

        $user = new Users();
        $user->name     = $request->name;
        $user->username = $request->username;
        $user->password = Hash::make($request->password);
        $user->status   = 'active';
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'Berhasil Memasukkan Data Baru',
        ], 200);
    }

    /**
     * Helper penentu tujuan dashboard & profil dokter berdasarkan role user.
     */
    private function resolveAuthPayload(Users $user): array
    {
        $roleNames = $user->roles->pluck('role_name')->toArray();

        $isDokterOnly = in_array('Dokter', $roleNames)
            && !array_intersect(['Super Admin', 'Admin', 'Power User', 'Editor'], $roleNames);

        $redirectTo = $isDokterOnly ? '/dokter' : '/admin';

        $dokterProfile = null;
        if (in_array('Dokter', $roleNames)) {
            $dokterProfile = Paramedic::where('is_deleted', 0)
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                    if (!empty($user->npk)) {
                        $q->orWhere('npk', $user->npk);
                    }
                })
                ->first();
        }

        return [
            'roleNames'     => $roleNames,
            'redirectTo'    => $redirectTo,
            'dokterProfile' => $dokterProfile,
        ];
    }

    /**
     * Login dengan username & password.
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = Users::with(['roles', 'permissions'])
            ->where('username', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Username atau password salah',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'status'  => false,
                'message' => 'Akun Anda tidak aktif. Hubungi administrator.',
            ], 403);
        }

        $authMeta  = $this->resolveAuthPayload($user);
        $roleNames = $authMeta['roleNames'];

        // Cegah akun Pasien masuk lewat form Login Admin/Dokter
        if (in_array('Pasien', $roleNames) && count($roleNames) === 1) {
            return response()->json([
                'status'  => false,
                'message' => 'Akun pasien silakan login melalui Portal Pasien di halaman utama.',
            ], 403);
        }

        $token = $user->createToken('api-user')->plainTextToken;

        return response()->json([
            'status'      => true,
            'message'     => 'Login berhasil',
            'token'       => $token,
            'redirect_to' => $authMeta['redirectTo'],
            'user'        => [
                'id'          => $user->id,
                'npk'         => $user->npk,
                'name'        => $user->name,
                'username'    => $user->username,
                'status'      => $user->status,
                'roles'       => $roleNames,
                'permissions' => $user->getAllPermissions(),
                'dokter'      => $authMeta['dokterProfile'],
            ],
        ]);
    }

    /**
     * Logout pengguna yang sedang aktif.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Login menggunakan token JWT eksternal (Carolus Connect).
     * Token harus berisi claim `npk` yang valid.
     */
    public function loginWithToken(Request $request)
    {
        $request->validate([
            'accessToken' => 'required|string',
        ]);

        try {
            $secret  = env('CAROLUS_CONNECT_SECRET');
            $decoded = JWT::decode($request->accessToken, new Key($secret, 'HS256'));
            $npk     = $decoded->npk ?? null;

            if (!$npk) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak mengandung npk',
                ], 401);
            }

            $user = Users::with(['roles', 'permissions'])->where('npk', $npk)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User dengan NPK tersebut tidak ditemukan',
                ], 401);
            }

            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda tidak aktif. Hubungi administrator.',
                ], 403);
            }

            $authMeta  = $this->resolveAuthPayload($user);
            $roleNames = $authMeta['roleNames'];

            if (in_array('Pasien', $roleNames) && count($roleNames) === 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun pasien silakan login melalui Portal Pasien di halaman utama.',
                ], 403);
            }

            $token = $user->createToken('carolus-connect')->plainTextToken;

            return response()->json([
                'success'     => true,
                'message'     => 'Login via token berhasil',
                'token'       => $token,
                'redirect_to' => $authMeta['redirectTo'],
                'user'        => [
                    'id'          => $user->id,
                    'npk'         => $user->npk,
                    'name'        => $user->name,
                    'username'    => $user->username,
                    'roles'       => $roleNames,
                    'permissions' => $user->getAllPermissions()->pluck('permission_name')->values(),
                    'dokter'      => $authMeta['dokterProfile'],
                ],
            ]);
        } catch (ExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token sudah kadaluarsa',
            ], 401);
        } catch (SignatureInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tanda tangan token tidak valid',
            ], 401);
        } catch (\Exception $e) {
            Log::error('LoginWithToken error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid',
            ], 401);
        }
    }
}
