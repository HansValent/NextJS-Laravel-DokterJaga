<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\Pasien;
use App\Models\PendaftaranKonsultasi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PasienPortalController extends Controller
{
    private function resolvePasien(Request $request): Pasien
    {
        $pasien = Pasien::where('user_id', $request->user()->id)->first();
        abort_if(!$pasien, 404, 'Data profil pasien tidak ditemukan.');
        return $pasien;
    }

    /**
     * 1. Rencana Jadwal Dokter & Info Poliklinik (Publik / Tanpa Daftar & Terdaftar)
     */
    public function rencanaJadwalDokter(Request $request)
    {
        $tanggal = $request->input('tanggal', now()->toDateString());
        $idPosisi = $request->input('id_posisi');
        $keyword = $request->input('search');

        $query = DB::table('jadwal as j')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('paramedic as d', 'bp.id_paramedic', '=', 'd.id_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->leftJoin('kategori_posisi as kp', 'p.kategori_id', '=', 'kp.id')
            ->where('j.is_deleted', 0)
            ->where('d.is_deleted', 0)
            ->where('p.is_deleted', 0)
            ->whereDate('j.tanggal', '>=', $tanggal);

        if ($request->filled('tanggal_spesifik')) {
            $query->whereDate('j.tanggal', $request->tanggal_spesifik);
        }

        if ($idPosisi) {
            $query->where('p.id_posisi', $idPosisi);
        }

        if ($keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('d.nama_paramedic', 'like', "%{$keyword}%")
                  ->orWhere('p.nama_posisi', 'like', "%{$keyword}%");
            });
        }

        $jadwal = $query->select(
                'j.id as jadwal_id',
                'j.tanggal',
                'j.peran',
                'j.tipe_jaga',
                'j.jam_mulai',
                'j.jam_selesai',
                'j.kuota_pasien',
                'j.keterangan',
                'd.id_paramedic',
                'd.nama_paramedic as nama_dokter',
                'd.spesialisasi',
                'p.id_posisi',
                'p.nama_posisi as poliklinik',
                'p.kode_poli',
                'p.lokasi_ruangan',
                'p.status_poli',
                'kp.nama_kategori',
                DB::raw('(SELECT COUNT(*) FROM pendaftaran_konsultasi pk WHERE pk.jadwal_id = j.id AND pk.status_antrian != "Batal") as terisi')
            )
            ->orderBy('j.tanggal')
            ->orderBy('p.nama_posisi')
            ->limit(100)
            ->get()
            ->map(function ($item) {
                $item->sisa_kuota = max(0, $item->kuota_pasien - $item->terisi);
                return $item;
            });

        return response()->json([
            'status' => true,
            'data'   => $jadwal,
        ]);
    }

    /**
     * 2. Data Profil Pasien Terdaftar
     */
    public function dataPasien(Request $request)
    {
        $pasien = $this->resolvePasien($request);
        return response()->json([
            'status' => true,
            'data'   => $pasien,
        ]);
    }

    public function updateDataPasien(Request $request)
    {
        $pasien = $this->resolvePasien($request);
        $validated = $request->validate([
            'nama_lengkap'   => 'required|string|max:150',
            'jenis_kelamin'  => 'nullable|in:L,P',
            'no_hp'          => 'nullable|string|max:30',
            'alamat'         => 'nullable|string',
            'golongan_darah' => 'nullable|string|max:5',
            'riwayat_alergi' => 'nullable|string',
        ]);

        $pasien->update($validated);
        $request->user()->update(['name' => $validated['nama_lengkap']]);

        return response()->json([
            'status'  => true,
            'message' => 'Data pasien berhasil diperbarui.',
            'data'    => $pasien,
        ]);
    }

    /**
     * 3. Pendaftaran Konsultasi Dokter Sesuai Jadwal & Nomor Antrian Otomatis
     */
    public function daftarKonsultasi(Request $request)
    {
        $pasien = $this->resolvePasien($request);
        $validated = $request->validate([
            'jadwal_id' => 'required|integer|exists:jadwal,id',
            'keluhan'   => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($pasien, $validated) {
            // Kunci baris jadwal untuk mencegah race condition antrian
            $jadwal = Jadwal::where('id', $validated['jadwal_id'])
                ->where('is_deleted', 0)
                ->lockForUpdate()
                ->firstOrFail();

            if (Carbon::parse($jadwal->tanggal)->lt(now()->startOfDay())) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Tidak dapat mendaftar pada jadwal yang sudah lewat.',
                ], 422);
            }

            // Cek duplikasi pendaftaran pasien pada jadwal yang sama
            $sudahDaftar = PendaftaranKonsultasi::where('id_pasien', $pasien->id_pasien)
                ->where('jadwal_id', $jadwal->id)
                ->where('status_antrian', '!=', 'Batal')
                ->exists();

            if ($sudahDaftar) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Anda sudah terdaftar pada jadwal dokter ini.',
                ], 422);
            }

            // Hitung kuota & nomor urut antrian
            $jumlahTerdaftar = PendaftaranKonsultasi::where('jadwal_id', $jadwal->id)
                ->where('status_antrian', '!=', 'Batal')
                ->count();

            if ($jumlahTerdaftar >= $jadwal->kuota_pasien) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Maaf, kuota pendaftaran untuk jadwal dokter ini sudah penuh.',
                ], 422);
            }

            $urutanAntrian = $jumlahTerdaftar + 1;

            // Ambil kode poli dari relasi bagian_paramedic -> posisi
            $infoPoli = DB::table('bagian_paramedic as bp')
                ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
                ->where('bp.id_bagian_paramedic', $jadwal->id_bagian_paramedic)
                ->select('p.kode_poli', 'p.nama_posisi')
                ->first();

            $prefixPoli = $infoPoli?->kode_poli
                ?: strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $infoPoli->nama_posisi ?? 'PL'), 0, 2));

            $nomorAntrian = $prefixPoli . '-' . str_pad((string) $urutanAntrian, 3, '0', STR_PAD_LEFT);
            $kodeBooking = 'RSC-' . Carbon::parse($jadwal->tanggal)->format('Ymd') . '-' . strtoupper(Str::random(5));

            $pendaftaran = PendaftaranKonsultasi::create([
                'kode_booking'      => $kodeBooking,
                'nomor_antrian'     => $nomorAntrian,
                'urutan_antrian'    => $urutanAntrian,
                'id_pasien'         => $pasien->id_pasien,
                'jadwal_id'         => $jadwal->id,
                'tanggal_kunjungan' => $jadwal->tanggal,
                'keluhan'           => $validated['keluhan'] ?? null,
                'status_antrian'    => 'Menunggu',
                'waktu_daftar'      => now(),
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Pendaftaran konsultasi berhasil.',
                'data'    => $pendaftaran,
            ], 201);
        });
    }

    /**
     * Riwayat Pendaftaran Konsultasi Pasien
     */
    public function riwayatPendaftaran(Request $request)
    {
        $pasien = $this->resolvePasien($request);

        $riwayat = DB::table('pendaftaran_konsultasi as pk')
            ->join('jadwal as j', 'pk.jadwal_id', '=', 'j.id')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('paramedic as d', 'bp.id_paramedic', '=', 'd.id_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->leftJoin('konsultasi_medis as km', 'km.id_pendaftaran', '=', 'pk.id_pendaftaran')
            ->where('pk.id_pasien', $pasien->id_pasien)
            ->select(
                'pk.*',
                'j.tipe_jaga',
                'j.jam_mulai',
                'j.jam_selesai',
                'd.nama_paramedic as nama_dokter',
                'p.nama_posisi as poliklinik',
                'p.lokasi_ruangan',
                'km.diagnosis',
                'km.resep_obat',
                'km.catatan_dokter'
            )
            ->orderByDesc('pk.tanggal_kunjungan')
            ->orderByDesc('pk.id_pendaftaran')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $riwayat,
        ]);
    }

    /**
     * 4. Cetak Nomor Antrian (Struk / Bukti Antrian Siap Cetak)
     */
    public function cetakNomorAntrian(Request $request, int $idPendaftaran)
    {
        $pasien = $this->resolvePasien($request);

        $tiket = DB::table('pendaftaran_konsultasi as pk')
            ->join('pasien as ps', 'pk.id_pasien', '=', 'ps.id_pasien')
            ->join('jadwal as j', 'pk.jadwal_id', '=', 'j.id')
            ->join('bagian_paramedic as bp', 'j.id_bagian_paramedic', '=', 'bp.id_bagian_paramedic')
            ->join('paramedic as d', 'bp.id_paramedic', '=', 'd.id_paramedic')
            ->join('posisi as p', 'bp.id_posisi', '=', 'p.id_posisi')
            ->where('pk.id_pendaftaran', $idPendaftaran)
            ->where('pk.id_pasien', $pasien->id_pasien)
            ->select(
                'pk.id_pendaftaran',
                'pk.kode_booking',
                'pk.nomor_antrian',
                'pk.urutan_antrian',
                'pk.tanggal_kunjungan',
                'pk.status_antrian',
                'pk.keluhan',
                'pk.waktu_daftar',
                'ps.no_rm',
                'ps.nik',
                'ps.nama_lengkap as nama_pasien',
                'ps.tanggal_lahir',
                'd.nama_paramedic as nama_dokter',
                'd.npk as npk_dokter',
                'p.nama_posisi as poliklinik',
                'p.lokasi_ruangan',
                'j.tipe_jaga',
                'j.jam_mulai',
                'j.jam_selesai'
            )
            ->first();

        abort_if(!$tiket, 404, 'Tiket antrian tidak ditemukan.');

        // Estimasi dipanggil: 15 menit per pasien sebelumnya
        $estimasiMulai = Carbon::parse($tiket->tanggal_kunjungan . ' ' . ($tiket->jam_mulai ?? '08:00:00'))
            ->addMinutes(($tiket->urutan_antrian - 1) * 15)
            ->format('H:i');

        return response()->json([
            'status' => true,
            'tiket'  => [
                'rumah_sakit'       => 'Rumah Sakit St. Carolus',
                'kode_booking'      => $tiket->kode_booking,
                'nomor_antrian'     => $tiket->nomor_antrian,
                'tanggal_kunjungan' => $tiket->tanggal_kunjungan,
                'estimasi_panggil'  => $estimasiMulai . ' WIB',
                'poliklinik'        => $tiket->poliklinik,
                'lokasi_ruangan'    => $tiket->lokasi_ruangan ?? 'Gedung Rawat Jalan',
                'dokter'            => $tiket->nama_dokter,
                'pasien'            => [
                    'no_rm'         => $tiket->no_rm,
                    'nama'          => $tiket->nama_pasien,
                    'tanggal_lahir' => $tiket->tanggal_lahir,
                ],
                'status_antrian'    => $tiket->status_antrian,
            ],
        ]);
    }
}
