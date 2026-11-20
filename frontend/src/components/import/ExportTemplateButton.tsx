// components/export/ExportTemplateButton.tsx
'use client';

import React from 'react';
import { useExportTemplate } from '@/hooks/useExportTemplate';

interface ExportTemplateButtonProps {
  type: 'jadwal' | 'paramedic';
  className?: string;
  children?: React.ReactNode;
}

export default function ExportTemplateButton({
  type,
  className = '',
  children,
}: ExportTemplateButtonProps) {
  const { download, loading, error } = useExportTemplate();

  const handleClick = () => download(type);

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        } ${className}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memuat...
          </>
        ) : (
          children || <>📥 Download Template Excel</>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}