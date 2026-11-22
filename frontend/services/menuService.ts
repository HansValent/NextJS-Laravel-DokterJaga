// services/menuService.ts
import { fetchAPI } from "./api"
import type { ApiResponse } from "@/lib/type"

export type MenuItem = {
  id: number
  name: string
  icon?: string
  url?: string
  parent_id: number | null
  permission?: string
  order: number
  children?: MenuItem[]
}

// ✅ Ambil menu untuk sidebar user
export async function getMyMenus(): Promise<MenuItem[]> {
  const res = await fetchAPI<ApiResponse<MenuItem[]>>("/api/me/menus")
  return res.data || []
}

// ✅ Admin CRUD
export async function getMenus(): Promise<MenuItem[]> {
  const res = await fetchAPI<ApiResponse<MenuItem[]>>("/api/admin/menus")
  return res.data || []
}

export async function createMenu(data: Partial<MenuItem>) {
  return fetchAPI<ApiResponse<MenuItem>>("/api/admin/menus", {
    method: "POST",
    body: data,
  })
}

export async function updateMenu(id: number, data: Partial<MenuItem>) {
  return fetchAPI<ApiResponse<MenuItem>>(`/api/admin/menus/${id}`, {
    method: "PUT",
    body: data,
  })
}

export async function deleteMenu(id: number) {
  return fetchAPI<ApiResponse<null>>(`/api/admin/menus/${id}`, {
    method: "DELETE",
  })
}