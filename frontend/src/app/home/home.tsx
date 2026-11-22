// app/home/home.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  clearAuthSession,
  loginPasien,
  persistAuthSession,
  registerPasien,
  resolveRedirectByRoles,
} from '@/services/usersService';

export default function HomePageLanding() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State Login Pasien
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // State Registrasi Pasien (sesuai kolom tabel pasien pada dokter_jaga_3.sql)
  const [regForm, setRegForm] = useState({
    nik: '',
    nama_lengkap: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    no_hp: '',
    alamat: '',
    username: '',
    password: '',
    password_confirmation: '',
  });

  const handlePasienLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !loginPassword.trim()) {
      setErrorMessage('No. RM / NIK / Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginPasien({
        identifier: identifier.trim(),
        password: loginPassword,
      });

      if (!res?.success || !res?.token) {
        setErrorMessage(res?.message || 'Login pasien gagal. Periksa kembali data Anda.');
        return;
      }

      const roles = Array.isArray(res.roles) && res.roles.length > 0 ? res.roles : ['Pasien'];
      const { portal, redirectPath } = resolveRedirectByRoles(roles);

      // Pastikan akun Admin/Dokter tidak masuk melalui portal Pasien
      if (portal !== 'pasien') {
        clearAuthSession();
        setErrorMessage(
          'Akun ini merupakan akun Staf/Dokter. Silakan masuk melalui halaman Login Staf & Dokter.'
        );
        return;
      }

      persistAuthSession({
        ...res,
        roles,
      });

      router.replace(redirectPath); // Mengarahkan ke /pasien
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Kredensial pasien tidak ditemukan atau password salah.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasienRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regForm.password !== regForm.password_confirmation) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerPasien(regForm);

      if (!res?.success) {
        setErrorMessage(res?.message || 'Registrasi pasien gagal.');
        return;
      }

      if (res.token) {
        const roles = Array.isArray(res.roles) && res.roles.length > 0 ? res.roles : ['Pasien'];
        persistAuthSession({ ...res, roles });
        router.replace('/pasien');
        return;
      }

      setSuccessMessage('Registrasi berhasil! Silakan masuk menggunakan akun Pasien Anda.');
      setActiveTab('login');
      setIdentifier(regForm.username);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi pasien.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
              +
            </div>
            <div>
              <span className="block text-base font-bold text-slate-900 leading-tight">
                Layanan Konsultasi &amp; Dokter Jaga
              </span>
              <span className="block text-xs text-slate-500">
                Portal Informasi &amp; Pendaftaran Mandiri Pasien
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/display"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Jadwal Dokter Jaga
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-blue-900 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition"
            >
              Login Admin / Dokter
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Informasi Layanan Pasien */}
          <section className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Portal Pasien Terpadu
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pendaftaran Konsultasi &amp; Pantau Jadwal Dokter Spesialis Secara Mandiri
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Masuk menggunakan Nomor Rekam Medis (No. RM), NIK, atau Username Anda untuk
              mengambil nomor antrian poliklinik, memantau kuota praktik dokter harian, dan
              melihat riwayat konsultasi medis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 uppercase">01. Cek Jadwal</p>
                <h2 className="mt-1 text-sm font-bold text-slate-900">Jadwal Real-Time</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Informasi dokter utama, dokter pengganti, dan sisa kuota harian.
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 uppercase">02. Booking</p>
                <h2 className="mt-1 text-sm font-bold text-slate-900">Antrian Online</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Dapatkan kode booking dan urutan antrian tanpa menunggu lama di loket.
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 uppercase">03. Riwayat</p>
                <h2 className="mt-1 text-sm font-bold text-slate-900">Catatan Medis</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Akses ringkasan diagnosis, tindakan terapi, dan resep obat pasca-konsultasi.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/display"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 underline"
              >
                Lihat Layar Informasi Jadwal Dokter Hari Ini &rarr;
              </Link>
            </div>
          </section>

          {/* Kolom Kanan: Kartu Login & Registrasi Pasien Terpisah */}
          <section className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100/70">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className={`py-3.5 text-sm font-bold transition ${
                    activeTab === 'login'
                      ? 'bg-white text-emerald-800 border-b-2 border-emerald-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Login Pasien
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className={`py-3.5 text-sm font-bold transition ${
                    activeTab === 'register'
                      ? 'bg-white text-emerald-800 border-b-2 border-emerald-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daftar Pasien Baru
                </button>
              </div>

              <div className="p-6 sm:p-7">
                {successMessage && (
                  <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-300 px-4 py-3 text-xs text-emerald-800">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-300 px-4 py-3 text-xs text-red-700">
                    <p>{errorMessage}</p>
                    {errorMessage.includes('Staf/Dokter') && (
                      <Link
                        href="/login"
                        className="mt-1.5 inline-block font-semibold underline text-red-900"
                      >
                        Menuju Halaman Login Admin &amp; Dokter &rarr;
                      </Link>
                    )}
                  </div>
                )}

                {activeTab === 'login' ? (
                  <form onSubmit={handlePasienLogin} className="space-y-4">
                    <div>
                      <label
                        htmlFor="pasien-identifier"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        No. Rekam Medis / NIK / Username
                      </label>
                      <input
                        id="pasien-identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Contoh: RM-00123 atau 16 digit NIK"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pasien-password"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="pasien-password"
                          type={showLoginPass ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan Password Akun Pasien"
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-16 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass((prev) => !prev)}
                          className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {showLoginPass ? 'Sembunyi' : 'Lihat'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:opacity-60 transition"
                    >
                      {loading ? 'Memproses...' : 'Masuk ke Portal Pasien'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePasienRegister} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          NIK (16 Digit)
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={20}
                          value={regForm.nik}
                          onChange={(e) => setRegForm({ ...regForm, nik: e.target.value })}
                          placeholder="3171xxxxxxxxxxxx"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.nama_lengkap}
                          onChange={(e) =>
                            setRegForm({ ...regForm, nama_lengkap: e.target.value })
                          }
                          placeholder="Sesuai KTP"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          required
                          value={regForm.tanggal_lahir}
                          onChange={(e) =>
                            setRegForm({ ...regForm, tanggal_lahir: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Jenis Kelamin
                        </label>
                        <select
                          value={regForm.jenis_kelamin}
                          onChange={(e) =>
                            setRegForm({
                              ...regForm,
                              jenis_kelamin: e.target.value as 'L' | 'P',
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          No. HP / WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          value={regForm.no_hp}
                          onChange={(e) => setRegForm({ ...regForm, no_hp: e.target.value })}
                          placeholder="08xxxxxxxxxx"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Username Akun
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.username}
                          onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                          placeholder="Username untuk login"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat Domisili
                      </label>
                      <input
                        type="text"
                        required
                        value={regForm.alamat}
                        onChange={(e) => setRegForm({ ...regForm, alamat: e.target.value })}
                        placeholder="Alamat lengkap saat ini"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          placeholder="Min. 6 karakter"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Konfirmasi Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={regForm.password_confirmation}
                          onChange={(e) =>
                            setRegForm({
                              ...regForm,
                              password_confirmation: e.target.value,
                            })
                          }
                          placeholder="Ulangi password"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition"
                    >
                      {loading ? 'Mendaftarkan Akun...' : 'Buat Akun Pasien'}
                    </button>
                  </form>
                )}

                <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
                  Tenaga Medis atau Administrator?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-800 hover:text-blue-950 underline"
                  >
                    Login di sini
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}