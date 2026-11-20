// app/import/page.tsx
'use client';

import React from 'react';
import ImportWizard from '@/components/import/ImportWizard';
import { downloadTemplateJadwal } from '@/services/importService';

export default function ImportPage() {
  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplateJadwal();
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh template ekspor jadwal.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white shadow-sm border rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 Import Jadwal</h1>
              <p className="text-gray-500">
                Unggah berkas excel jadwal kerja, atasi konflik master data, dan sinkronkan ke sistem utama.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition duration-150"
            >
              📥 Unduh Template Jadwal
            </button>
          </div>
          <ImportWizard />
        </div>
      </div>
    </div>
  );
}