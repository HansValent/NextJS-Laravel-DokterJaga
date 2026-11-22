// src/app/pasien/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  HeartPulse,
  LogOut,
  MapPin,
  Printer,
  Search,
  Stethoscope,
  Ticket,
  User,
  X,
} from "lucide-react";
import { Toast } from "@/components/Toast";
import { logoutUser, PasienProfile } from "@/services/usersService";
import {
  JadwalDokterPasien,
  RiwayatPendaftaranItem,
  TiketAntrianResponse,
  cetakNomorAntrianPasien,
  daftarKonsultasiPasien,
  getJadwalDokterPasien,
  getProfilPasien,
  getRiwayatPendaftaranPasien,
  updateProfilPasien,
} from "@/services/pasienService";

type PasienTab = "jadwal" | "tiket" | "profil";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PasienPortalPage() {
  const router = useRouter();

  // Toast State (Selalu menggunakan src/components/Toast)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  // UI States
  const [activeTab, setActiveTab] = useState<PasienTab>("jadwal");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter Jadwal
  const [tanggalFilter, setTanggalFilter] = useState<string>(getTodayString());
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Data States
  const [profil, setProfil] = useState<PasienProfile | null>(null);
  const [jadwalList, setJadwalList] = useState<JadwalDokterPasien[]>([]);
  const [riwayatList, setRiwayatList] = useState<RiwayatPendaftaranItem[]>([]);

  // Modal Daftar Konsultasi
  const [bookingTarget, setBookingTarget] =
    useState<JadwalDokterPasien | null>(null);
  const [keluhanInput, setKeluhanInput] = useState<string>("");

  // Modal Tiket Cetak Antrian
  const [tiketModal, setTiketModal] = useState<
    TiketAntrianResponse["tiket"] | null
  >(null);

  // Form Profil Pasien
  const [profilForm, setProfilForm] = useState({
    nama_lengkap: "",
    jenis_kelamin: "" as "" | "L" | "P",
    no_hp: "",
    alamat: "",
    golongan_darah: "",
    riwayat_alergi: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  const loadProfil = useCallback(async () => {
    try {
      const res = await getProfilPasien();
      if (res.data) {
        setProfil(res.data);
        setProfilForm({
          nama_lengkap: res.data.nama_lengkap ?? "",
          jenis_kelamin: res.data.jenis_kelamin ?? "",
          no_hp: res.data.no_hp ?? "",
          alamat: res.data.alamat ?? "",
          golongan_darah: res.data.golongan_darah ?? "",
          riwayat_alergi: res.data.riwayat_alergi ?? "",
        });
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat profil pasien.",
        "error"
      );
    }
  }, [showToast]);

  const loadJadwal = useCallback(async () => {
    try {
      const res = await getJadwalDokterPasien({
        tanggal: tanggalFilter || getTodayString(),
        search: searchKeyword.trim() || undefined,
      });
      setJadwalList(res.data ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat jadwal dokter.",
        "error"
      );
    }
  }, [tanggalFilter, searchKeyword, showToast]);

  const loadRiwayat = useCallback(async () => {
    try {
      const res = await getRiwayatPendaftaranPasien();
      setRiwayatList(res.data ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat riwayat antrian.",
        "error"
      );
    }
  }, [showToast]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadProfil(), loadJadwal(), loadRiwayat()]);
      setLoading(false);
    };
    init();
  }, [loadProfil, loadJadwal, loadRiwayat]);

  const handleOpenBooking = (item: JadwalDokterPasien) => {
    if (item.status_poli === "Tutup") {
      showToast("Poliklinik sedang tutup pada jadwal ini.", "error");
      return;
    }
    if (item.sisa_kuota <= 0) {
      showToast("Kuota pendaftaran untuk jadwal dokter ini sudah penuh.", "error");
      return;
    }
    setBookingTarget(item);
    setKeluhanInput("");
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTarget) return;

    setSubmitting(true);
    try {
      const res = await daftarKonsultasiPasien({
        jadwal_id: bookingTarget.jadwal_id,
        keluhan: keluhanInput.trim() || undefined,
      });
      showToast(
        res.message ||
          `Berhasil mendaftar! Nomor Antrian Anda: ${res.data.nomor_antrian}`,
        "success"
      );
      setBookingTarget(null);
      await Promise.all([loadJadwal(), loadRiwayat()]);
      setActiveTab("tiket");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Pendaftaran konsultasi gagal.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLihatTiket = async (idPendaftaran: number) => {
    setSubmitting(true);
    try {
      const res = await cetakNomorAntrianPasien(idPendaftaran);
      setTiketModal(res.tiket);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat tiket antrian.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilForm.nama_lengkap.trim()) {
      showToast("Nama lengkap pasien wajib diisi.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProfilPasien({
        nama_lengkap: profilForm.nama_lengkap.trim(),
        jenis_kelamin: profilForm.jenis_kelamin || null,
        no_hp: profilForm.no_hp.trim() || undefined,
        alamat: profilForm.alamat.trim() || undefined,
        golongan_darah: profilForm.golongan_darah.trim() || undefined,
        riwayat_alergi: profilForm.riwayat_alergi.trim() || undefined,
      });
      setProfil(res.data);
      showToast(res.message || "Data profil berhasil diperbarui.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memperbarui profil.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Komponen Toast Terpusat */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Header Sederhana */}
      <header className="bg-blue-900 text-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Layanan Pasien — RS St. Carolus
              </h1>
              <p className="text-xs text-blue-100 mt-0.5">
                {profil
                  ? `${profil.nama_lengkap} • No. RM: ${profil.no_rm}`
                  : "Memuat data pasien..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logoutUser("/")}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white/15 hover:bg-white/25 text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Menu Navigasi Sederhana (3 Tombol Besar) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("jadwal")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === "jadwal"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>Jadwal Dokter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tiket")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === "tiket"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Ticket className="w-4 h-4 shrink-0" />
            <span>Tiket Antrian ({riwayatList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
              activeTab === "profil"
                ? "bg-blue-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Data Diri</span>
          </button>
        </div>

        {/* TAB 1: RENCANA JADWAL DOKTER & PENDAFTARAN */}
        {activeTab === "jadwal" && (
          <div className="space-y-4">
            {/* Filter Pencarian Sederhana */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Cari nama dokter atau poliklinik..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tanggalFilter}
                  min={getTodayString()}
                  onChange={(e) => setTanggalFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={loadJadwal}
                  className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Daftar Kartu Jadwal Dokter */}
            {loading ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-sm text-slate-400">
                Memuat jadwal praktik dokter...
              </div>
            ) : jadwalList.length === 0 ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
                Tidak ada jadwal dokter tersedia mulai tanggal {tanggalFilter}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jadwalList.map((item) => {
                  const penuh = item.sisa_kuota <= 0;
                  return (
                    <div
                      key={item.jadwal_id}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-xs font-semibold">
                            {item.poliklinik}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              penuh
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {penuh
                              ? "Kuota Penuh"
                              : `Sisa Kuota: ${item.sisa_kuota}`}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {item.nama_dokter}
                        </h3>
                        {item.spesialisasi && (
                          <p className="text-xs text-slate-500">
                            {item.spesialisasi}
                          </p>
                        )}

                        <div className="pt-1 space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.tanggal}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {(item.jam_mulai ?? "08:00:00").slice(0, 5)} -{" "}
                              {(item.jam_selesai ?? "14:00:00").slice(0, 5)} WIB
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {item.lokasi_ruangan || "Gedung Rawat Jalan"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={penuh || item.status_poli === "Tutup"}
                        onClick={() => handleOpenBooking(item)}
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white transition disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        {penuh ? "Kuota Penuh" : "Daftar Konsultasi"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TIKET ANTRIAN & RIWAYAT KONSULTASI */}
        {activeTab === "tiket" && (
          <div className="space-y-4">
            {riwayatList.length === 0 ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-3">
                <p className="text-sm text-slate-500">
                  Anda belum memiliki pendaftaran konsultasi.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("jadwal")}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-900 text-white hover:bg-blue-800"
                >
                  Pilih Jadwal Dokter
                </button>
              </div>
            ) : (
              riwayatList.map((r) => (
                <div
                  key={r.id_pendaftaran}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-extrabold text-blue-900">
                        {r.nomor_antrian}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({r.kode_booking})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status_antrian === "Selesai"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status_antrian === "Dipanggil"
                            ? "bg-amber-100 text-amber-800"
                            : r.status_antrian === "Batal"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {r.status_antrian}
                      </span>
                    </div>

                    <div className="font-semibold text-sm text-slate-900">
                      {r.poliklinik} — {r.nama_dokter}
                    </div>
                    <div className="text-xs text-slate-500">
                      Tanggal: {r.tanggal_kunjungan} • Jam:{" "}
                      {(r.jam_mulai ?? "08:00:00").slice(0, 5)} WIB •{" "}
                      {r.lokasi_ruangan || "Gedung Rawat Jalan"}
                    </div>

                    {r.status_antrian === "Selesai" && r.diagnosis && (
                      <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                        <div>
                          <strong>Diagnosis:</strong> {r.diagnosis}
                        </div>
                        {r.resep_obat && (
                          <div>
                            <strong>Resep Obat:</strong> {r.resep_obat}
                          </div>
                        )}
                        {r.catatan_dokter && (
                          <div>
                            <strong>Catatan:</strong> {r.catatan_dokter}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleLihatTiket(r.id_pendaftaran)}
                    className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Nomor Antrian
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PROFIL & BIODATA PASIEN */}
        {activeTab === "profil" && (
          <form
            onSubmit={handleSaveProfil}
            className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Data Identitas Pasien
              </h2>
              <p className="text-xs text-slate-500">
                No. Rekam Medis: <strong>{profil?.no_rm ?? "-"}</strong> • NIK:{" "}
                <strong>{profil?.nik ?? "-"}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={profilForm.nama_lengkap}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      nama_lengkap: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={profilForm.jenis_kelamin}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      jenis_kelamin: e.target.value as "" | "L" | "P",
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Pilih --</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={profilForm.no_hp}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, no_hp: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Golongan Darah
                </label>
                <input
                  type="text"
                  value={profilForm.golongan_darah}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      golongan_darah: e.target.value,
                    })
                  }
                  placeholder="Contoh: O / A / B / AB"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Riwayat Alergi Obat / Makanan
                </label>
                <input
                  type="text"
                  value={profilForm.riwayat_alergi}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      riwayat_alergi: e.target.value,
                    })
                  }
                  placeholder="Kosongkan jika tidak ada alergi"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Domisili
                </label>
                <textarea
                  rows={2}
                  value={profilForm.alamat}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, alamat: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white transition disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Data Diri"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Modal Konfirmasi Pendaftaran Konsultasi */}
      {bookingTarget && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Pendaftaran
              </h3>
              <button
                type="button"
                onClick={() => setBookingTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs space-y-1 text-blue-950">
                <div className="font-bold text-sm">
                  {bookingTarget.nama_dokter}
                </div>
                <div>Poliklinik: {bookingTarget.poliklinik}</div>
                <div>
                  Tanggal: {bookingTarget.tanggal} (
                  {(bookingTarget.jam_mulai ?? "08:00:00").slice(0, 5)} WIB)
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keluhan Singkat (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={keluhanInput}
                  onChange={(e) => setKeluhanInput(e.target.value)}
                  placeholder="Tuliskan keluhan yang ingin dikonsultasikan..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBookingTarget(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Ambil Nomor Antrian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tiket Antrian Siap Cetak */}
      {tiketModal && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-black">
            <div className="px-5 py-4 bg-blue-900 text-white text-center relative">
              <button
                type="button"
                onClick={() => setTiketModal(null)}
                className="absolute right-3 top-3 p-1 rounded-lg text-white/80 hover:text-white print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="text-xs uppercase tracking-wider text-blue-200">
                {tiketModal.rumah_sakit}
              </p>
              <h3 className="text-sm font-bold mt-0.5">
                BUKTI NOMOR ANTRIAN POLIKLINIK
              </h3>
            </div>

            <div className="p-5 text-center space-y-4">
              <div className="py-3 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <span className="text-xs text-slate-500 block">
                  NOMOR ANTRIAN
                </span>
                <span className="text-4xl font-black text-blue-900 tracking-wide block my-1">
                  {tiketModal.nomor_antrian}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Kode: {tiketModal.kode_booking}
                </span>
              </div>

              <div className="text-left text-xs space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pasien:</span>
                  <span className="font-semibold text-slate-900">
                    {tiketModal.pasien.nama} ({tiketModal.pasien.no_rm})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Poliklinik:</span>
                  <span className="font-semibold text-slate-900">
                    {tiketModal.poliklinik}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi:</span>
                  <span className="font-medium text-slate-800">
                    {tiketModal.lokasi_ruangan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dokter:</span>
                  <span className="font-semibold text-slate-900">
                    {tiketModal.dokter}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="font-medium text-slate-800">
                    {tiketModal.tanggal_kunjungan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimasi Dipanggil:</span>
                  <span className="font-bold text-emerald-700">
                    {tiketModal.estimasi_panggil}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setTiketModal(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}