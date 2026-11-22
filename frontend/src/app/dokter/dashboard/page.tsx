// src/app/dokter/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileText,
  LogOut,
  MapPin,
  RefreshCw,
  Stethoscope,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Toast } from "@/components/Toast";
import { logoutUser } from "@/services/usersService";
import {
  DokterDashboardResponse,
  DokterProfil,
  JadwalDokterItem,
  KonsultasiPayload,
  LaporanKonsultasiItem,
  PendaftaranPasienDokter,
  PoliklinikInfo,
  downloadLaporanDokterCsv,
  getDokterDashboard,
  getInfoPoliklinikDokter,
  getJadwalDokterSaya,
  getLaporanDokter,
  getPendaftaranPasienDokter,
  getProfilDokter,
  panggilAntrianPasien,
  simpanKonsultasiPasien,
  submitAbsensiPraktik,
  updateProfilDokter,
} from "@/services/dokterService";

type TabKey = "overview" | "antrian" | "jadwal" | "laporan" | "profil";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthString(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function DokterDashboardPage() {
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

  // Navigation & Loading
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentMonthString()
  );
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [laporanStart, setLaporanStart] = useState<string>(
    `${getCurrentMonthString()}-01`
  );
  const [laporanEnd, setLaporanEnd] = useState<string>(getTodayString());

  // Data States
  const [dashboardData, setDashboardData] =
    useState<DokterDashboardResponse | null>(null);
  const [jadwalList, setJadwalList] = useState<JadwalDokterItem[]>([]);
  const [antrianList, setAntrianList] = useState<PendaftaranPasienDokter[]>([]);
  const [laporanList, setLaporanList] = useState<LaporanKonsultasiItem[]>([]);
  const [poliklinikList, setPoliklinikList] = useState<PoliklinikInfo[]>([]);
  const [poliDiampu, setPoliDiampu] = useState<
    {
      id_posisi: number;
      nama_posisi: string;
      kode_poli?: string | null;
      lokasi_ruangan?: string | null;
      nama_kategori?: string | null;
    }[]
  >([]);

  // Form Profil Dokter
  const [profilForm, setProfilForm] = useState({
    npk: "",
    spesialisasi: "",
    no_str: "",
    no_sip: "",
    no_hp: "",
    email: "",
  });

  // Modal Konsultasi Medis
  const [selectedPasien, setSelectedPasien] =
    useState<PendaftaranPasienDokter | null>(null);
  const [konsultasiForm, setKonsultasiForm] = useState<KonsultasiPayload>({
    anamnesis_keluhan: "",
    diagnosis: "",
    tindakan_terapi: "",
    resep_obat: "",
    catatan_dokter: "",
  });

  // Validasi Sesi Dokter
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const loadDashboardOverview = useCallback(async () => {
    try {
      const res = await getDokterDashboard(selectedMonth);
      setDashboardData(res);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat ringkasan dashboard.",
        "error"
      );
    }
  }, [selectedMonth, showToast]);

  const loadJadwal = useCallback(async () => {
    try {
      const res = await getJadwalDokterSaya(selectedMonth);
      setJadwalList(res.data ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat jadwal jaga dokter.",
        "error"
      );
    }
  }, [selectedMonth, showToast]);

  const loadAntrian = useCallback(async () => {
    try {
      const res = await getPendaftaranPasienDokter(selectedDate);
      setAntrianList(res.data ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat daftar antrian pasien.",
        "error"
      );
    }
  }, [selectedDate, showToast]);

  const loadLaporan = useCallback(async () => {
    if (laporanStart > laporanEnd) {
      showToast(
        "Tanggal mulai laporan tidak boleh melebihi tanggal akhir.",
        "error"
      );
      return;
    }
    try {
      const res = await getLaporanDokter(laporanStart, laporanEnd);
      setLaporanList(res.data ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat laporan konsultasi.",
        "error"
      );
    }
  }, [laporanStart, laporanEnd, showToast]);

  const loadProfilAndPoli = useCallback(async () => {
    try {
      const [profilRes, poliRes] = await Promise.all([
        getProfilDokter(),
        getInfoPoliklinikDokter(),
      ]);
      const p: DokterProfil | undefined = profilRes?.data?.profil;
      if (p) {
        setProfilForm({
          npk: p.npk ?? "",
          spesialisasi: p.spesialisasi ?? "",
          no_str: p.no_str ?? "",
          no_sip: p.no_sip ?? "",
          no_hp: p.no_hp ?? "",
          email: p.email ?? "",
        });
      }
      setPoliDiampu(profilRes?.data?.poliklinik ?? []);
      setPoliklinikList(poliRes?.data ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memuat profil & poliklinik.",
        "error"
      );
    }
  }, [showToast]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadDashboardOverview(),
      loadJadwal(),
      loadAntrian(),
      loadLaporan(),
      loadProfilAndPoli(),
    ]);
    setLoading(false);
  }, [
    loadDashboardOverview,
    loadJadwal,
    loadAntrian,
    loadLaporan,
    loadProfilAndPoli,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Handlers
  const handleAbsensi = async (jadwalId: number, aksi: "masuk" | "keluar") => {
    setSubmitting(true);
    try {
      const res = await submitAbsensiPraktik({ jadwal_id: jadwalId, aksi });
      showToast(res.message || `Absensi ${aksi} berhasil dicatat.`, "success");
      await loadJadwal();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal mencatat absensi praktik.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePanggilPasien = async (item: PendaftaranPasienDokter) => {
    setSubmitting(true);
    try {
      const res = await panggilAntrianPasien(item.id_pendaftaran);
      showToast(
        res.message || `Pasien ${item.nomor_antrian} berhasil dipanggil.`,
        "success"
      );
      await Promise.all([loadAntrian(), loadDashboardOverview()]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memanggil antrian pasien.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openKonsultasiModal = (item: PendaftaranPasienDokter) => {
    setSelectedPasien(item);
    setKonsultasiForm({
      anamnesis_keluhan:
        item.konsultasi?.anamnesis_keluhan ?? item.keluhan ?? "",
      diagnosis: item.konsultasi?.diagnosis ?? "",
      tindakan_terapi: item.konsultasi?.tindakan_terapi ?? "",
      resep_obat: item.konsultasi?.resep_obat ?? "",
      catatan_dokter: item.konsultasi?.catatan_dokter ?? "",
    });
  };

  const handleSimpanKonsultasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPasien) return;

    if (!konsultasiForm.anamnesis_keluhan.trim()) {
      showToast("Keluhan / anamnesis pasien wajib diisi.", "error");
      return;
    }
    if (!konsultasiForm.diagnosis.trim()) {
      showToast("Diagnosis medis wajib diisi sebelum menyimpan.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await simpanKonsultasiPasien(
        selectedPasien.id_pendaftaran,
        konsultasiForm
      );
      showToast(
        res.message || "Hasil pemeriksaan & konsultasi berhasil disimpan.",
        "success"
      );
      setSelectedPasien(null);
      await Promise.all([
        loadAntrian(),
        loadDashboardOverview(),
        loadLaporan(),
      ]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal menyimpan hasil konsultasi.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateProfilDokter(profilForm);
      showToast(res.message || "Profil dokter berhasil diperbarui.", "success");
      await Promise.all([loadProfilAndPoli(), loadDashboardOverview()]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memperbarui profil dokter.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (laporanStart > laporanEnd) {
      showToast("Rentang tanggal laporan tidak valid.", "error");
      return;
    }
    try {
      await downloadLaporanDokterCsv(laporanStart, laporanEnd);
      showToast("Laporan CSV berhasil diunduh.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal mengunduh CSV.",
        "error"
      );
    }
  };

  const dokter = dashboardData?.dokter;
  const kpi = dashboardData?.kpi;
  const maxKunjungan = Math.max(
    1,
    ...(dashboardData?.grafik.kunjungan_harian.map((d) => d.total_pendaftar) ?? [
      1,
    ])
  );
  const maxPoli = Math.max(
    1,
    ...(dashboardData?.grafik.per_poliklinik.map((p) => p.jumlah_pasien) ?? [1])
  );

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

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Portal Dokter — RS St. Carolus
              </h1>
              <p className="text-xs text-slate-500">
                {dokter
                  ? `${dokter.nama_paramedic}${
                      dokter.spesialisasi ? ` • ${dokter.spesialisasi}` : ""
                    }${dokter.npk ? ` (NPK: ${dokter.npk})` : ""}`
                  : "Memuat identitas dokter..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Muat Ulang</span>
            </button>
            <button
              type="button"
              onClick={() => logoutUser("/login")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto border-t border-slate-100">
          {[
            { key: "overview", label: "Ringkasan & Grafik", icon: Activity },
            {
              key: "antrian",
              label: `Antrian Pasien (${antrianList.length})`,
              icon: Users,
            },
            { key: "jadwal", label: "Jadwal & Absensi", icon: Calendar },
            { key: "laporan", label: "Laporan Konsultasi", icon: FileText },
            { key: "profil", label: "Profil & Poliklinik", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  active
                    ? "border-blue-900 text-blue-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: RINGKASAN & GRAFIK */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Statistik Kinerja & Kunjungan Pasien
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih periode bulan untuk memantau jadwal jaga dan pasien rawat
                  jalan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="filter-bulan-overview"
                  className="text-xs font-medium text-slate-600"
                >
                  Periode:
                </label>
                <input
                  id="filter-bulan-overview"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Jadwal Jaga Bulan Ini
                  </span>
                  <Calendar className="w-5 h-5 text-blue-700" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {kpi?.total_jadwal_bulan_ini ?? 0}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    Shift
                  </span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Total Pasien Hari Ini
                  </span>
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {kpi?.pasien_hari_ini ?? 0}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    Pasien
                  </span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Menunggu / Dipanggil
                  </span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {kpi?.pasien_menunggu_hari_ini ?? 0}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    Antrian
                  </span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Konsultasi Selesai (Bulan)
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {kpi?.total_konsultasi_bulan_ini ?? 0}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    Selesai
                  </span>
                </p>
              </div>
            </div>

            {/* Grafik Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grafik Kunjungan Harian */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Grafik Kunjungan Pasien Harian
                </h3>
                {dashboardData?.grafik.kunjungan_harian.length ? (
                  <div className="space-y-3">
                    {dashboardData.grafik.kunjungan_harian.map((row) => {
                      const pct = Math.round(
                        (row.total_pendaftar / maxKunjungan) * 100
                      );
                      return (
                        <div key={row.tanggal} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">
                              {row.tanggal}
                            </span>
                            <span className="text-slate-500">
                              Total: <strong>{row.total_pendaftar}</strong>{" "}
                              (Selesai: {row.selesai}, Batal: {row.batal})
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-900 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-8 text-center">
                    Belum ada data kunjungan pasien pada periode bulan ini.
                  </p>
                )}
              </div>

              {/* Distribusi Poliklinik & Tipe Jaga */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Pasien per Poliklinik
                  </h3>
                  {dashboardData?.grafik.per_poliklinik.length ? (
                    <div className="space-y-3">
                      {dashboardData.grafik.per_poliklinik.map((item) => {
                        const pct = Math.round(
                          (item.jumlah_pasien / maxPoli) * 100
                        );
                        return (
                          <div key={item.poliklinik} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-700 truncate pr-2">
                                {item.poliklinik}
                              </span>
                              <span className="font-semibold text-blue-900">
                                {item.jumlah_pasien}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Belum ada data poliklinik.
                    </p>
                  )}
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Komposisi Tipe Jaga
                  </h3>
                  {dashboardData?.grafik.tipe_jaga.length ? (
                    <div className="space-y-2">
                      {dashboardData.grafik.tipe_jaga.map((item) => (
                        <div
                          key={item.tipe_jaga}
                          className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50"
                        >
                          <span className="font-medium text-slate-700">
                            {item.tipe_jaga || "-"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold">
                            {item.total_shift} Shift
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Belum ada data tipe jaga.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANTRIAN & KONSULTASI PASIEN */}
        {activeTab === "antrian" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Daftar Antrian & Pemeriksaan Pasien
                </h2>
                <p className="text-xs text-slate-500">
                  Panggil nomor antrian pasien dan catat diagnosis serta resep
                  konsultasi.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate === "all" ? "" : selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value || getTodayString())
                  }
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                    selectedDate === "all"
                      ? "bg-blue-900 text-white border-blue-900"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Semua Tanggal
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Antrian</th>
                    <th className="px-4 py-3">Pasien & No. RM</th>
                    <th className="px-4 py-3">Poliklinik & Tanggal</th>
                    <th className="px-4 py-3">Keluhan Awal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {antrianList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        Tidak ada pasien terdaftar pada tanggal yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    antrianList.map((item) => (
                      <tr
                        key={item.id_pendaftaran}
                        className="hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 font-bold text-blue-900 whitespace-nowrap">
                          <div>{item.nomor_antrian}</div>
                          <div className="text-[11px] font-normal text-slate-400">
                            {item.kode_booking}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {item.pasien?.nama_lengkap ?? "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            No. RM: {item.pasien?.no_rm ?? "-"}
                            {item.pasien?.riwayat_alergi
                              ? ` • Alergi: ${item.pasien.riwayat_alergi}`
                              : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {item.jadwal?.bagian_paramedic?.posisi
                              ?.nama_posisi ?? "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.tanggal_kunjungan}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">
                          {item.keluhan || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              item.status_antrian === "Selesai"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status_antrian === "Dipanggil"
                                ? "bg-amber-100 text-amber-800"
                                : item.status_antrian === "Batal"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.status_antrian}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                          {item.status_antrian === "Menunggu" && (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handlePanggilPasien(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50"
                            >
                              Panggil
                            </button>
                          )}
                          {item.status_antrian !== "Batal" && (
                            <button
                              type="button"
                              onClick={() => openKonsultasiModal(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900 hover:bg-blue-800 text-white transition"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              {item.status_antrian === "Selesai"
                                ? "Edit Hasil"
                                : "Periksa"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: JADWAL JAGA & ABSENSI PRAKTIK */}
        {activeTab === "jadwal" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Jadwal Jaga & Absensi Kehadiran Praktik
                </h2>
                <p className="text-xs text-slate-500">
                  Catat jam masuk dan selesai praktik pada setiap sesi jaga
                  Anda.
                </p>
              </div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Poliklinik & Ruangan</th>
                    <th className="px-4 py-3">Shift & Jam Praktik</th>
                    <th className="px-4 py-3">Kuota Pasien</th>
                    <th className="px-4 py-3">Status Absensi</th>
                    <th className="px-4 py-3 text-right">Presensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jadwalList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        Tidak ada jadwal jaga pada bulan {selectedMonth}.
                      </td>
                    </tr>
                  ) : (
                    jadwalList.map((j) => (
                      <tr key={j.jadwal_id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {j.tanggal}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">
                            {j.poliklinik}
                          </div>
                          <div className="text-xs text-slate-500">
                            {j.lokasi_ruangan || "Gedung Rawat Jalan"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-blue-900">
                            {j.tipe_jaga} ({j.peran})
                          </div>
                          <div className="text-xs text-slate-500">
                            {(j.jam_mulai ?? "08:00:00").slice(0, 5)} -{" "}
                            {(j.jam_selesai ?? "14:00:00").slice(0, 5)} WIB
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="font-semibold text-slate-800">
                            {j.total_terdaftar}
                          </span>{" "}
                          / {j.kuota_pasien} Pasien
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {j.status_kehadiran ? (
                            <div>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${
                                  j.status_kehadiran === "Terlambat"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {j.status_kehadiran}
                              </span>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Masuk: {j.waktu_masuk ? j.waktu_masuk.slice(11, 16) : "-"} | Keluar:{" "}
                                {j.waktu_keluar ? j.waktu_keluar.slice(11, 16) : "-"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Belum Absen</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                          {!j.waktu_masuk && (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() =>
                                handleAbsensi(j.jadwal_id, "masuk")
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Absen Masuk
                            </button>
                          )}
                          {j.waktu_masuk && !j.waktu_keluar && (
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() =>
                                handleAbsensi(j.jadwal_id, "keluar")
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white transition disabled:opacity-50"
                            >
                              Absen Keluar
                            </button>
                          )}
                          {j.waktu_masuk && j.waktu_keluar && (
                            <span className="text-xs font-medium text-emerald-700">
                              Selesai Praktik
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LAPORAN KONSULTASI MEDIS */}
        {activeTab === "laporan" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Laporan Riwayat Konsultasi Medis
                </h2>
                <p className="text-xs text-slate-500">
                  Total {laporanList.length} rekam konsultasi pada rentang
                  tanggal terpilih.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={laporanStart}
                  onChange={(e) => setLaporanStart(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
                <span className="text-xs text-slate-500">s/d</span>
                <input
                  type="date"
                  value={laporanEnd}
                  onChange={(e) => setLaporanEnd(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={loadLaporan}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-900 text-white hover:bg-blue-800"
                >
                  Tampilkan
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Waktu Konsultasi</th>
                    <th className="px-4 py-3">Pasien (No. RM)</th>
                    <th className="px-4 py-3">Poliklinik</th>
                    <th className="px-4 py-3">Anamnesis & Diagnosis</th>
                    <th className="px-4 py-3">Terapi & Resep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laporanList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        Belum ada data konsultasi pada rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    laporanList.map((row, idx) => (
                      <tr key={`${row.nomor_antrian}-${idx}`}>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {row.tanggal_konsultasi}
                          </div>
                          <div>Antrian: {row.nomor_antrian}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {row.nama_pasien}
                          </div>
                          <div className="text-xs text-slate-500">
                            RM: {row.no_rm}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-700">
                          {row.poliklinik}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="text-slate-500">
                            Keluhan: {row.anamnesis_keluhan}
                          </div>
                          <div className="font-semibold text-blue-900 mt-0.5">
                            Diagnosis: {row.diagnosis}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <div>Terapi: {row.tindakan_terapi || "-"}</div>
                          <div>Resep: {row.resep_obat || "-"}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PROFIL DOKTER & INFO POLIKLINIK */}
        {activeTab === "profil" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Edit Profil Dokter */}
            <form
              onSubmit={handleUpdateProfil}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
            >
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Profil & Legalitas Praktik Dokter
                </h2>
                <p className="text-xs text-slate-500">
                  Perbarui nomor STR, SIP, spesialisasi, dan kontak aktif Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NPK
                  </label>
                  <input
                    type="text"
                    value={profilForm.npk}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, npk: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Spesialisasi
                  </label>
                  <input
                    type="text"
                    value={profilForm.spesialisasi}
                    onChange={(e) =>
                      setProfilForm({
                        ...profilForm,
                        spesialisasi: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor STR
                  </label>
                  <input
                    type="text"
                    value={profilForm.no_str}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, no_str: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor SIP
                  </label>
                  <input
                    type="text"
                    value={profilForm.no_sip}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, no_sip: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor HP
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profilForm.email}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {poliDiampu.length > 0 && (
                <div className="pt-2">
                  <span className="block text-xs font-medium text-slate-700 mb-2">
                    Poliklinik / Unit yang Diampu:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {poliDiampu.map((p) => (
                      <span
                        key={p.id_posisi}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 text-xs font-medium border border-blue-100"
                      >
                        {p.nama_posisi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-900 hover:bg-blue-800 text-white transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan Profil"}
                </button>
              </div>
            </form>

            {/* Daftar Informasi Poliklinik RS */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-900" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Informasi Poliklinik Rumah Sakit
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daftar unit layanan, jam operasional, dan lokasi ruangan.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {poliklinikList.map((poli) => (
                  <div
                    key={poli.id_posisi}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {poli.nama_poliklinik}{" "}
                        {poli.kode_poli ? `(${poli.kode_poli})` : ""}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {poli.lokasi_ruangan || "Gedung Rawat Jalan"} •{" "}
                        {poli.jam_operasional || "08:00 - 16:00 WIB"}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        poli.status_poli === "Tutup"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {poli.status_poli || "Buka"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Input Pemeriksaan & Konsultasi Medis */}
      {selectedPasien && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Catatan Konsultasi Medis
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPasien.nomor_antrian} •{" "}
                  {selectedPasien.pasien?.nama_lengkap} (RM:{" "}
                  {selectedPasien.pasien?.no_rm})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPasien(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpanKonsultasi} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anamnesis / Keluhan Pasien *
                </label>
                <textarea
                  rows={2}
                  value={konsultasiForm.anamnesis_keluhan}
                  onChange={(e) =>
                    setKonsultasiForm({
                      ...konsultasiForm,
                      anamnesis_keluhan: e.target.value,
                    })
                  }
                  placeholder="Tuliskan keluhan utama dan riwayat gejala..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnosis Medis *
                </label>
                <input
                  type="text"
                  value={konsultasiForm.diagnosis}
                  onChange={(e) =>
                    setKonsultasiForm({
                      ...konsultasiForm,
                      diagnosis: e.target.value,
                    })
                  }
                  placeholder="Contoh: ISPA Akut / Hipertensi Esensial"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tindakan / Terapi
                </label>
                <input
                  type="text"
                  value={konsultasiForm.tindakan_terapi}
                  onChange={(e) =>
                    setKonsultasiForm({
                      ...konsultasiForm,
                      tindakan_terapi: e.target.value,
                    })
                  }
                  placeholder="Observasi tanda vital, edukasi istirahat..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resep Obat
                </label>
                <textarea
                  rows={2}
                  value={konsultasiForm.resep_obat}
                  onChange={(e) =>
                    setKonsultasiForm({
                      ...konsultasiForm,
                      resep_obat: e.target.value,
                    })
                  }
                  placeholder="Nama obat, dosis, dan aturan pakai..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan Dokter
                </label>
                <input
                  type="text"
                  value={konsultasiForm.catatan_dokter}
                  onChange={(e) =>
                    setKonsultasiForm({
                      ...konsultasiForm,
                      catatan_dokter: e.target.value,
                    })
                  }
                  placeholder="Anjuran kontrol ulang..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPasien(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan & Selesaikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}