<?php

namespace App\Http\Controllers;

use App\Models\AbsensiDokter;
use App\Models\BagianParamedic;
use App\Models\Jadwal;
use App\Models\KonsultasiMedis;
use App\Models\Paramedic;
use App\Models\PendaftaranKonsultasi;
use App\Models\Posisi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DokterDashboardController extends Controller
{
    /**
     * Helper mengambil entitas Paramedic milik user dokter yang login
     */
    private function resolveDokter(Request $request): Paramedic
    {
        $user = $request->user();
        $dokter = Paramedic::where('is_deleted', 0)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                if (!empty($user->npk)) {
                    $q->orWhere('npk', $user->npk);
                }
            })
            ->first();

        abort_if(!$dokter, 404, 'Profil dokter tidak terhubung dengan akun pengguna ini.');
        return $dokter;
    }

    /**
     * 1. Ringkasan Dashboard & Data Grafik Dokter
     */
    public function dashboard(Request $request)
    {
        $dokter = $this->resolveDokter($request);
        $bulan = $request->input('bulan', now()->format('Y-m'));
        $startMonth = Carbon::parse($bulan . '-01')->startOfMonth()->toDateString();
        $endMonth = Carbon::parse($bulan . '-01')->endOfMonth()->toDateString();
        $today = now()->toDateString();

        $bagianIds = BagianParamedic::where('id_paramedic', $dokter->id_paramedic)
            ->where('is_deleted', 0)
            ->pluck('id_bagian_paramedic');

        $jadwalIdsBulanIni = Jadwal::whereIn('id_bagian_paramedic', $bagianIds)
            ->where('is_deleted', 0)
            ->whereBetween('tanggal', [$startMonth, $endMonth])
            ->pluck('id');

        // Statistik KPI Cards
        $totalJadwalBulanIni = $jadwalIdsBulanIni->count();
        $pasienHariIni = PendaftaranKonsultasi::whereHas('jadwal', function ($q) use ($bagianIds, $today) {
            $q->whereIn('id_bagian_paramedic', $bagianIds)
              ->whereDate('tanggal', $today)
              ->where('is_deleted', 0);
        })->count();

        $pasienMenungguHariIni = PendaftaranKonsultasi::whereHas('jadwal', function ($q) use ($bagianIds, $today) {
            $q->whereIn('id_bagian_paramedic', $bagianIds)
              ->whereDate('tanggal', $today)
              ->where('is_deleted', 0);
        })->whereIn('status_antrian', ['Menunggu', 'Dipanggil'])->count();

        $totalKonsultasiBulanIni = KonsultasiMedis::where('id_paramedic', $dokter->id_paramedic)
            ->whereBetween(DB::raw('DATE(tanggal_konsultasi)'), [$startMonth, $endMonth])
            ->count();

        // Grafik 1: Tren Kunjungan Pasien Harian dalam Bulan Terpilih
        $grafikKunjunganHarian = PendaftaranKonsultasi::select(
                'tanggal_kunjungan as tanggal',
                DB::raw('COUNT(*) as total_pendaftar'),
                DB::raw("SUM(CASE WHEN status_antrian = 'Selesai' THEN 1 ELSE 0 END) as selesai"),
                DB::raw("SUM(CASE WHEN status_antrian = 'Batal' THEN 1 ELSE 0 END) as batal")
            )
            ->whereIn('jadwal_id', $jadwalIdsBulanIni)
            ->groupBy('tanggal_kunjungan')
            ->orderBy('tanggal_kunjungan')
            ->get();

        // Grafik 2: Distribusi Pasien per Poliklinik yang Diampu
        $grafikPerPoli = DB::table('pendaftaran_konsultasi as pk')
            ->join('jadwal as j', 'pk.jadwal_id', '=', 'j.id')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->where('bp.id_paramedic', $dokter->id_paramedic)
            ->whereBetween('pk.tanggal_kunjungan', [$startMonth, $endMonth])
            ->select('p.nama_posisi as poliklinik', DB::raw('COUNT(pk.id_pendaftaran) as jumlah_pasien'))
            ->groupBy('p.nama_posisi')
            ->get();

        // Grafik 3: Rekap Shift Jaga per Tipe Jaga (Oncall, Onsite Pagi, Onsite Malam)
        $grafikTipeJaga = Jadwal::whereIn('id_bagian_paramedic', $bagianIds)
            ->where('is_deleted', 0)
            ->whereBetween('tanggal', [$startMonth, $endMonth])
            ->select('tipe_jaga', DB::raw('COUNT(*) as total_shift'))
            ->groupBy('tipe_jaga')
            ->get();

        return response()->json([
            'status' => true,
            'dokter' => $dokter,
            'kpi' => [
                'total_jadwal_bulan_ini'     => $totalJadwalBulanIni,
                'pasien_hari_ini'            => $pasienHariIni,
                'pasien_menunggu_hari_ini'   => $pasienMenungguHariIni,
                'total_konsultasi_bulan_ini' => $totalKonsultasiBulanIni,
            ],
            'grafik' => [
                'kunjungan_harian' => $grafikKunjunganHarian,
                'per_poliklinik'   => $grafikPerPoli,
                'tipe_jaga'        => $grafikTipeJaga,
            ],
        ]);
    }

    /**
     * 2. Melihat Jadwal Jaganya Sendiri + Status Absensi Praktik
     */
    public function jadwalSaya(Request $request)
    {
        $dokter = $this->resolveDokter($request);
        $bulan = $request->input('bulan', now()->format('Y-m'));
        $start = Carbon::parse($bulan . '-01')->startOfMonth()->toDateString();
        $end = Carbon::parse($bulan . '-01')->endOfMonth()->toDateString();

        $jadwal = DB::table('jadwal as j')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->leftJoin('kategori_posisi as kp', 'p.kategori_id', '=', 'kp.id')
            ->leftJoin('absensi_dokter as ad', function ($join) use ($dokter) {
                $join->on('ad.jadwal_id', '=', 'j.id')
                     ->where('ad.id_paramedic', '=', $dokter->id_paramedic);
            })
            ->where('bp.id_paramedic', $dokter->id_paramedic)
            ->where('j.is_deleted', 0)
            ->whereBetween('j.tanggal', [$start, $end])
            ->select(
                'j.id as jadwal_id',
                'j.tanggal',
                'j.peran',
                'j.tipe_jaga',
                'j.jam_mulai',
                'j.jam_selesai',
                'j.kuota_pasien',
                'j.keterangan',
                'p.id_posisi',
                'p.nama_posisi as poliklinik',
                'p.lokasi_ruangan',
                'kp.nama_kategori',
                'ad.id_absensi',
                'ad.waktu_masuk',
                'ad.waktu_keluar',
                'ad.status_kehadiran',
                DB::raw('(SELECT COUNT(*) FROM pendaftaran_konsultasi pk WHERE pk.jadwal_id = j.id AND pk.status_antrian != "Batal") as total_terdaftar')
            )
            ->orderBy('j.tanggal')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $jadwal,
        ]);
    }

    /**
     * 2b. Check-in / Check-out Absensi Praktik Dokter
     */
    public function absensiPraktik(Request $request)
    {
        $dokter = $this->resolveDokter($request);
        $request->validate([
            'jadwal_id' => 'required|integer|exists:jadwal,id',
            'aksi'      => 'required|in:masuk,keluar',
            'catatan'   => 'nullable|string',
        ]);

        $jadwal = Jadwal::findOrFail($request->jadwal_id);

        if ($request->aksi === 'masuk') {
            $jamMulai = Carbon::parse($jadwal->tanggal . ' ' . ($jadwal->jam_mulai ?? '08:00:00'));
            $status = now()->gt($jamMulai->copy()->addMinutes(15)) ? 'Terlambat' : 'Hadir';

            $absensi = AbsensiDokter::updateOrCreate(
                ['jadwal_id' => $jadwal->id, 'id_paramedic' => $dokter->id_paramedic],
                [
                    'tanggal'          => $jadwal->tanggal,
                    'waktu_masuk'      => now(),
                    'status_kehadiran' => $status,
                    'catatan'          => $request->catatan,
                ]
            );
        } else {
            $absensi = AbsensiDokter::where('jadwal_id', $jadwal->id)
                ->where('id_paramedic', $dokter->id_paramedic)
                ->firstOrFail();

            $absensi->update([
                'waktu_keluar' => now(),
                'catatan'      => $request->catatan ?? $absensi->catatan,
            ]);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Absensi praktik berhasil dicatat.',
            'data'    => $absensi,
        ]);
    }

    /**
     * 3. Melihat Pendaftaran Pasien yang Mendaftar untuk Pemeriksaannya
     */
    public function daftarPasien(Request $request)
    {
        $dokter = $this->resolveDokter($request);
        $tanggal = $request->input('tanggal', now()->toDateString());

        $pendaftaran = PendaftaranKonsultasi::with(['pasien', 'jadwal.bagianParamedic.posisi', 'konsultasi'])
            ->whereHas('jadwal.bagianParamedic', function ($q) use ($dokter) {
                $q->where('id_paramedic', $dokter->id_paramedic);
            })
            ->when($tanggal !== 'all', fn($q) => $q->whereDate('tanggal_kunjungan', $tanggal))
            ->orderBy('urutan_antrian')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $pendaftaran,
        ]);
    }

    /**
     * 3b. Panggil Antrian & Simpan Hasil Konsultasi Pemeriksaan Pasien
     */
    public function panggilAntrian(Request $request, int $idPendaftaran)
    {
        $dokter = $this->resolveDokter($request);
        $pendaftaran = PendaftaranKonsultasi::whereHas('jadwal.bagianParamedic', function ($q) use ($dokter) {
            $q->where('id_paramedic', $dokter->id_paramedic);
        })->findOrFail($idPendaftaran);

        $pendaftaran->update([
            'status_antrian'  => 'Dipanggil',
            'waktu_dipanggil' => now(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => "Pasien antrian {$pendaftaran->nomor_antrian} dipanggil.",
            'data'    => $pendaftaran,
        ]);
    }

    public function simpanKonsultasi(Request $request, int $idPendaftaran)
    {
        $dokter = $this->resolveDokter($request);
        $validated = $request->validate([
            'anamnesis_keluhan' => 'required|string',
            'diagnosis'         => 'required|string',
            'tindakan_terapi'   => 'nullable|string',
            'resep_obat'        => 'nullable|string',
            'catatan_dokter'    => 'nullable|string',
        ]);

        $pendaftaran = PendaftaranKonsultasi::whereHas('jadwal.bagianParamedic', function ($q) use ($dokter) {
            $q->where('id_paramedic', $dokter->id_paramedic);
        })->findOrFail($idPendaftaran);

        return DB::transaction(function () use ($pendaftaran, $dokter, $validated) {
            $konsultasi = KonsultasiMedis::updateOrCreate(
                ['id_pendaftaran' => $pendaftaran->id_pendaftaran],
                [
                    'id_paramedic'       => $dokter->id_paramedic,
                    'id_pasien'          => $pendaftaran->id_pasien,
                    'tanggal_konsultasi' => now(),
                    'anamnesis_keluhan'  => $validated['anamnesis_keluhan'],
                    'diagnosis'          => $validated['diagnosis'],
                    'tindakan_terapi'    => $validated['tindakan_terapi'] ?? null,
                    'resep_obat'         => $validated['resep_obat'] ?? null,
                    'catatan_dokter'     => $validated['catatan_dokter'] ?? null,
                ]
            );

            $pendaftaran->update([
                'status_antrian' => 'Selesai',
                'waktu_selesai'  => now(),
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Hasil konsultasi pasien berhasil disimpan.',
                'data'    => $konsultasi,
            ]);
        });
    }

    /**
     * 4. Melihat & Mengunduh Laporan Praktik & Konsultasi Dokter
     */
    public function laporanSaya(Request $request)
    {
        $dokter = $this->resolveDokter($request);
        $start = $request->input('start_date', now()->startOfMonth()->toDateString());
        $end = $request->input('end_date', now()->endOfMonth()->toDateString());

        $rows = DB::table('konsultasi_medis as km')
            ->join('pendaftaran_konsultasi as pk', 'km.id_pendaftaran', '=', 'pk.id_pendaftaran')
            ->join('pasien as ps', 'km.id_pasien', '=', 'ps.id_pasien')
            ->join('jadwal as j', 'pk.jadwal_id', '=', 'j.id')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('posisi as po', 'bp.id_posisi', '=', 'po.id_posisi')
            ->where('km.id_paramedic', $dokter->id_paramedic)
            ->whereBetween(DB::raw('DATE(km.tanggal_konsultasi)'), [$start, $end])
            ->select(
                'km.tanggal_konsultasi',
                'pk.nomor_antrian',
                'ps.no_rm',
                'ps.nama_lengkap as nama_pasien',
                'po.nama_posisi as poliklinik',
                'km.anamnesis_keluhan',
                'km.diagnosis',
                'km.tindakan_terapi',
                'km.resep_obat'
            )
            ->orderByDesc('km.tanggal_konsultasi')
            ->get();

        if ($request->boolean('download')) {
            $filename = "laporan_konsultasi_{$dokter->npk}_{$start}_sd_{$end}.csv";
            return new StreamedResponse(function () use ($rows) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, [
                    'Tanggal Konsultasi', 'No Antrian', 'No RM', 'Nama Pasien',
                    'Poliklinik', 'Keluhan', 'Diagnosis', 'Tindakan/Terapi', 'Resep Obat'
                ]);
                foreach ($rows as $row) {
                    fputcsv($handle, (array) $row);
                }
                fclose($handle);
            }, 200, [
                'Content-Type'        => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        }

        return response()->json([
            'status' => true,
            'periode' => ['start' => $start, 'end' => $end],
            'total'  => $rows->count(),
            'data'   => $rows,
        ]);
    }

    /**
     * 5. Data Profil Dokter (NPK, Spesialis, STR, SIP, Unit Poliklinik)
     */
    public function profilDokter(Request $request)
    {
        $dokter = $this->resolveDokter($request);

        $poliklinikDiampu = DB::table('bagian_paramedic as bp')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->leftJoin('kategori_posisi as kp', 'p.kategori_id', '=', 'kp.id')
            ->where('bp.id_paramedic', $dokter->id_paramedic)
            ->where('bp.is_deleted', 0)
            ->select('p.id_posisi', 'p.nama_posisi', 'p.kode_poli', 'p.lokasi_ruangan', 'kp.nama_kategori')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => [
                'profil'     => $dokter,
                'poliklinik' => $poliklinikDiampu,
            ],
        ]);
    }

    public function updateProfilDokter(Request $request)
    {
        $dokter = $this->resolveDokter($request);
        $validated = $request->validate([
            'npk'          => 'nullable|string|max:255|unique:paramedic,npk,' . $dokter->id_paramedic . ',id_paramedic',
            'spesialisasi' => 'nullable|string|max:150',
            'no_str'       => 'nullable|string|max:100',
            'no_sip'       => 'nullable|string|max:100',
            'no_hp'        => 'nullable|string|max:30',
            'email'        => 'nullable|email|max:150',
        ]);

        $dokter->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Data dokter berhasil diperbarui.',
            'data'    => $dokter,
        ]);
    }

    /**
     * 6. Informasi Poliklinik Rumah Sakit
     */
    public function infoPoliklinik()
    {
        $poli = DB::table('posisi as p')
            ->leftJoin('kategori_posisi as kp', 'p.kategori_id', '=', 'kp.id')
            ->where('p.is_deleted', 0)
            ->select(
                'p.id_posisi',
                'p.nama_posisi as nama_poliklinik',
                'p.kode_poli',
                'p.jam_operasional',
                'p.lokasi_ruangan',
                'p.kuota_harian',
                'p.status_poli',
                'kp.nama_kategori',
                DB::raw('(SELECT COUNT(*) FROM bagian_paramedic bp WHERE bp.id_posisi = p.id_posisi AND bp.is_deleted = 0) as jumlah_dokter')
            )
            ->orderBy('kp.urutan')
            ->orderBy('p.urutan')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $poli,
        ]);
    }
}
