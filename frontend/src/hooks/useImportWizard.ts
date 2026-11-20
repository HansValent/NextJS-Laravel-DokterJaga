// hooks/useImportWizard.ts
import { useEffect, useState, useRef } from 'react';
import { 
  getTemplates, 
  previewJadwal,   
  importJadwal     
} from '@/services/importService';

export interface SheetPreview {
  sheet_name: string;
  headers: string[];
  sample_rows: any[][];
  total_rows?: number;
  detected_header_row?: number;
  first_10_rows?: any[][];
}

export interface JadwalPreviewRow {
  row: number;
  tanggal: string;
  nama_posisi: string;
  nama_paramedic: string;
  peran: string;
  tipe_jaga: string;
  keterangan: string;
  is_valid: boolean;
  note: string;
}

export interface JadwalPreviewData {
  headers: string[];
  preview: JadwalPreviewRow[];
  total_rows: number;
  conflict_posisi: string[];
  conflict_paramedic: string[];
  existing_posisi: { id_posisi: number; nama_posisi: string }[];
  existing_paramedic: { id_paramedic: number; nama_paramedic: string }[];
}

export type MappingState = {
  posisi: { source: 'manual' | 'column'; value: string; column_index?: number };
  tanggal: { column_indices: number[]; format?: string; is_range?: boolean };
  paramedics: { column_index: number; jenis_paramedic: string }[];  
  jam?: { column_index: number };
};

const defaultMapping: MappingState = {
  posisi: { source: 'manual', value: '' },
  tanggal: { column_indices: [] },
  paramedics: [],
};

export default function useImportWizard() {
  const [step, setStep] = useState(0);
  const [headerRow, setHeaderRow] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  
  // State bawaan / Eksisting (Jangan diganggu)
  const [preview, setPreview] = useState<SheetPreview | null>(null);
  const [mapping, setMapping] = useState<MappingState>({
    posisi: { source: 'manual', value: '' },
    tanggal: { column_indices: [] },
    paramedics: [],
  });
  
  const [conflictposisi, setConflictposisi] = useState<Record<string, string | number>>({});
  const [conflictParamedic, setConflictParamedic] = useState<Record<string, string | number>>({});
  
  // State Baru Khusus Penampung Data Struktur Konflik Jadwal dari Backend
  const [jadwalPreview, setJadwalPreview] = useState<JadwalPreviewData | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const headerRowRef = useRef(headerRow);
  headerRowRef.current = headerRow;

  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => {
      if (jadwalPreview) {
        refreshPreviewJadwal();
      } else {
        refreshPreview();
      }
    }, 500); 
    return () => clearTimeout(timer);
  }, [headerRow]); 

  const [templates, setTemplates] = useState<any[]>([]);
  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    }
  };

  /* ==========================================================
     A. METODE BAWAAN / EKSISTING (TIDAK BERUBAH)
     ========================================================== */
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setLoading(true);
    setJadwalPreview(null); 
    try {
      const response = await previewJadwal(selectedFile, sheetIndex, headerRow);
      if (response.success) {
        setPreview(response.data);
        setMapping({ posisi: { source: 'manual', value: '' }, tanggal: { column_indices: [] }, paramedics: [] });
        setConflictposisi({});
        setConflictParamedic({});
      } else {
        setError(response.message);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await previewJadwal(file, sheetIndex, headerRow);
      if (response.success) {
        setPreview(response.data);
        setMapping({ posisi: { source: 'manual', value: '' }, tanggal: { column_indices: [] }, paramedics: [] });
        setConflictposisi({});
        setConflictParamedic({});
      } else {
        setError(response.message);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await importJadwal(
        file,
        sheetIndex,
        headerRow,
        conflictposisi as Record<string, string>,
        conflictParamedic as Record<string, string>
      );
      setResult(res);
      if (!res.success) setError(res.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (sampleRows: any[][]) => {
    // biarkan kosong, backend yang menangani
  };

  /* ==========================================================
     B. 🔥 FITUR TAMBAHAN BARU: KHUSUS ALUR INTERAKTIF JADWAL
     ========================================================== */
  const handleFileChangeJadwal = (selectedFile: File | null) => {
    setFile(selectedFile);
    setJadwalPreview(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep(0);
  };

  const refreshPreviewJadwal = async (targetFile = file) => {
    if (!targetFile) return;
    setLoading(true);
    setError(null);
    try {
      const response = await previewJadwal(targetFile, sheetIndex, headerRow);
      if (response.success) {
        setJadwalPreview(response.data);
        
        const initposisi: Record<string, string | number> = {};
        response.data.conflict_posisi.forEach((name: string) => {
          initposisi[name] = '';
        });
        setConflictposisi(initposisi);

        const initParamedic: Record<string, string | number> = {};
        response.data.conflict_paramedic.forEach((name: string) => {
          initParamedic[name] = '';
        });
        setConflictParamedic(initParamedic);

        setStep(1); 
      } else {
        setError(response.message || 'Gagal memuat pratinjau data jadwal.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runImportJadwal = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      // ✅ PERBAIKAN: Disesuaikan menjadi 5 argumen sesuai kontrak importJadwal di importService.ts
      // Menghapus 'mapping' dari daftar argumen agar urutan datanya sesuai
      const res = await importJadwal(
        file,
        sheetIndex,
        headerRow,
        conflictposisi,
        conflictParamedic
      );
      setResult(res);
      setStep(2); 
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    step, setStep,
    file, setFile: handleFileChange,
    sheetIndex, setSheetIndex,
    headerRow, setHeaderRow,
    refreshPreview,
    preview,
    mapping, setMapping,
    conflictposisi, setConflictposisi,
    conflictParamedic, setConflictParamedic,
    loading, error, setError,
    result, runImport,
    templates, loadTemplates,

    jadwalPreview,
    setFileJadwal: handleFileChangeJadwal,
    refreshPreviewJadwal,
    runImportJadwal,
  };
}