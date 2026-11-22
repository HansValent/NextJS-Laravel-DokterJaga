// services/exportService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL

/**
 * Download template import jadwal (.xlsx)
 */
export async function downloadTemplateJadwal(): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/api/export/template-jadwal`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Gagal download template' }));
    throw new Error(error.message || 'Gagal download template');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_import_jadwal.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Download template import paramedic (.xlsx)
 */
export async function downloadTemplateParamedic(): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/api/export/template-paramedic`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Gagal download template' }));
    throw new Error(error.message || 'Gagal download template');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_import_paramedic.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}