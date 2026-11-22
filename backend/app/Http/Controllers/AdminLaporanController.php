<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminLaporanController extends Controller
{
    /**
     * 1. Laporan Pendaftaran Pasien
     */
    public function laporanPendaftaranPasien(Request $request)
    {
        $start = $request->input('start_date', now()->startOfMonth()->toDateString());
        $end = $request->input('end_date', now()->endOfMonth()->toDateString());
        $idPosisi = $request->input('id_posisi');
        $status = $request->input('status_antrian');

        $query = DB::table('pendaftaran_konsultasi as pk')
            ->join('pasien as ps', 'pk.id_pasien', '=', 'ps.id_pasien')
            ->join('jadwal as j', 'pk.jadwal_id', '=', 'j.id')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('paramedic as d', 'bp.id_paramedic', '=', 'd.id_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->whereBetween('pk.tanggal_kunjungan', [$start, $end]);

        if ($idPosisi) {
            $query->where('p.id_posisi', $idPosisi);
        }
        if ($status) {
            $query->where('pk.status_antrian', $status);
        }

        $data = $query->select(
                'pk.id_pendaftaran',
                'pk.kode_booking',
                'pk.nomor_antrian',
                'pk.tanggal_kunjungan',
                'ps.no_rm',
                'ps.nik',
                'ps.nama_lengkap as nama_pasien',
                'p.nama_posisi as poliklinik',
                'd.nama_paramedic as nama_dokter',
                'pk.keluhan',
                'pk.status_antrian',
                'pk.waktu_daftar'
            )
            ->orderByDesc('pk.tanggal_kunjungan')
            ->orderBy('pk.urutan_antrian')
            ->get();

        if ($request->boolean('download')) {
            return $this->streamCsv("laporan_pendaftaran_pasien_{$start}_{$end}.csv", [
                'Kode Booking', 'No Antrian', 'Tanggal Kunjungan', 'No RM', 'NIK',
                'Nama Pasien', 'Poliklinik', 'Dokter', 'Keluhan', 'Status', 'Waktu Daftar'
            ], $data->map(fn($r) => [
                $r->kode_booking, $r->nomor_antrian, $r->tanggal_kunjungan, $r->no_rm, $r->nik,
                $r->nama_pasien, $r->poliklinik, $r->nama_dokter, $r->keluhan, $r->status_antrian, $r->waktu_daftar
            ]));
        }

        return response()->json([
            'status'    => true,
            'ringkasan' => [
                'total_pendaftar' => $data->count(),
                'selesai'         => $data->where('status_antrian', 'Selesai')->count(),
                'menunggu'        => $data->where('status_antrian', 'Menunggu')->count(),
                'batal'           => $data->where('status_antrian', 'Batal')->count(),
            ],
            'data' => $data,
        ]);
    }

    /**
     * 2. Laporan Praktik Dokter / Absensi Dokter
     */
    public function laporanPraktikDokter(Request $request)
    {
        $start = $request->input('start_date', now()->startOfMonth()->toDateString());
        $end = $request->input('end_date', now()->endOfMonth()->toDateString());
        $idParamedic = $request->input('id_paramedic');

        $query = DB::table('jadwal as j')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('paramedic as d', 'bp.id_paramedic', '=', 'd.id_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->leftJoin('absensi_dokter as ad', function ($join) {
                $join->on('ad.jadwal_id', '=', 'j.id')
                     ->on('ad.id_paramedic', '=', 'd.id_paramedic');
            })
            ->where('j.is_deleted', 0)
            ->whereBetween('j.tanggal', [$start, $end]);

        if ($idParamedic) {
            $query->where('d.id_paramedic', $idParamedic);
        }

        $data = $query->select(
                'j.id as jadwal_id',
                'j.tanggal',
                'd.npk',
                'd.nama_paramedic as nama_dokter',
                'p.nama_posisi as poliklinik',
                'j.peran',
                'j.tipe_jaga',
                'j.jam_mulai',
                'j.jam_selesai',
                'ad.waktu_masuk',
                'ad.waktu_keluar',
                DB::raw("COALESCE(ad.status_kehadiran, 'Belum Check-In') as status_kehadiran"),
                'ad.catatan'
            )
            ->orderByDesc('j.tanggal')
            ->orderBy('d.nama_paramedic')
            ->get();

        if ($request->boolean('download')) {
            return $this->streamCsv("laporan_praktik_absensi_dokter_{$start}_{$end}.csv", [
                'Tanggal', 'NPK', 'Nama Dokter', 'Poliklinik', 'Peran', 'Tipe Jaga',
                'Jam Jadwal', 'Waktu Masuk', 'Waktu Keluar', 'Status Kehadiran', 'Catatan'
            ], $data->map(fn($r) => [
                $r->tanggal, $r->npk, $r->nama_dokter, $r->poliklinik, $r->peran, $r->tipe_jaga,
                "{$r->jam_mulai}-{$r->jam_selesai}", $r->waktu_masuk, $r->waktu_keluar, $r->status_kehadiran, $r->catatan
            ]));
        }

        return response()->json([
            'status'    => true,
            'ringkasan' => [
                'total_jadwal'   => $data->count(),
                'hadir'          => $data->where('status_kehadiran', 'Hadir')->count(),
                'terlambat'      => $data->where('status_kehadiran', 'Terlambat')->count(),
                'belum_checkin'  => $data->where('status_kehadiran', 'Belum Check-In')->count(),
            ],
            'data' => $data,
        ]);
    }

    /**
     * 3. Laporan Konsultasi Dokter pada Pasien
     */
    public function laporanKonsultasiMedis(Request $request)
    {
        $start = $request->input('start_date', now()->startOfMonth()->toDateString());
        $end = $request->input('end_date', now()->endOfMonth()->toDateString());
        $idParamedic = $request->input('id_paramedic');
        $idPosisi = $request->input('id_posisi');

        $query = DB::table('konsultasi_medis as km')
            ->join('pendaftaran_konsultasi as pk', 'km.id_pendaftaran', '=', 'pk.id_pendaftaran')
            ->join('pasien as ps', 'km.id_pasien', '=', 'ps.id_pasien')
            ->join('paramedic as d', 'km.id_paramedic', '=', 'd.id_paramedic')
            ->join('jadwal as j', 'pk.jadwal_id', '=', 'j.id')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->whereBetween(DB::raw('DATE(km.tanggal_konsultasi)'), [$start, $end]);

        if ($idParamedic) {
            $query->where('d.id_paramedic', $idParamedic);
        }
        if ($idPosisi) {
            $query->where('p.id_posisi', $idPosisi);
        }

        $data = $query->select(
                'km.id_konsultasi',
                'km.tanggal_konsultasi',
                'pk.nomor_antrian',
                'ps.no_rm',
                'ps.nama_lengkap as nama_pasien',
                'd.npk as npk_dokter',
                'd.nama_paramedic as nama_dokter',
                'p.nama_posisi as poliklinik',
                'km.anamnesis_keluhan',
                'km.diagnosis',
                'km.tindakan_terapi',
                'km.resep_obat',
                'km.catatan_dokter'
            )
            ->orderByDesc('km.tanggal_konsultasi')
            ->get();

        if ($request->boolean('download')) {
            return $this->streamCsv("laporan_konsultasi_dokter_pasien_{$start}_{$end}.csv", [
                'Tanggal Konsultasi', 'No Antrian', 'No RM', 'Nama Pasien', 'NPK Dokter',
                'Nama Dokter', 'Poliklinik', 'Keluhan', 'Diagnosis', 'Tindakan/Terapi', 'Resep Obat'
            ], $data->map(fn($r) => [
                $r->tanggal_konsultasi, $r->nomor_antrian, $r->no_rm, $r->nama_pasien, $r->npk_dokter,
                $r->nama_dokter, $r->poliklinik, $r->anamnesis_keluhan, $r->diagnosis, $r->tindakan_terapi, $r->resep_obat
            ]));
        }

        return response()->json([
            'status' => true,
            'total'  => $data->count(),
            'data'   => $data,
        ]);
    }

    private function streamCsv(string $filename, array $headers, $rows): StreamedResponse
    {
        return new StreamedResponse(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
