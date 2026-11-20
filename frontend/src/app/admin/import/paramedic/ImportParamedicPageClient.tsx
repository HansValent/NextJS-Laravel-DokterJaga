'use client';

import ParamedicImportWizard from './ParamedicImportModal'; // default export adalah ParamedicImportWizard

export default function ImportParamedicPageClient() {
  return (
    <>
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👨‍⚕️ Import Paramedic</h1>
          <p className="text-gray-500">
            Unggah file Excel/CSV berisi data dokter dan posisiasi, lalu impor ke sistem.
          </p>
        </div>
      </div>
      <ParamedicImportWizard onSuccess={() => window.location.reload()} />
    </>
  );
}