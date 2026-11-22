// src/services/dokterService.ts
import { fetchAPI, BASE_URL } from "./api";

export interface DokterProfil {
  id_paramedic: number;
  user_id?: number | null;
  npk?: string | null;
  nama_paramedic: string;
  jenis_paramedic?: string | null;
  spesialisasi?: string | null;
  no_str?: string | null;
  no_sip?: string | null;
  no_hp?: string | null;
  email?: string | null;
}

export interface DokterDashboardKPI {
  total_jadwal_bulan_ini: number;
  pasien_hari_ini: number;
  pasien_menunggu_hari_ini: number;
  total_konsultasi_bulan_ini: number;
}

export interface GrafikKunjunganHarian {
  tanggal: string;
  total_pendaftar: number;
  selesai: number;
  batal: number;
}

export interface GrafikPerPoli {
  poliklinik: string;
  jumlah_pasien: number;
}

export interface GrafikTipeJaga {
  tipe_jaga: string;
  total_shift: number;
}

export interface DokterDashboardResponse {
  status: boolean;
  dokter: DokterProfil;
  kpi: DokterDashboardKPI;
  grafik: {
    kunjungan_harian: GrafikKunjunganHarian[];
    per_poliklinik: GrafikPerPoli[];
    tipe_jaga: GrafikTipeJaga[];
  };
}

export interface JadwalDokterItem {
  jadwal_id: number;
  tanggal: string;
  peran: string;
  tipe_jaga: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  kuota_pasien: number;
  keterangan?: string | null;
  id_posisi: number;
  poliklinik: string;
  lokasi_ruangan?: string | null;
  nama_kategori?: string | null;
  id_absensi?: number | null;
  waktu_masuk?: string | null;
  waktu_keluar?: string | null;
  status_kehadiran?: "Hadir" | "Terlambat" | string | null;
  total_terdaftar: number;
}

export interface PendaftaranPasienDokter {
  id_pendaftaran: number;
  kode_booking: string;
  nomor_antrian: string;
  urutan_antrian: number;
  id_pasien: number;
  jadwal_id: number;
  tanggal_kunjungan: string;
  keluhan?: string | null;
  status_antrian: "Menunggu" | "Dipanggil" | "Selesai" | "Batal" | string;
  waktu_daftar?: string | null;
  waktu_dipanggil?: string | null;
  waktu_selesai?: string | null;
  pasien?: {
    id_pasien: number;
    no_rm: string;
    nik?: string;
    nama_lengkap: string;
    tanggal_lahir?: string;
    jenis_kelamin?: "L" | "P" | null;
    no_hp?: string | null;
    golongan_darah?: string | null;
    riwayat_alergi?: string | null;
  };
  jadwal?: {
    id: number;
    jam_mulai?: string | null;
    jam_selesai?: string | null;
    bagian_paramedic?: {
      posisi?: {
        nama_posisi: string;
        lokasi_ruangan?: string | null;
      };
    };
  };
  konsultasi?: {
    anamnesis_keluhan: string;
    diagnosis: string;
    tindakan_terapi?: string | null;
    resep_obat?: string | null;
    catatan_dokter?: string | null;
  } | null;
}

export interface KonsultasiPayload {
  anamnesis_keluhan: string;
  diagnosis: string;
  tindakan_terapi?: string;
  resep_obat?: string;
  catatan_dokter?: string;
}

export interface LaporanKonsultasiItem {
  tanggal_konsultasi: string;
  nomor_antrian: string;
  no_rm: string;
  nama_pasien: string;
  poliklinik: string;
  anamnesis_keluhan: string;
  diagnosis: string;
  tindakan_terapi?: string | null;
  resep_obat?: string | null;
}

export interface PoliklinikInfo {
  id_posisi: number;
  nama_poliklinik: string;
  kode_poli?: string | null;
  jam_operasional?: string | null;
  lokasi_ruangan?: string | null;
  kuota_harian?: number | null;
  status_poli?: string | null;
  nama_kategori?: string | null;
  jumlah_dokter: number;
}

export async function getDokterDashboard(bulan?: string) {
  const qs = bulan ? `?bulan=${encodeURIComponent(bulan)}` : "";
  return fetchAPI<DokterDashboardResponse>(`/api/dokter/dashboard${qs}`);
}

export async function getJadwalDokterSaya(bulan?: string) {
  const qs = bulan ? `?bulan=${encodeURIComponent(bulan)}` : "";
  return fetchAPI<{ status: boolean; data: JadwalDokterItem[] }>(
    `/api/dokter/jadwal-saya${qs}`
  );
}

export async function submitAbsensiPraktik(payload: {
  jadwal_id: number;
  aksi: "masuk" | "keluar";
  catatan?: string;
}) {
  return fetchAPI<{ status: boolean; message: string; data: unknown }>(
    "/api/dokter/absensi-praktik",
    {
      method: "POST",
      body: payload,
    }
  );
}

export async function getPendaftaranPasienDokter(tanggal?: string) {
  const qs = tanggal ? `?tanggal=${encodeURIComponent(tanggal)}` : "";
  return fetchAPI<{ status: boolean; data: PendaftaranPasienDokter[] }>(
    `/api/dokter/pendaftaran-pasien${qs}`
  );
}

export async function panggilAntrianPasien(idPendaftaran: number) {
  return fetchAPI<{ status: boolean; message: string }>(
    `/api/dokter/pendaftaran-pasien/${idPendaftaran}/panggil`,
    {
      method: "POST",
    }
  );
}

export async function simpanKonsultasiPasien(
  idPendaftaran: number,
  payload: KonsultasiPayload
) {
  return fetchAPI<{ status: boolean; message: string }>(
    `/api/dokter/pendaftaran-pasien/${idPendaftaran}/konsultasi`,
    {
      method: "POST",
      body: payload,
    }
  );
}

export async function getLaporanDokter(startDate: string, endDate: string) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  return fetchAPI<{
    status: boolean;
    total: number;
    data: LaporanKonsultasiItem[];
  }>(`/api/dokter/laporan?${params.toString()}`);
}

export async function downloadLaporanDokterCsv(
  startDate: string,
  endDate: string
): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    download: "1",
  });

  const res = await fetch(`${BASE_URL}/api/dokter/laporan?${params.toString()}`, {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengunduh berkas laporan CSV.");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan_konsultasi_${startDate}_sd_${endDate}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getProfilDokter() {
  return fetchAPI<{
    status: boolean;
    data: {
      profil: DokterProfil;
      poliklinik: {
        id_posisi: number;
        nama_posisi: string;
        kode_poli?: string | null;
        lokasi_ruangan?: string | null;
        nama_kategori?: string | null;
      }[];
    };
  }>("/api/dokter/profil");
}

export async function updateProfilDokter(payload: {
  npk?: string;
  spesialisasi?: string;
  no_str?: string;
  no_sip?: string;
  no_hp?: string;
  email?: string;
}) {
  return fetchAPI<{ status: boolean; message: string; data: DokterProfil }>(
    "/api/dokter/profil",
    {
      method: "PUT",
      body: payload,
    }
  );
}

export async function getInfoPoliklinikDokter() {
  return fetchAPI<{ status: boolean; data: PoliklinikInfo[] }>(
    "/api/dokter/poliklinik"
  );
}