import { Users } from "lucide-react"
import { fetchAPI, BASE_URL } from "./api"
import type {
  User,
  Role,
  Permission,
  UserRole,
  UserPermission,
  LoginResponse,
  CreateUserPayload,
  PenanggungJawab,
  CreatePJPayload,
  UpdatePJPayload,
  PJMap,
  Posisi,
  Jadwal,
  posisiPayload,
} from "@/lib/type"


//
// ======================
// 📌 TYPES
// ======================
//

export type CreateJadwalPayload = {
  id_bagian_paramedic?: number;
  tanggal: string;
  peran?: string;
  tipe_jaga?: string;
  keterangan?: string | null;
};


export type UpdateJadwalPayload = {
  id_bagian_paramedic?: number;
  tanggal: string;
  peran?: string;
  tipe_jaga?: string;
  keterangan?: string | null;
}


export type Paramedic = {
  id: number
  nama_paramedic: string
  npk?: string | null
  jenis_paramedic: string

  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
  deleted_by?: string | null
  deleted_at?: string | null
}

export type BagianParamedic = {
  id_bagian_paramedic?: number
  id_paramedic: number
  id_posisi: number
  nama_paramedic?: string
  nama_posisi?: string

  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
  deleted_by?: string | null
  deleted_at?: string | null
}

export type CreateBagianParamedicPayload = {
  id_paramedic: number
  id_posisi: number
}

export type BagianParamedicView = {
  id: number
  paramedic_id: number
  posisi_id: number
  paramedic_nama: string
  posisi_nama: string

  // 🔥 Tambahan
  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
  deleted_by?: string | null
  deleted_at?: string | null
  is_deleted?: number  
}


export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}
//
// ======================
// 📌 MAPPING
// ======================
//

function normalizeJadwal(item: any): Jadwal {
  return {
    id: item.id,
    tanggal: item.tanggal,
    id_bagian_paramedic: item.id_bagian_paramedic,
    peran: item.peran || 'Utama',
    tipe_jaga: item.tipe_jaga || '-',
    keterangan: item.keterangan ?? null,
    paramedic: {
      id_paramedic: item.paramedic?.id_paramedic ?? item.paramedic_id ?? 0,
      nama_paramedic: item.paramedic?.nama_paramedic ?? item.paramedic_nama ?? '-',
      jenis_paramedic: item.paramedic?.jenis_paramedic ?? item.paramedic_jenis_paramedic ?? '',
    },
    posisi: {
      id: item.posisi?.id ?? item.posisi_id ?? 0,
      nama_posisi: item.posisi?.nama_posisi ?? item.posisi_nama ?? '-',
      kategori_id: item.posisi?.kategori_id ?? 0,
      kategori_nama: item.posisi?.nama_kategori ?? '',
      kategori_urutan: item.posisi?.kategori_urutan ?? 0,
      urutan: item.posisi?.urutan ?? 0,
    },
    created_by: item.created_by ?? null,
    created_by_name: item.creator_name ?? null,
    created_at: item.created_at ?? null,
    updated_by: item.updated_by ?? null,
    updated_at: item.updated_at ?? null,
    deleted_by: item.deleted_by ?? null,
    deleted_at: item.deleted_at ?? null,
  };
}



function normalizeParamedic(item: any): Paramedic {
  return {
    id: item.id ?? item.id_paramedic, // 🔥 FIX UTAMA

    nama_paramedic: item.nama_paramedic,
    npk: item.npk ?? null,
    jenis_paramedic: item.jenis_paramedic,

    created_by: item.created_by ?? null,
    created_at: item.created_at ?? null,
    updated_by: item.updated_by ?? null,
    updated_at: item.updated_at ?? null,
    deleted_by: item.deleted_by ?? null,
    deleted_at: item.deleted_at ?? null,
  }
}

