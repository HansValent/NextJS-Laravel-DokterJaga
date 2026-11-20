<?php

namespace App\Http\Controllers;

use App\Models\Users;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
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
     * Login dengan username & password.
     */
    public function login(Request $request)
    {
        $rules = [
            'username' => 'required|string',
            'password' => 'required',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Proses Login Gagal',
                'data'    => $validator->errors(),
            ], 401);
        }

        $user = Users::with(['roles', 'permissions'])
            ->where('username', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username dan Password yang dimasukkan tidak sesuai',
            ], 401);
        }

        // Variable $role sempat diisi tapi tidak terpakai di response, tetap dipertahankan agar tidak merusak logika asli
        if (empty($role = $user->roles)) {
            $role = ["Users"];
        }

        $perms = $user->getAllPermissions()->pluck('permission_name');
        Log::info('User permissions:', $perms->toArray());

        return response()->json([
            'status'  => true,
            'message' => 'Berhasil Prosess Login',
            'token'   => $user->createToken('api-user')->plainTextToken,
            'user'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'username'    => $user->username,
                'roles'       => collect($user->roles)->pluck('role_name'),
                'permissions' => $user->getAllPermissions()
                    ->pluck('permission_name')
                    ->filter()
                    ->values(),
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

            $token = $user->createToken('carolus-connect')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login via token berhasil',
                'token'   => $token,
                'user'    => [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'username'    => $user->username,
                    'roles'       => $user->roles->pluck('role_name'),
                    'permissions' => $user->getAllPermissions()->pluck('permission_name')->values(),
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