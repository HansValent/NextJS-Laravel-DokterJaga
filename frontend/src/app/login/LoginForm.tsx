"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearAuthSession,
  loginUser,
  loginWithToken,
  persistAuthSession,
  resolveRedirectByRoles,
} from "@/services/usersService";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg === "idle") {
      clearAuthSession();
      setInfoMessage(
        "Sesi Anda telah berakhir karena tidak ada aktivitas (idle). Silakan login kembali."
      );
    } else if (msg === "unauthorized") {
      setErrorMessage(
        "Anda tidak memiliki hak akses ke halaman tersebut. Silakan login terlebih dahulu."
      );
    }

    const accessToken = searchParams.get("accessToken");
    if (accessToken) {
      handleSsoLogin(accessToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSuccessAuth = (res: Awaited<ReturnType<typeof loginUser>>) => {
    if (!res?.token) {
      setErrorMessage(res?.message || "Autentikasi gagal. Periksa kembali akun Anda.");
      return;
    }

    if (res.user?.status === "inactive") {
      clearAuthSession();
      setErrorMessage("Akun Anda berstatus nonaktif. Silakan hubungi Administrator.");
      return;
    }

    const roles = Array.isArray(res.roles) ? res.roles : [];
    const { portal, redirectPath } = resolveRedirectByRoles(roles);

    if (portal === "pasien") {
      clearAuthSession();
      setErrorMessage(
        "Akun Anda terdaftar sebagai Pasien. Silakan masuk melalui Portal Pasien."
      );
      return;
    }

    persistAuthSession(res);
    router.replace(res.redirect_to || redirectPath);
  };

  const handleSsoLogin = async (accessToken: string) => {
    setSsoLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithToken(accessToken);
      handleSuccessAuth(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memverifikasi token SSO Carolus Connect.";
      setErrorMessage(message);
    } finally {
      setSsoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Username / Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({
        username: username.trim(),
        password,
      });
      handleSuccessAuth(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa kembali kredensial Anda.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100/70 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header Hijau Putih */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-8 py-7 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/25">
              Sistem Jadwal Dokter Jaga
            </span>
            <div className="h-9 w-9 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
              +
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Selamat Datang
          </h1>
          <p className="mt-1 text-sm text-emerald-50">
            Silakan masuk menggunakan akun staf atau dokter Anda
          </p>
        </div>

        {/* Body Form */}
        <div className="p-8 bg-white">
          {infoMessage && (
            <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              {infoMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <p>{errorMessage}</p>
              {errorMessage.includes("Pasien") && (
                <Link
                  href="/home"
                  className="mt-2 inline-block font-semibold underline text-emerald-700 hover:text-emerald-900"
                >
                  Menuju Halaman Login Pasien &rarr;
                </Link>
              )}
            </div>
          )}

          {ssoLoading ? (
            <div className="py-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="mt-3 text-sm font-medium text-emerald-800">
                Memverifikasi token Carolus Connect...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Username / NPK / Email
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username, NPK, atau Email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-16 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {showPassword ? "Sembunyi" : "Lihat"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-60 transition"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          )}

          {/* Footer Tautan */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-500">
            <Link
              href="/"
              className="font-semibold text-emerald-700 hover:text-emerald-900 transition"
            >
              &larr; Kembali ke Layar Jadwal Dokter Jaga
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}