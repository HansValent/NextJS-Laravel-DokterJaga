// services/importService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export async function previewJadwal(file: File, sheetIndex = 0, headerRow = 1) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sheet_index', String(sheetIndex));
  formData.append('header_row', String(headerRow));

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/import/jadwal/preview`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal memuat pratonton.' }));
    throw new Error(err.message || 'Gagal memuat pratonton.');
  }
  return res.json();
}

export async function importJadwal(
  file: File,
  sheetIndex: number,
  headerRow: number,
  conflictposisi: Record<string, string | number>,
  conflictParamedic: Record<string, string | number>
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sheet_index', String(sheetIndex));
  formData.append('header_row', String(headerRow));
  formData.append('conflict_posisi', JSON.stringify(conflictposisi));
  formData.append('conflict_paramedic', JSON.stringify(conflictParamedic));

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/import/jadwal/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal memproses import data.' }));
    throw new Error(err.message || 'Gagal memproses import data.');
  }
  return res.json();
}

export async function downloadTemplateJadwal() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/export/template-jadwal`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Gagal mengunduh template ekspor.');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_import_jadwal.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function getTemplates() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/import-templates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function saveTemplate(data: { name: string; mapping: any }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/import-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, type: 'jadwal' }),
  });
  return res.json();
}

export async function importParamedic(file: File, conflictMap: Record<string, string | number>) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('conflict_posisi', JSON.stringify(conflictMap));

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/import/paramedic`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Import failed' }));
    throw new Error(err.message || 'Import failed');
  }
  return res.json();
}


export async function previewParamedic(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/import/paramedic/preview`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Preview failed');
  return res.json();
}

export async function downloadTemplateParamedic() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/export/template-paramedic`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_paramedic.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}