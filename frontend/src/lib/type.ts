import dayjs from "dayjs"
import { number } from "framer-motion"

// ======================
// 📌 GENERIC
// ======================

export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type CalendarGridProps = {
  currentDate: dayjs.Dayjs
  jadwalMap: Record<string, string[]>
  loading?: boolean
}

export type Jadwal = {
  id: number;
  tanggal: string;
  id_bagian_paramedic: number;
  peran: string;
  tipe_jaga: string;
  keterangan?: string | null;
  paramedic: {
    id_paramedic: number;
    nama_paramedic: string;
    jenis_paramedic: string;
  };
  posisi: {
    id: number;
    nama_posisi: string;
    kategori_id: number;
    kategori_nama: string;
    kategori_urutan: number;
    urutan: number;
  };
  created_by?: string | null;
  created_by_name?: string | null;
  created_at?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
  deleted_by?: string | null;
  deleted_at?: string | null;
};

// 🔥 Untuk UI (flatten) - Digunakan di hook Calendar/List agar mudah dibaca
export type JadwalItem = {
  id: number
  tanggal: string
  nama_paramedic: string
  nama_posisi: string
  peran?: string
  tipe_jaga?: string
}

// 🔥 Untuk calendar/grouping tampilan display publik
export type JadwalDisplay = {
  tanggal: string
  data: {
    posisi: string
    paramedic: string[]
  }[]
}

// 🔥 Response backend khusus calendar / display
export type JadwalResponse = {
  success: boolean
  data: JadwalDisplay[]
}

// ======================
// 📌 AUTH & RBAC
// ======================

// 🔥 LOGIN REQUEST
export type LoginRequest = {
  username: string
  password: string
}

// 🔥 USER
export type User = {
  id: number
  npk?: string | null
  name?: string 
  username: string
  status: "active" | "inactive"

  roles: {
    id_role: number
    role_name: string
  }[]

  permissions?: {
    id_permission: number
    permission_name: string
  }[]
}

// 🔥 ROLE
export type Role = {
  id_role: number
  role_name: string
}

// 🔥 PERMISSION
export type Permission = {
  id_permission: number
  permission_name: string
  route: string
}

// 🔥 CREATE USER PAYLOAD
export type CreateUserPayload = {
  name: string
  username: string
  password: string
  status: "active" | "inactive"
  roles: number[]
  npk?: string | null
}

// 🔥 USER ROLE
export type UserRole = {
  id: number
  user_id: number
  username: string
  id_role: number
  role_name: string
}

// 🔥 USER PERMISSION
export type UserPermission = {
  id: number
  user_id: number
  username: string
  id_permission: number
  permission_name: string
}

// 🔥 LOGIN RESPONSE (REALISTIC)
export type LoginResponse = {
  id: number
  name: string
  username: string
  roles: {
    id_role: number
    role_name: string
  }[]
}

//
// ======================
// 📌 PENANGGUNG JAWAB
// ======================
//

export type PenanggungJawab = {
  id: number
  tanggal: string

  id_perawat?: number | null
  id_kepala_jaga?: number | null
  id_ponek?: number | null

  perawat_nama?: string | null
  kepala_jaga_nama?: string | null
  ponek_nama?: string | null

  // 🔥 TAMBAHAN
  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
  deleted_by?: string | null
  deleted_at?: string | null
}

type PJView = {
  perawat_penanggung_jawab: string
  kepala_jaga: string
  ponek: string
}



export type CreatePJPayload = {
  tanggal: string
  id_perawat?: number | null
  id_kepala_jaga?: number | null
  id_ponek?: number | null
}

export type UpdatePJPayload = CreatePJPayload

export type PJMap = Record<
  string,
  {
    perawat: string | null
    kepala_jaga: string | null
    ponek: string | null
  }
>

export type Posisi = {
  id: number
  nama_posisi: string

  kategori_id: number
  kategori_nama: string
  kategori_urutan: number

  urutan: number

  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
  deleted_by?: string | null
  deleted_at?: string | null
}

export type posisiPayload = {
  nama_posisi: string
  kategori_id?: number | null
  urutan?: number
}

export type Kategori = {
  id: number
  nama_kategori: string
  urutan: number

  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
  deleted_by?: string | null
  deleted_at?: string | null

}
