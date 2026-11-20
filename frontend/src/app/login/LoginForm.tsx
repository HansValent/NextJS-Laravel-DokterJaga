"use client";

import { useState, useEffect } from "react";
import { loginUser, loginWithToken } from "@/services/usersService";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  accessToken?: string;
  message?: string; // 🌟 1. Tambahkan properti message di tipe Props
};

export default function LoginForm({ accessToken, message }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState(""); // 🌟 2. State untuk menampung pesan idle

  // ========================================================
  // HELPER: Sinkronisasi Cookie Instan untuk Middleware
  // ========================================================
  const syncAuthCookies = (apiToken?: string, apiUser?: any) => {
    const token = apiToken || localStorage.getItem("token");
    const user = apiUser ? JSON.stringify(apiUser) : localStorage.getItem("user");

    if (token) {
      document.cookie = `token=${token}; path=/; max-age=86400;`;
    }
    if (user) {
      document.cookie = `user=${encodeURIComponent(user)}; path=/; max-age=86400;`;
    }
  };

  // 🌟 3. Tangkap kiriman parameter 'idle' dari api.ts
  useEffect(() => {
    if (message === "idle") {
      setInfoMessage("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.");
    }
  }, [message]);

  // Proses accessToken dari server (props)
  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError("");

    loginWithToken(accessToken)
      .then((res: any) => {
        if (res?.token) localStorage.setItem("token", res.token);
        if (res?.user) localStorage.setItem("user", JSON.stringify(res.user));

        syncAuthCookies(res?.token, res?.user);
        window.location.replace("/admin");
      })
      .catch((err) => {
        setError(err.message || "Token tidak valid, silakan login manual");
        setLoading(false);
      });
  }, [accessToken]);

  // Redirect jika sudah ada sesi (hanya jika tidak ada accessToken)
  useEffect(() => {
    if (accessToken) return;

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    console.log("LOGIN CHECK", { token, user });

    if (!token || !user) return;

    try {
      const parsedUser = JSON.parse(user);
      syncAuthCookies(token, parsedUser);
      window.location.replace("/admin");
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [accessToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage(""); // Bersihkan info idle saat user mencoba login kembali

    try {
      const res = await loginUser({ username, password });
      
      if (res?.token) localStorage.setItem("token", res.token);
      if (res?.user) localStorage.setItem("user", JSON.stringify(res.user));

      syncAuthCookies(res?.token, res?.user);
      window.location.replace("/admin");
    } catch (err: any) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#006838] to-[#8DC63F] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="relative z-10 bg-white p-[0.6vh] rounded-xl shadow-md flex items-center justify-center">
            <img src="/images/logo.webp" alt="Logo RS" className="h-[15vh] w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#B72227] mt-5">
            DOKTER JAGA
          </h1>
          <h2 className=" text-xl font-bold text-[#B72227]">Login</h2>
        </div>

        {/* 🌟 4. TAMPILKAN NOTIFIKASI IDLE TIMEOUT (Warna Amber/Kuning Informasi) */}
        {infoMessage && (
          <div className="mb-4 p-3 text-sm text-amber-700 bg-amber-50 rounded-lg text-center font-medium border border-amber-200 shadow-sm animate-fade-in">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 text-red-600 text-center text-sm font-medium">{error}</div>
        )}

        {accessToken && loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B72227] mx-auto"></div>
            <p className="mt-4 text-gray-600">Memverifikasi token...</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]"
              disabled={loading}
              required
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2.5 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]" // 🌟 3. pr-24 agar teks tidak tertimpa tombol
                disabled={loading}
                required
              />
              {/* 🌟 4. Tombol Tampilkan/Sembunyikan */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-[#006838] transition focus:outline-none disabled:opacity-50"
                disabled={loading}
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
            <button
              disabled={loading}
              className="w-full bg-[#B72227] hover:bg-red-700 text-white p-2.5 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}