function normalizeposisi(item: any): Posisi {
  return {
    id: item.id ?? item.id_posisi,
    nama_posisi: item.nama_posisi,

    kategori_id: item.kategori_id,
    kategori_nama: item.nama_kategori,
    kategori_urutan: item.kategori_urutan,

    urutan: item.urutan ?? 0,

    created_by: item.created_by ?? null,
    created_at: item.created_at ?? null,
    updated_by: item.updated_by ?? null,
    updated_at: item.updated_at ?? null,
    deleted_by: item.deleted_by ?? null,
    deleted_at: item.deleted_at ?? null,
  }
}

function normalizeBgParamedic(item: any): BagianParamedic {
  return {
    id_bagian_paramedic: item.id ?? item.id_bagian_paramedic,
    id_posisi: item.id_posisi,
    id_paramedic: item.id_paramedic,

    created_by: item.created_by ?? null,
    created_at: item.created_at ?? null,
    updated_by: item.updated_by ?? null,
    updated_at: item.updated_at ?? null,
    deleted_by: item.deleted_by ?? null,
    deleted_at: item.deleted_at ?? null,
  }
}

function normalizeBgView(item: any): BagianParamedicView {
  return {
    id: item.id,
    paramedic_id: item.paramedic_id,
    posisi_id: item.posisi_id,
    paramedic_nama: item.paramedic_nama,
    posisi_nama: item.posisi_nama,
    created_by: item.created_by ?? null,
    created_at: item.created_at ?? null,
    updated_by: item.updated_by ?? null,
    updated_at: item.updated_at ?? null,
    deleted_by: item.deleted_by ?? null,
    deleted_at: item.deleted_at ?? null,
    is_deleted: item.is_deleted ?? 0,
  }
}

function normalizePJ(item: any): PenanggungJawab {
  return {
    id: item.id_penanggung_jawab ?? item.id,
    tanggal: item.tanggal,
    id_perawat: item.id_perawat ?? null,
    id_kepala_jaga: item.id_kepala_jaga ?? null,
    id_ponek: item.id_ponek ?? null,

    // 🔥 Ambil nama dari objek relasi (sesuai response controller)
    perawat_nama: item.perawat?.nama_paramedic ?? null,
    kepala_jaga_nama: item.kepala_jaga?.nama_paramedic ?? null,
    ponek_nama: item.ponek?.nama_paramedic ?? null,

    created_by: item.created_by ?? null,
    created_at: item.created_at ?? null,
    updated_by: item.updated_by ?? null,
    updated_at: item.updated_at ?? null,
    deleted_by: item.deleted_by ?? null,
    deleted_at: item.deleted_at ?? null,
  };
}


//
// ======================
// 📌 ENDPOINT HELPER
// ======================
//

const API = {
  mePermissions: "/api/me/permissions",
  jadwal: "/api/jadwal",
  paramedic: "/api/paramedic",
  posisi: "/api/posisi",
  header: "/api/header-jadwal",
  bagianParamedic: "/api/bagian-paramedic",
  bagianParamedicView: "/api/bagian-paramedicView",
  pj: "/api/penanggung_jawab",
  pjCalendar: "/api/penanggung-jawabCalendar",
  pjPublic: "/api/penanggung-jawabDisplay",
  users: "/api/users",
  roles: "/api/roles",
  permissions: "/api/permissions",
  rolePermission: "/api/role-permission",
  userRole: "/api/users-role",
  userPermission: "/api/users-permission",
  login: "/api/login",
  jadwalPublic : "/api/jadwalDisplay",
  paramedicPublic : "/api/paramedicDisplay",
  posisiPublic : "/api/posisiDisplay",
  bagianparamedicPublic : "/api/bagian-paramedicDisplay",
  deletedParamedic: "/api/paramedic-deleted",
  deletedposisi: "/api/posisi-deleted",
  deletedJadwal: "/api/jadwal-deleted",
  deletedPJ: "/api/PJ-deleted",
  restoreJadwal: "/api/jadwal/restore",
  restorePJ: "/api/penanggung_jawab/restore",
  restoreParamedic: "/api/paramedic/restore",
  restoreposisi: "/api/posisi/restore",
  KategoriPosisi: "/api/kategori-posisi",
}

export async function getMyPermissions() {
  const res = await fetchAPI<ApiResponse<string[]>>(
    API.mePermissions
  )

  return res.data || []
}

