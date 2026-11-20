// components/paramedic/ParamedicImportModal.tsx
'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { previewParamedic, importParamedic } from '@/services/importService';

type posisiOption = { id: number; nama: string };

interface Props {
  onSuccess?: () => void;
}

/** Komponen dropdown yang bisa diketik untuk mencari */
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Cari...',
}: {
  options: posisiOption[];
  value: string | number;
  onChange: (val: string | number) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const selectedLabel = value === 'create' ? '+ Buat Baru' : selectedOption?.nama ?? '';

  const filteredOptions = useMemo(() => {
    if (search.trim() === '') return options;
    return options.filter((opt) =>
      opt.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string | number) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center border rounded px-3 py-2 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <input
            autoFocus
            className="w-full outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
          />
        ) : (
          <span className="text-sm text-gray-700 flex-1 truncate">
            {selectedLabel || placeholder}
          </span>
        )}
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-48 overflow-auto">
          {/* Opsi Buat Baru selalu di atas */}
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 font-medium border-b"
            onClick={() => handleSelect('create')}
          >
            + Buat Baru
          </button>

          {filteredOptions.length === 0 && search.trim() !== '' && (
            <div className="px-3 py-2 text-sm text-gray-400">Tidak ada hasil</div>
          )}

          {filteredOptions.map((opt) => (
            <button
              key={opt.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => handleSelect(opt.id)}
            >
              {opt.nama}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ParamedicImportWizard({ onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [existingposisi, setExistingposisi] = useState<posisiOption[]>([]);
  const [conflictNames, setConflictNames] = useState<string[]>([]);
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, string | number>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setLoading(true);
    setError(null);
    try {
      const res = await previewParamedic(f);
      if (!res.success) throw new Error(res.message);
      setPreviewData(res.data.preview);
      const list = Object.entries(res.data.existing_posisi).map(([id, nama]) => ({
        id: Number(id),
        nama: nama as string,
      }));
      setExistingposisi(list);
      setConflictNames(res.data.conflict_posisi);
      const defaultRes: Record<string, string> = {};
      res.data.conflict_posisi.forEach((name: string) => {
        defaultRes[name] = 'create';
      });
      setConflictResolutions(defaultRes);
      setStep(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await importParamedic(file, conflictResolutions);
      setResult(result);
      setStep(2);
      onSuccess?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 0 && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Pilih File Excel
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Resolusi posisi Baru</h2>
          {conflictNames.length === 0 ? (
            <p className="text-green-600 mb-4">Semua posisi sudah terdaftar. Lanjutkan impor.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {conflictNames.map((name) => (
                <div key={name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="w-48 font-medium text-sm">{name}</span>
                  <div className="flex-1 max-w-xs">
                    <SearchableSelect
                      options={existingposisi}
                      value={conflictResolutions[name]}
                      onChange={(val) =>
                        setConflictResolutions((prev) => ({
                          ...prev,
                          [name]: val,
                        }))
                      }
                      placeholder="Cari posisi..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-auto max-h-60 border rounded p-2 mb-4">
            <table className="text-sm">
              <thead>
                <tr>
                  <th className="px-2">Nama Dokter</th>
                  <th className="px-2">posisiasi</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2">{row[0]}</td>
                    <td className="px-2">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Proses Import
          </button>
        </div>
      )}

      {step === 2 && result && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Hasil Import</h2>
          <p className="text-green-700">{result.success}</p>
          {result.errors?.length > 0 && (
            <div className="mt-4 text-left">
              <p className="font-medium">Error:</p>
              <ul className="list-disc list-inside text-red-600">
                {result.errors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => {
              setStep(0);
              setFile(null);
              setResult(null);
            }}
            className="mt-4 bg-gray-300 px-4 py-2 rounded"
          >
            Import Lagi
          </button>
        </div>
      )}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}