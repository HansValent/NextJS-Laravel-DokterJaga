import type {
  ApiResponse,
  User,
  Role,
  Permission,
  UserPermission,
  UserRole,
  CreateUserPayload,
  LoginRequest,
} from "@/lib/type"
import { fetchAPI } from "./api"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE"

type FetchOptions = {
  method?: HTTPMethod
  body?: unknown
}

// ======================
// 📌 API ENDPOINT
// ======================

const API = {
  loginUsers: "/api/login",
  logoutUsers: "/api/logout",
  users: "/api/users",
  roles: "/api/roles",
  permissions: "/api/permissions",
  rolePermission: "/api/role-permission",
  userRole: "/api/user-role",
  userPermission: "/api/user-permission",
  mePermissions: "/api/me/permissions",
}

export async function getMyPermissions(): Promise<string[]> {
  try {
    const res = await fetchAPI<any>(API.mePermissions);
    let perms: string[] = [];
    if (Array.isArray(res)) {
      perms = res.filter((item): item is string => typeof item === 'string');
    } else if (res && Array.isArray(res.data)) {
      perms = res.data.filter((item: any): item is string => typeof item === 'string');
    }
    // 🔥 Hapus null/undefined
    return perms.filter(p => p && p.trim() !== '');
  } catch (err) {
    console.error("Gagal fetch permissions:", err);
    return [];
  }
}

// ======================
// 📌 NORMALIZER
// ======================

function normalizeUser(item: any): User {
  return {
    id: item.id,
    npk: item.npk ?? null,
    name: item.name ?? "",
    username: item.username,
    status: item.status === "active" ? "active" : "inactive",
    roles: item.roles ?? [],
    permissions: item.permissions ?? [],
  }
}

// ======================
// 📌 AUTH
// ======================
export async function loginWithToken(accessToken: string) {
  const res = await fetch(`${BASE_URL}/api/login/with-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ accessToken }),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Login via token gagal")
  }

  const token = json.token
  const user = json.user

  if (!token || !user) {
    throw new Error("Token atau user tidak ada dalam response")
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));


  return user
}

export async function loginUser(data: LoginRequest) {
  const res = await fetch(`${BASE_URL}${API.loginUsers}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Login gagal")
  }

  const token = json.token
  const user = json.user

  if (!token || token === "null" || token === "undefined") {
    throw new Error("Token tidak valid")
  }

  if (!token || !user) {
    throw new Error("Token atau user tidak ada")
  }

  // ✅ SIMPAN
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))

  return user
}

export async function logoutUser() {
  try {
    await fetchAPI<ApiResponse<null>>(
      API.loginUsers.replace("login", "logout"),
      {
        method: "POST",
      })
  } catch (err) {
    console.error("Gagal memanggil API logout:", err)
  } finally {

    localStorage.removeItem("user")
    localStorage.removeItem("token")

    // Kirim sinyal hancurkan sesi ke tab lain yang masih terbuka
    localStorage.setItem("forced_logout_broadcast", String(Date.now()));
    localStorage.removeItem("forced_logout_broadcast"); // langsung bersihkan flag

    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
    window.location.replace("/login");
  }
}

// ======================
// 📌 USERS
// ======================

export async function getUsers() {
  const res = await fetchAPI<ApiResponse<any[]>>(API.users)

  return {
    ...res,
    data: res.data.map(normalizeUser),
  }
}

export async function createUser(data: CreateUserPayload) {
  return fetchAPI<ApiResponse<User>>(API.users, {
    method: "POST",
    body: data,
  })
}

export async function updateUser(
  id: number,
  data: Partial<CreateUserPayload>
) {
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
// ======================
// 📌 USERS-STATUS
// ======================

export function getStatusLabel(status: "active" | "inactive") {
  return status === "active" ? "Active" : "Inactive"
}

export function getStatusColor(status: "active" | "inactive") {
  return status === "active"
    ? "text-green-600"
    : "text-red-500"
}

// (opsional untuk dropdown)
export const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
]

// ======================
// 📌 ROLES
// ======================

export async function getRoles() {
  const res = await fetchAPI<ApiResponse<Role[]>>(API.roles)

  return {
    ...res,
    data: res?.data ?? [],
  }
}

export async function postRoles(data: {
  role_name: string
}) {
  return fetchAPI<ApiResponse<Role>>(API.roles, {
    method: "POST",
    body: data,
  })
}

export async function putRoles(
  id: number,
  data: Partial<Role>
) {
  return fetchAPI<ApiResponse<Role>>(
    `${API.roles}/${id}`,
    {
      method: "PUT",
      body: data,
    }
  )
}

export async function deleteRoles(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.roles}/${id}`,
    {
      method: "DELETE",
    }
  )
}

// ======================
// 📌 PERMISSIONS
// ======================

export async function getPermissions() {
  return fetchAPI<ApiResponse<Permission[]>>(API.permissions)
}

export async function createPermission(data: {
  permission_name: string
  route: string
}) {
  return fetchAPI(API.permissions, {
    method: "POST",
    body: data,
  })
}

export async function updatePermission(
  id: number,
  data: {
    permission_name: string
    route: string
  }
) {
  return fetchAPI(`${API.permissions}/${id}`, {
    method: "PUT",
    body: data,
  })
}

export async function deletePermission(id: number) {
  return fetchAPI<ApiResponse<null>>(
    `${API.permissions}/${id}`,
    {
      method: "DELETE",
    }
  )
}


// ======================
// 📌 ROLE PERMISSION
// ======================

export async function getRolePermission(role_id: number) {
  return fetchAPI<ApiResponse<any[]>>(
    `${API.rolePermission}/${role_id}`
  )
}

export async function updateRolePermission(
  role_id: number,
  permissions: number[]
) {
  return fetchAPI<ApiResponse<null>>(
    `${API.rolePermission}/${role_id}`,
    {
      method: "POST",
      body: { permissions },
    }
  )
}

// ======================
// 📌 USER ROLE
// ======================

export async function getUserRole(user_id: number) {
  return fetchAPI<ApiResponse<UserRole[]>>(
    `${API.userRole}/${user_id}`
  )
}

export async function updateUserRole(
  user_id: number,
  roles: number[]
) {
  return fetchAPI<ApiResponse<null>>(
    `${API.userRole}/${user_id}`,
    {
      method: "POST",
      body: { roles },
    }
  )
}

// ======================
// 📌 USER PERMISSION
// ======================

export async function getUserPermission(user_id: number) {
  return fetchAPI<ApiResponse<UserPermission[]>>(
    `${API.userPermission}/${user_id}`
  )
}

export async function updateUserPermission(
  user_id: number,
  permissions: number[]
) {
  return fetchAPI<ApiResponse<null>>(
    `${API.userPermission}/${user_id}`,
    {
      method: "POST",
      body: { permissions },
    }
  )
}