//
// ======================
// 📌 Display
// ======================
//

export async function getJadwalDisplay() {
  const res = await fetchAPI<any>(API.jadwalPublic)

  const raw = Array.isArray(res) ? res : res.data

  return raw.map(normalizeJadwal)
}

export async function getJadwalAdmin(showDeleted?: boolean) {

  const endpoint = `${API.jadwal}?show_deleted=${showDeleted ? 1 : 0}`;

  const res = await fetchAPI<any>(endpoint)

  const raw = Array.isArray(res) ? res : res.data

  return {
    success: true,
    data: raw.map(normalizeJadwal),
  }
}

export async function getposisiAdmin(
  showDeleted?: boolean
): Promise<Posisi[]> {

  const endpoint = `${API.posisiPublic}?show_deleted=${showDeleted ? 1 : 0}`

  const res = await fetchAPI<any>(endpoint)

  const raw = Array.isArray(res) ? res : res.data

  if (!raw) return []

  return raw.map(normalizeposisi)
}



export async function getposisiDisplay() {
  const res = await fetchAPI<any>(API.posisiPublic)

  const raw = Array.isArray(res) ? res : res.data

  if (!raw) return

  return raw.map(normalizeposisi)
}

export async function getParamedicAdmin(showDeleted?: boolean) {

  const endpoint = `${API.paramedicPublic}?show_deleted=${showDeleted ? 1 : 0}`

  const res = await fetchAPI<any>(endpoint)

  const raw = Array.isArray(res) ? res : res.data

  if (!raw) {
    throw new Error("Data paramedic tidak ditemukan")
  }

  return raw.map(normalizeParamedic)
}

export async function getBagianParamedicAdmin(
  showDeleted?: boolean
): Promise<ApiResponse<BagianParamedicView[]>> {

  const endpoint = `${API.bagianparamedicPublic}?show_deleted=${showDeleted ? 1 : 0}`

  const res = await fetchAPI<any>(endpoint)

  const raw = Array.isArray(res) ? res : res.data

  return {
    ...(Array.isArray(res) ? { success: true } : res),
    data: raw.map(normalizeBgView),
  }
}


//
// ======================
// 📌 JADWAL
// ======================
//

export async function getJadwalById(id: number) {
  const res = await fetchAPI<ApiResponse<any>>(
    `${API.jadwal}/${id}`
  )

  return {
    ...res,
    data: normalizeJadwal(res.data),
  }
}

export async function getJadwalByRange(
  start: string,
  end: string,
  posisi_id?: number
) {
  let endpoint = `${API.jadwal}?start=${start}&end=${end}`

  if (posisi_id) {
    endpoint += `&posisi_id=${posisi_id}`
  }

  const res = await fetchAPI<any>(endpoint)

  const raw = Array.isArray(res) ? res : res.data

  return {
    ...res,
    data: raw.map(normalizeJadwal),
  }
}

export async function getJadwal() {
  const res = await fetchAPI<ApiResponse<any[]>>(API.jadwal)

  return {
    ...res,
    data: res.data.map(normalizeJadwal),
  }
}

export async function restoreJadwal(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.restoreJadwal}/${id}`,
    {
      method: "PUT",
    }
  )
}

export async function getDeletedJadwal() {
  const res = await fetchAPI<any>(API.deletedJadwal)
  const raw = Array.isArray(res) ? res : res.data
  return raw.map(normalizeJadwal)
}

export async function createJadwal(data: CreateJadwalPayload) {
  return await fetchAPI<any>(API.jadwal, {
    method: "POST",
    body: data,
  })
}


export async function updateJadwal(
  id: number,
  data: UpdateJadwalPayload
) {
  const res = await fetchAPI<ApiResponse<any>>(
    `${API.jadwal}/${id}`,
    {
      method: "PUT",
      body: data,
    }
  )

  return {
    ...res,
    data: normalizeJadwal(res.data),
  }
}

export async function deleteJadwal(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.jadwal}/${id}`,
    {
      method: "DELETE",
    }
  )
}

export async function deletePermanentJadwal(id: number) {
  return fetchAPI<ApiResponse<{ id: number }>>(
    `/api/jadwal/${id}/permanent`,
    { method: "DELETE" }
  );
}

//
// ======================
// 📌 CALENDAR (JADWAL MAP)
// ======================
//

export type JadwalMap = Record<string, string[]>

export async function getJadwalCalendar(
  start: string,
  end: string,
  posisi_id?: number | ""
): Promise<JadwalMap> {

  let endpoint = `${API.jadwal}/calendar?start=${start}&end=${end}`

  // 🔥 optional filter
  if (posisi_id) {
    endpoint += `&posisi_id=${posisi_id}`
  }

  const res = await fetchAPI<any>(endpoint)

  return res.data || {}
}

// 📌 COPY WEEK FLEKSIBEL (CUSTOM RANGE)
export async function copyWeekJadwalCustom(
  sourceStart: string,
  sourceEnd: string,
  targetStart: string
) {
  return fetchAPI<{
    success: boolean;
    copied_count: number;
    skipped_count: number;
    message?: string;
  }>('/api/jadwal/copy-week', {
    method: 'POST',
    body: {
      source_start: sourceStart,
      source_end: sourceEnd,
      target_start: targetStart,
    },
  });
}

// 📌 COPY DAY (SATU HARI KE HARI LAIN)
export async function copyDayJadwal(
  sourceDate: string,
  targetDate: string
) {
  return fetchAPI<{
    success: boolean;
    copied_count: number;
    skipped_count: number;
    message?: string;
  }>('/api/jadwal/copy-day', {
    method: 'POST',
    body: {
      source_date: sourceDate,
      target_date: targetDate,
    },
  });
}


//
// ======================
// 📌 PARAMEDIC
// ======================
//

export async function getParamedic() {
  const res = await fetchAPI<any>(API.paramedic)

  const raw = Array.isArray(res) ? res : res.data

  if (!raw) {
    throw new Error("Data paramedic tidak ditemukan")
  }

  return raw.map(normalizeParamedic)
}

export async function restoreParamedic(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.restoreParamedic}/${id}`,
    {
      method: "PUT",
    }
  )
}

export async function getDeletedParamedic() {
  const res = await fetchAPI<any>(API.deletedParamedic)
  const raw = Array.isArray(res) ? res : res.data
  return raw.map(normalizeParamedic)
}

export async function createParamedic(
  data: Omit<Paramedic, "id">
) {
  return fetchAPI<ApiResponse<Paramedic>>(API.paramedic, {
    method: "POST",
    body: data,
  })
}

export async function updateParamedic(
  id: number,
  data: Partial<Paramedic>
) {
  return fetchAPI<ApiResponse<Paramedic>>(
    `${API.paramedic}/${id}`,
    {
      method: "PUT",
      body: data,
    }
  )
}

export async function deleteParamedic(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.paramedic}/${id}`,
    {
      method: "DELETE",
    }
  )
}

export async function deletePermanentParamedic(id: number) {
  return fetchAPI<ApiResponse<{ id: number }>>(
    `/api/paramedic/${id}/permanent`,
    { method: "DELETE" }
  );
}

//
// ======================
// 📌 posisi
// ======================
//

export async function getposisi(): Promise<Posisi[]> {
  const res = await fetchAPI<any>(API.posisi)

  const raw = Array.isArray(res) ? res : res.data

  if (!raw) {
    throw new Error("Data posisi tidak ditemukan")
  }

  return raw.map(normalizeposisi)
}

export async function reorderposisi(
  items: { id: number; urutan: number; kategori_id: number | null }[]
) {
  if (!items.length) return

  console.log("📦 REORDER PAYLOAD:", items)

  return fetchAPI<ApiResponse<null>>(
    `/api/posisi/reorder`,
    {
      method: "POST",
      body: { items },
    }
  )
}


