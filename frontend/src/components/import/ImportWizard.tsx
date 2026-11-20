'use client';

import React from 'react';
import useImportWizard, { JadwalPreviewRow } from '@/hooks/useImportWizard';
import PosisiSearchSelect from './PosisiSearchSelect';
import ParamedicSearchSelect from './ParamedicSearchSelect';

const ImportWizard: React.FC = () => {
  const {
    step,
    setStep,
    file,
    headerRow,
    setHeaderRow,
    conflictposisi,
    setConflictposisi,
    conflictParamedic,
    setConflictParamedic,
    loading,
    error,
    result,
    
    // State & Method Baru khusus Alur Jadwal dari useImportWizard
    jadwalPreview,
    setFileJadwal,
    refreshPreviewJadwal,
    runImportJadwal,
  } = useImportWizard();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileJadwal(f);
      refreshPreviewJadwal(f);
    }
  };

  // Cek apakah seluruh konflik nama posisi & paramedic sudah dipetakan ke master
  const isConflictResolved = () => {
    if (!jadwalPreview) return true;
    const posisiUnresolved = Object.values(conflictposisi).some(v => v === '');
    const paramedicUnresolved = Object.values(conflictParamedic).some(v => v === '');
    return !posisiUnresolved && !paramedicUnresolved;
  };

  return (
    <div className="space-y-6">
      {/* STEP 0: UNGGAH FILE */}
      {step === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition duration-150">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="wizard-file-upload"
          />
          <label htmlFor="wizard-file-upload" className="cursor-pointer block">
            <div className="text-gray-600 mb-2 font-medium">Klik untuk unggah atau seret berkas di sini</div>
            <div className="text-xs text-gray-400">Mendukung format Excel (.xlsx, .xls) atau CSV</div>
          </label>
        </div>
      )}

      {/* STEP 1: RESOLUSI KONFLIK & PRATINJAU DATA */}
      {step === 1 && jadwalPreview && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border">
            <div>
              <span className="text-xs font-bold text-gray-500 block uppercase">Dokumen Terpilih</span>
              <span className="text-sm font-semibold text-gray-800">{file?.name}</span>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block uppercase">Baris Header</label>
              <input
                type="number"
                value={headerRow}
                onChange={(e) => setHeaderRow(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border rounded bg-white font-medium"
                min={1}
              />
            </div>
          </div>

          {/* Bagian Resolusi Konflik Nama posisi */}
          {jadwalPreview.conflict_posisi.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-yellow-800">⚠️ Resolusi Konflik Nama posisi</h3>
              <p className="text-xs text-yellow-700">
                Nama posisi berikut tidak dikenali. Pilih master data atau buat baru.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jadwalPreview.conflict_posisi.map((name: string, i: number) => (
                  <div key={i} className="flex flex-col space-y-1 bg-white p-3 rounded-lg border">
                    <span className="text-xs font-medium text-gray-500">
                      Nama di Excel: <strong className="text-gray-800">{name}</strong>
                    </span>
                    <PosisiSearchSelect
                      value={String(conflictposisi[name] || '')}
                      onChange={(value) =>
                        setConflictposisi((prev) => ({ ...prev, [name]: value }))
                      }
                    />
                    {/* Tombol Buat Baru */}
                    <button
                      type="button"
                      onClick={() => setConflictposisi((prev) => ({ ...prev, [name]: 'create' }))}
                      className={`text-xs px-2 py-1 rounded border ${
                        conflictposisi[name] === 'create'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      + Buat Baru
                    </button>
                    {conflictposisi[name] === 'create' && (
                      <span className="text-xs text-blue-600">Akan dibuat otomatis</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bagian Resolusi Konflik Nama Paramedic */}
          {jadwalPreview.conflict_paramedic.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-yellow-800">⚠️ Resolusi Konflik Nama Paramedic</h3>
              <p className="text-xs text-yellow-700">
                Nama paramedic berikut tidak ditemukan dalam sistem. Pilih master data atau buat baru.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jadwalPreview.conflict_paramedic.map((name: string, i: number) => (
                  <div key={i} className="flex flex-col space-y-1 bg-white p-3 rounded-lg border">
                    <span className="text-xs font-medium text-gray-500">
                      Nama di Excel: <strong className="text-gray-800">{name}</strong>
                    </span>
                    <ParamedicSearchSelect
                      value={String(conflictParamedic[name] || '')}
                      onChange={(value) =>
                        setConflictParamedic((prev) => ({ ...prev, [name]: value }))
                      }
                    />
                    {/* Tombol Buat Baru */}
                    <button
                      type="button"
                      onClick={() => setConflictParamedic((prev) => ({ ...prev, [name]: 'create' }))}
                      className={`text-xs px-2 py-1 rounded border ${
                        conflictParamedic[name] === 'create'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      + Buat Baru
                    </button>
                    {conflictParamedic[name] === 'create' && (
                      <span className="text-xs text-blue-600">Akan dibuat otomatis</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pratinjau Lembar Data Matriks */}
          <div className="border rounded-xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Pratinjau Data Matriks Jadwal ({jadwalPreview.total_rows} Baris ditemukan)
              </h3>
            </div>
            <div className="overflow-x-auto max-h-96 text-xs">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 border-b">
                  <tr>
                    <th className="p-2.5 border-r">Baris</th>
                    <th className="p-2.5 border-r">Tanggal</th>
                    <th className="p-2.5 border-r">posisi</th>
                    <th className="p-2.5 border-r">Nama Paramedic</th>
                    <th className="p-2.5 border-r">Peran</th>
                    <th className="p-2.5 border-r">Tipe Jaga</th>
                    <th className="p-2.5">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-600 font-medium">
                  {jadwalPreview.preview.map((row: JadwalPreviewRow, idx: number) => (
                    <tr
                      key={idx}
                      className={row.is_valid ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}
                    >
                      <td className="p-2.5 border-r font-mono text-gray-400 text-center">
                        {row.row}
                      </td>
                      <td className="p-2.5 border-r">{row.tanggal}</td>
                      <td className="p-2.5 border-r">{row.nama_posisi}</td>
                      <td className="p-2.5 border-r">{row.nama_paramedic}</td>
                      <td className="p-2.5 border-r">{row.peran}</td>
                      <td className="p-2.5 border-r">{row.tipe_jaga}</td>
                      <td
                        className={`p-2.5 font-semibold ${
                          row.is_valid ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {row.is_valid ? '✓ Ready' : `⚠️ ${row.note}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tombol Kontrol Aksi Step 1 */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setFileJadwal(null)}
              className="px-4 py-2 text-sm font-medium border rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              Batalkan berkas
            </button>
            <button
              onClick={runImportJadwal}
              disabled={loading || !isConflictResolved()}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition duration-150 shadow-sm ${
                loading || !isConflictResolved()
                  ? 'bg-blue-400 cursor-not-allowed opacity-70'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sedang Memproses...' : 'Proses Simpan Impor'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: HASIL RANGKUMAN IMPORT */}
      {step === 2 && result && (
        <div className="border border-gray-100 rounded-2xl p-6 text-center space-y-6 bg-white shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-xl font-bold">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Transaksi Impor Selesai</h3>
            <p className="text-sm text-gray-500 mt-1">
              Berkas berhasil dianalisis dan disimpan ke basis data.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="text-3xl font-black text-green-600">{result.inserted || 0}</div>
              <div className="text-xs font-semibold text-green-800 uppercase tracking-wider mt-1">
                Berhasil Disimpan
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="text-3xl font-black text-yellow-600">{result.skipped || 0}</div>
              <div className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mt-1">
                Duplikat Dilewati
              </div>
            </div>
          </div>

          {/* Gabungkan rincian duplikat + error */}
          {((result.skipped_details && result.skipped_details.length > 0) || (result.errors && result.errors.length > 0)) && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-left">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                ⚠️ Rincian Catatan Log:
              </h4>
              <ul className="list-disc list-inside text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {result.skipped_details?.map((detail: string, i: number) => (
                  <li key={`skip-${i}`}>⏭️ {detail}</li>
                ))}
                {result.errors?.map((err: string, i: number) => (
                  <li key={`err-${i}`}>❌ {err}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setFileJadwal(null)}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg text-sm transition duration-150"
          >
            Impor Dokumen Baru Lagi
          </button>
        </div>
      )}

      {/* GLOBAL ERROR BANNER ALERT */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImportWizard;