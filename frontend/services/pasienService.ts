// src/services/pasienService.ts
import { fetchAPI } from "./api";
import type { PasienProfile } from "./usersService";

export interface JadwalDokterPasien {
  jadwal_id: number;
  tanggal: string;
  peran: string;
  tipe_jaga: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  kuota_pasien: number;
  terisi: number;
  sisa_kuota: number;
  keterangan?: string | null;
  id_paramedic: number;
  nama_dokter: string;
  spesialisasi?: string | null;
  id_posisi: number;
  poliklinik: string;
  kode_poli?: string | null;
  lokasi_ruangan?: string | null;
  status_poli?: string | null;
  nama_kategori?: string | null;
}

export interface RiwayatPendaftaranItem {
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
  tipe_jaga?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  nama_dokter: string;
  poliklinik: string;
  lokasi_ruangan?: string | null;
  diagnosis?: string | null;
  resep_obat?: string | null;
  catatan_dokter?: string | null;
}

export interface TiketAntrianResponse {
  status: boolean;
  tiket: {
    rumah_sakit: string;
    kode_booking: string;
    nomor_antrian: string;
    tanggal_kunjungan: string;
    estimasi_panggil: string;
    poliklinik: string;
    lokasi_ruangan: string;
    dokter: string;
    pasien: {
      no_rm: string;
      nama: string;
      tanggal_lahir: string;
    };
    status_antrian: string;
  };
}

export async function getProfilPasien() {
  return fetchAPI<{ status: boolean; data: PasienProfile }>("/api/pasien/profil");
}

export async function updateProfilPasien(payload: {
  nama_lengkap: string;
  jenis_kelamin?: "L" | "P" | null;
  no_hp?: string;
  alamat?: string;
  golongan_darah?: string;
  riwayat_alergi?: string;
}) {
  return fetchAPI<{
    status: boolean;
    message: string;
    data: PasienProfile;
  }>("/api/pasien/profil", {
    method: "PUT",
    body: payload,
  });
}

export async function getJadwalDokterPasien(params?: {
  tanggal?: string;
  tanggal_spesifik?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.tanggal) query.set("tanggal", params.tanggal);
  if (params?.tanggal_spesifik) {
    query.set("tanggal_spesifik", params.tanggal_spesifik);
  }
  if (params?.search) query.set("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";

  return fetchAPI<{ status: boolean; data: JadwalDokterPasien[] }>(
    `/api/pasien/jadwal-dokter${qs}`
  );
}

export async function daftarKonsultasiPasien(payload: {
  jadwal_id: number;
  keluhan?: string;
}) {
  return fetchAPI<{
    status: boolean;
    message: string;
    data: RiwayatPendaftaranItem;
  }>("/api/pasien/daftar-konsultasi", {
    method: "POST",
    body: payload,
  });
}

export async function getRiwayatPendaftaranPasien() {
  return fetchAPI<{ status: boolean; data: RiwayatPendaftaranItem[] }>(
    "/api/pasien/riwayat-pendaftaran"
  );
}

export async function cetakNomorAntrianPasien(idPendaftaran: number) {
  return fetchAPI<TiketAntrianResponse>(
    `/api/pasien/pendaftaran/${idPendaftaran}/cetak-antrian`
  );
}