export async function restoreposisi(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.restoreposisi}/${id}`,
    {
      method: "PUT",
    }
  )
}

export async function getDeletedposisi() {
  const res = await fetchAPI<any>(API.deletedposisi)
  const raw = Array.isArray(res) ? res : res.data
  return raw.map(normalizeposisi)
}

export async function createposisi(
  data: posisiPayload
) {
  return fetchAPI<ApiResponse<Posisi>>(API.posisi, {
    method: "POST",
    body: data,
  })
}

export async function updateposisi(
  id: number,
  data: posisiPayload
) {
  return fetchAPI<ApiResponse<Posisi>>(
    `${API.posisi}/${id}`,
    {
      method: "PUT",
      body: data,
    }
  )
}

export async function deleteposisi(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.posisi}/${id}`,
    {
      method: "DELETE",
    }
  )
}

export async function deletePermanentposisi(id: number) {
  return fetchAPI<ApiResponse<{ id: number }>>(
    `/api/posisi/${id}/permanent`,
    { method: "DELETE" }
  );
}

import type { Kategori } from "@/lib/type"

export async function getKategoriPosisi(): Promise<Kategori[]> {
  try {
    const res = await fetchAPI<any>(API.KategoriPosisi)

    // 🔥 handle 2 kemungkinan response (array / object)
    const raw = Array.isArray(res) ? res : res.data

    if (!raw) return []

    return raw.map((item: any) => ({
      id: item.id,
      nama_kategori: item.nama_kategori,
      urutan: item.urutan ?? 0,

      created_by: item.created_by ?? null,
      created_at: item.created_at ?? null,
      updated_by: item.updated_by ?? null,
      updated_at: item.updated_at ?? null,
      deleted_by: item.deleted_by ?? null,
      deleted_at: item.deleted_at ?? null,
    }))
  } catch (err) {
    console.error("❌ Gagal fetch kategori posisi:", err)
    return [] // 🔥 biar UI ga crash
  }
}



//
// ======================
// 📌 Bagian Paramedic
// ======================
//

export async function getBagianParamedic(): Promise<ApiResponse<BagianParamedic[]>> {
    const res = await fetchAPI<any>(API.bagianParamedic)

  // 🔥 HANDLE 2 kemungkinan response
  const rawData = Array.isArray(res) ? res : res.data

  if (!rawData) {
    throw new Error("Data bagian paramedic tidak ditemukan")
  }

  return {
    ...(Array.isArray(res) ? { success: true } : res),
    data: rawData.map(normalizeBgParamedic),
  }
}

export async function getBagianParamedicView(): Promise<ApiResponse<BagianParamedicView[]>> {
  const res = await fetchAPI<any>(API.bagianParamedicView)

  const raw = Array.isArray(res) ? res : res.data
  console.log("DATA RAW:", res.data)

  return {
    ...(Array.isArray(res) ? { success: true } : res),
    data: raw.map(normalizeBgView),
  }
}

export async function createBagianParamedic(data: CreateBagianParamedicPayload) {
  const res = await fetchAPI<ApiResponse<any>>(API.bagianParamedic, {
    method: "POST",
    body: data,
  })
  return { ...res, data: normalizeBgParamedic(res.data) }
}

export async function updateBagianParamedic(id: number, data: Partial<CreateBagianParamedicPayload>) {
  const res = await fetchAPI<ApiResponse<any>>(`${API.bagianParamedic}/${id}`, {
    method: "PUT",
    body: data,
  })
  return { ...res, data: normalizeBgParamedic(res.data) }
}

export async function deleteBagianParamedic(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.bagianParamedic}/${id}`,
    {
      method: "DELETE",
    }
  )
}

export async function restoreBagianParamedic(id: number) {
  return fetchAPI<ApiResponse<BagianParamedic>>(
    `/api/bagian-paramedic/restore/${id}`,
    { method: "PUT" }
  );
}

export async function deletePermanentBagianParamedic(id: number) {
  return fetchAPI<ApiResponse<{ id: number }>>(
    `/api/bagian-paramedic/${id}/permanent`,
    { method: "DELETE" }
  );
}

//
// ======================
// 📌 Penanggung Jawab
// ======================
//
export async function getPJAdmin(
  showDeleted?: boolean
): Promise<ApiResponse<PenanggungJawab[]>> {

  const endpoint = `${API.pj}?show_deleted=${showDeleted ? 1 : 0}`

  const res = await fetchAPI<any>(endpoint)

  const raw = Array.isArray(res) ? res : res.data

  return {
    ...(Array.isArray(res) ? { success: true } : res),
    data: raw.map(normalizePJ),
  }
}

export async function getPJDisplay(): Promise<PenanggungJawab[]> {
  const res = await fetchAPI<any>(API.pjPublic)

  const raw = Array.isArray(res) ? res : res.data

  return raw.map(normalizePJ)
}

export async function createPJ(data: CreatePJPayload) {
  return fetchAPI<ApiResponse<PenanggungJawab>>(API.pj, {
    method: "POST",
    body: data,
  })
}

export async function restorePJ(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.restorePJ}/${id}`,
    {
      method: "PUT",
    }
  )
}

