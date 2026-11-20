// hooks/useExportTemplate.ts
import { useState } from 'react';
import { downloadTemplateJadwal, downloadTemplateParamedic } from '@/services/exportService';

type TemplateType = 'jadwal' | 'paramedic';

export function useExportTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (type: TemplateType) => {
    setLoading(true);
    setError(null);
    try {
      if (type === 'jadwal') {
        await downloadTemplateJadwal();
      } else {
        await downloadTemplateParamedic();
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { download, loading, error };
}