export async function getDeletedPJ() {
  const res = await fetchAPI<any>(API.deletedPJ)
  const raw = Array.isArray(res) ? res : res.data
  return raw.map(normalizePJ)
}

export async function updatePJ(
  id: number,
  data: UpdatePJPayload
) {
  const res = await fetchAPI<ApiResponse<any>>(
    `${API.pj}/${id}`,
    {
      method: "PUT",
      body: data,
    }
  )

  return {
    ...res,
    data: normalizePJ(res.data),
  }
}

export async function deletePJ(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.pj}/${id}`,
    {
      method: "DELETE",
    }
  )
}

export async function deletePermanentPJ(id: number) {
  return fetchAPI<ApiResponse<{ id: number }>>(
    `/api/penanggung_jawab/${id}/permanent`,
    { method: "DELETE" }
  );
}

export async function getPJCalendar(
  start: string,
  end: string
): Promise<PJMap> {

  const endpoint = `${API.pjCalendar}?start=${start}&end=${end}`

  const res = await fetchAPI<any>(endpoint)

  return res.data || {}
}

//
// ======================
// 📌 PARAMEDIC UTILS
// ======================
//

export type ParamedicSortKey = "id" | "nama_paramedic" | "npk"

export function filterSortParamedic(
  data: Paramedic[],
  search: string,
  sortKey: ParamedicSortKey,
  sortAsc: boolean
) {
  let result = [...data]

  // 🔍 FILTER
  if (search.trim()) {
    const keyword = search.toLowerCase()

    result = result.filter((item) => {
      return (
        item.nama_paramedic.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword) ||
        (item.npk && item.npk.toLowerCase().includes(keyword))
      )
    })
  }

  // 🔃 SORT
  result.sort((a, b) => {
    const valA = a[sortKey]
    const valB = b[sortKey]

    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA
    }

    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA))
  })

  return result
}

//
// ======================
// 📌 posisi UTILS
// ======================
//

export type posisiSortKey = "id" | "nama_posisi"

export function filterSortposisi(
  data: Posisi[],
  search: string,
  sortKey: posisiSortKey,
  sortAsc: boolean
) {
  let result = [...data]

  // 🔍 FILTER (ID + NAMA)
  if (search.trim()) {
    const keyword = search.toLowerCase()

    result = result.filter((item) => {
      return (
        item.nama_posisi.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
      )
    })
  }

  // 🔃 SORT
  result.sort((a, b) => {
    const valA = a[sortKey]
    const valB = b[sortKey]

    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA
    }

    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA))
  })

  return result
}

// ======================
// 📌 KATEGORI posisi
// ======================

export async function getKategoriPosisiAdmin(): Promise<ApiResponse<Kategori[]>> {
  const res = await fetchAPI<ApiResponse<Kategori[]>>('/api/kategori-posisi');
  return res;
}

export async function createKategoriPosisi(data: {
  nama_kategori: string;
  urutan?: number;
}): Promise<ApiResponse<Kategori>> {
  return fetchAPI<ApiResponse<Kategori>>('/api/kategori-posisi', {
    method: 'POST',
    body: data,
  });
}

export async function updateKategoriPosisi(
  id: number,
  data: { nama_kategori: string; urutan?: number }
): Promise<ApiResponse<Kategori>> {
  return fetchAPI<ApiResponse<Kategori>>(`/api/kategori-posisi/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteKategoriPosisi(id: number): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/api/kategori-posisi/${id}`, {
    method: 'DELETE',
  });
}



//
// ======================
// 📌 USERS
// ======================
//


export async function createUser(data: CreateJadwalPayload, ) {
    console.log("CREATE PAYLOAD:", data)

  return fetchAPI<ApiResponse<User>>(API.users, {
    method: "POST",
    body: data,
  })
}

export async function updateUser(id: number, data: Partial<User>) {
  console.log("BASE_URL:", BASE_URL)
  return fetchAPI<ApiResponse<User>>(`${API.users}/${id}`, {
    method: "PUT",
    body: data,
    
  })
}

export async function deleteUser(id: number) {
  return fetchAPI<ApiResponse<null>>(`${API.users}/${id}`, {
    method: "DELETE",
  })
}


//
// ======================
// 📌 ROLES
// ======================
//
export async function getRoles() {
  return fetchAPI<ApiResponse<Role[]>>(API.roles)
}

export async function createRole(data: { role_name: string }) {
  return fetchAPI<ApiResponse<Role>>(API.roles, {
    method: "POST",
    body: data,
  })
}

export async function updateRole(id: number, data: Partial<Role>) {
  return fetchAPI<ApiResponse<Role>>(`${API.roles}/${id}`, {
    method: "PUT",
    body: data,
  })
}

export async function deleteRole(id: number) {
  return fetchAPI<ApiResponse<null>>(`${API.roles}/${id}`, {
    method: "DELETE",
  })
}

//
// ======================
// 📌 PERMISSION
// ======================
//
export async function getPermissions() {
  return fetchAPI<ApiResponse<Permission[]>>(API.permissions)
}

export async function createPermission(data: { permission_name: string }) {
  return fetchAPI<ApiResponse<Permission>>(API.permissions, {
    method: "POST",
    body: data,
  })
}

export async function updatePermission(id: number, data: Partial<Permission>) {
  return fetchAPI<ApiResponse<Permission>>(`${API.permissions}/${id}`, {
    method: "PUT",
    body: data,
  })
}

export async function deletePermission(id: number) {
  return fetchAPI<ApiResponse<null>>(`${API.permissions}/${id}`, {
    method: "DELETE",
  })
}

//
// ======================
// 📌 ROLE PERMISSION
// ======================
//
export async function getRolePermission() {
  return fetchAPI<ApiResponse<any[]>>(API.rolePermission)
}

export async function updateRolePermission(
  role_id: number,
  permissions: number[]
) {
  return fetchAPI<ApiResponse<Role>>(
    `${API.rolePermission}/${role_id}`,
    {
      method: "POST",
      body: { permissions },
    }
  )
}


//
// ======================
// 📌 USER ROLE
// ======================
//
export async function getUserRole() {
  return fetchAPI<ApiResponse<UserRole[]>>(API.userRole)
}

export async function updateUserRole(
  user_id: number,
  roles: number[]
) {
  return fetchAPI<ApiResponse<User>>(
    `${API.userRole}/${user_id}`,
    {
      method: "POST",
      body: { roles },
    }
  )
}


//
// ======================
// 📌 USER PERMISSION
// ======================
//

export async function getUserPermission() {
  return fetchAPI<ApiResponse<UserPermission[]>>(API.userPermission)
}

export async function updateUserPermission(
  user_id: number,
  permissions: number[]
) {
  return fetchAPI<ApiResponse<User>>(
    `${API.userPermission}/${user_id}`,
    {
      method: "POST",
      body: { permissions },
    }
  )
}


export type MoD = {
  tanggal: string;
  pagi: { npk: string; nama: string };
  sore: { npk: string; nama: string };
  malam: { npk: string; nama: string };
};

export async function getMoD(tanggal: string): Promise<MoD | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/jadwal/mod?tanggal=${tanggal}`);
    const json = await res.json();
    if (!json.success) return null;
    return json.data;
  } catch (err) {
    console.error("MoD fetch error:", err);
    return null;
  }
}