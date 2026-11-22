// services/usersService.ts
import type {
  ApiResponse,
  User,
  Role,
  Permission,
  UserPermission,
  UserRole,
  CreateUserPayload,
  LoginRequest,
} from "@/lib/type";
import { fetchAPI, BASE_URL } from "./api";

// ======================
// 📌 INTERFACES & TYPES
// ======================

export interface PasienProfile {
  id_pasien: number;
  user_id: number;
  no_rm: string;
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  jenis_kelamin?: "L" | "P" | null;
  no_hp?: string | null;
  alamat?: string | null;
  golongan_darah?: string | null;
  riwayat_alergi?: string | null;
}

export interface AuthUser extends User {
  email?: string;
  roles: { id_role: number; role_name: string }[];
  permissions: { id_permission: number; permission_name: string }[];
  dokter?: Record<string, unknown> | null;
  pasien?: PasienProfile | null;
}


export interface LoginResponse {
  success: boolean;
  status?: boolean;
  message?: string;
  token: string;
  redirect_to?: string;
  user: AuthUser;
  roles: string[];
  permissions?: string[];
  pasien?: PasienProfile | null;
  paramedic?: Record<string, unknown> | null;
}

export type StaffLoginPayload = {
  username?: string;
  email?: string;
  password: string;
  role?: "admin" | "dokter";
};

export type PasienLoginPayload = {
  identitas?: string;
  identifier?: string;
  no_rm_atau_nik?: string;
  tanggal_lahir?: string;
  email?: string;
  password?: string;
};

export type PasienRegisterPayload = {
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  jenis_kelamin?: "L" | "P";
  no_hp?: string;
  alamat?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
};

const ADMIN_STAFF_ROLES = [
  "super admin",
  "admin",
  "editor",
  "power user",
  "igd",
  "icu",
  "users",
];

// ======================
// 📌 API ENDPOINTS
// ======================

const API = {
  loginUsers: "/api/login",
  loginToken: "/api/login-token",
  loginTokenAlt: "/api/login/with-token",
  logoutUsers: "/api/logout",
  loginPasien: "/api/pasien/login",
  registerPasien: "/api/pasien/register",
  users: "/api/users",
  roles: "/api/roles",
  permissions: "/api/permissions",
  rolePermission: "/api/role-permission",
  userRole: "/api/user-role",
  userPermission: "/api/user-permission",
  mePermissions: "/api/me/permissions",
};

// ======================
// 📌 HELPERS & NORMALIZER
// ======================

function normalizeRoleObjects(
  rawRoles: unknown
): { id_role: number; role_name: string }[] {
  if (!Array.isArray(rawRoles)) return [];

  return rawRoles
    .map((r, index) => {
      if (typeof r === "string") {
        const name = r.trim();
        return name ? { id_role: index + 1, role_name: name } : null;
      }
      if (r && typeof r === "object") {
        const obj = r as Record<string, unknown>;
        const name = String(obj.role_name ?? obj.name ?? "").trim();
        if (!name) return null;
        return {
          id_role: Number(obj.id_role ?? obj.id ?? index + 1),
          role_name: name,
        };
      }
      return null;
    })
    .filter((item): item is { id_role: number; role_name: string } => item !== null);
}

function normalizePermissionObjects(
  rawPermissions: unknown
): { id_permission: number; permission_name: string }[] {
  if (!Array.isArray(rawPermissions)) return [];

  return rawPermissions
    .map((p, index) => {
      if (typeof p === "string") {
        const name = p.trim();
        return name ? { id_permission: index + 1, permission_name: name } : null;
      }
      if (p && typeof p === "object") {
        const obj = p as Record<string, unknown>;
        const name = String(obj.permission_name ?? obj.name ?? "").trim();
        if (!name) return null;
        return {
          id_permission: Number(obj.id_permission ?? obj.id ?? index + 1),
          permission_name: name,
        };
      }
      return null;
    })
    .filter(
      (item): item is { id_permission: number; permission_name: string } =>
        item !== null
    );
}

function normalizeUser(item: Record<string, unknown>): AuthUser {
  return {
    id: Number(item.id ?? 0),
    npk: item.npk != null ? String(item.npk) : null,
    name: String(item.name ?? item.nama_lengkap ?? ""),
    username: String(item.username ?? item.nik ?? item.email ?? ""),
    email: item.email != null ? String(item.email) : "",
    status: item.status === "inactive" ? "inactive" : "active",
    roles: normalizeRoleObjects(item.roles),
    permissions: normalizePermissionObjects(item.permissions),
    dokter: (item.dokter as Record<string, unknown> | null) ?? null,
    pasien: (item.pasien as PasienProfile | null) ?? null,
  };
}

function extractErrorMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== "object") return fallback;
  const record = json as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim() !== "") {
    return record.message;
  }

  if (record.errors && typeof record.errors === "object") {
    const firstErr = Object.values(record.errors as Record<string, unknown>)[0];
    if (Array.isArray(firstErr) && firstErr.length > 0) {
      return String(firstErr[0]);
    }
    if (typeof firstErr === "string") {
      return firstErr;
    }
  }

  return fallback;
}

function buildLoginResponse(
  json: Record<string, unknown>,
  fallbackRoles: string[] = []
): LoginResponse {
  const dataObj =
    json.data && typeof json.data === "object"
      ? (json.data as Record<string, unknown>)
      : {};

  const token = String(
    json.token ?? json.access_token ?? dataObj.token ?? ""
  );

  const rawUserObj = (json.user ??
    dataObj.user ??
    json.pasien ??
    dataObj) as Record<string, unknown>;

  const normalizedUser = normalizeUser(rawUserObj);

  // Ekstrak array nama role sebagai string[]
  const userRoleNames = normalizedUser.roles.map((r) => r.role_name);
  const topLevelRoleNames = normalizeRoleObjects(json.roles).map(
    (r) => r.role_name
  );

  const roleNames: string[] =
    userRoleNames.length > 0
      ? userRoleNames
      : topLevelRoleNames.length > 0
      ? topLevelRoleNames
      : fallbackRoles;

  // Pastikan normalizedUser.roles selalu terisi objek sesuai tipe User
  if (normalizedUser.roles.length === 0 && roleNames.length > 0) {
    normalizedUser.roles = normalizeRoleObjects(roleNames);
  }

  // Ekstrak array nama permission sebagai string[]
  const userPermNames = normalizedUser.permissions.map(
    (p) => p.permission_name
  );
  const topLevelPermNames = normalizePermissionObjects(json.permissions).map(
    (p) => p.permission_name
  );

  const permissionNames: string[] =
    userPermNames.length > 0 ? userPermNames : topLevelPermNames;

  if (normalizedUser.permissions.length === 0 && permissionNames.length > 0) {
    normalizedUser.permissions = normalizePermissionObjects(permissionNames);
  }

  const pasien =
    (json.pasien as PasienProfile | null) ??
    (rawUserObj.pasien as PasienProfile | null) ??
    null;

  const paramedic =
    (json.paramedic as Record<string, unknown> | null) ??
    (rawUserObj.dokter as Record<string, unknown> | null) ??
    null;

  const redirectTo =
    typeof json.redirect_to === "string" && json.redirect_to.trim() !== ""
      ? json.redirect_to
      : resolveRedirectByRoles(roleNames).redirectPath;

  return {
    success: true,
    status: true,
    message: typeof json.message === "string" ? json.message : "Login berhasil",
    token,
    redirect_to: redirectTo,
    user: normalizedUser,
    roles: roleNames,
    permissions: permissionNames,
    pasien,
    paramedic,
  };
}

/**
 * Menentukan halaman tujuan berdasarkan daftar role user dari backend.
 */
export function resolveRedirectByRoles(roles: string[]): {
  portal: "admin" | "dokter" | "pasien" | "unknown";
  redirectPath: string;
} {
  const normalized = roles.map((r) => r.trim().toLowerCase());

  if (normalized.some((r) => ADMIN_STAFF_ROLES.includes(r))) {
    return { portal: "admin", redirectPath: "/admin" };
  }

  if (normalized.includes("dokter")) {
    return { portal: "dokter", redirectPath: "/dokter/dashboard" };
  }

  if (normalized.includes("pasien")) {
    return { portal: "pasien", redirectPath: "/pasien" };
  }

  return { portal: "unknown", redirectPath: "/login" };
}

/**
 * Menyimpan sesi ke localStorage, cookie (untuk Next.js middleware & api.ts),
 * serta memicu event sinkronisasi antar-tab.
 */
export function persistAuthSession(data: LoginResponse): void {
  if (typeof window === "undefined") return;

  const roles = Array.isArray(data.roles) ? data.roles : [];
  const permissions = Array.isArray(data.permissions) ? data.permissions : [];

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("roles", JSON.stringify(roles));
  localStorage.setItem("permissions", JSON.stringify(permissions));

  if (data.pasien) {
    localStorage.setItem("pasien", JSON.stringify(data.pasien));
    localStorage.setItem("pasien_user", JSON.stringify(data.user));
  } else {
    localStorage.removeItem("pasien");
    localStorage.removeItem("pasien_user");
  }

  if (data.paramedic) {
    localStorage.setItem("paramedic", JSON.stringify(data.paramedic));
  } else {
    localStorage.removeItem("paramedic");
  }

  const maxAge = 60 * 60 * 8; // 8 jam
  document.cookie = `token=${encodeURIComponent(data.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `auth_token=${encodeURIComponent(data.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user_roles=${encodeURIComponent(JSON.stringify(roles))}; path=/; max-age=${maxAge}; SameSite=Lax`;

  window.dispatchEvent(new Event("auth-change"));
}

/**
 * Menghapus seluruh data sesi lokal dan cookie.
 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roles");
  localStorage.removeItem("permissions");
  localStorage.removeItem("pasien");
  localStorage.removeItem("pasien_user");
  localStorage.removeItem("paramedic");

  localStorage.setItem("forced_logout_broadcast", String(Date.now()));
  localStorage.removeItem("forced_logout_broadcast");

  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "user_roles=; path=/; max-age=0; SameSite=Lax";

  window.dispatchEvent(new Event("auth-change"));
}

// ======================
// 📌 PERMISSIONS (ME)
// ======================

export async function getMyPermissions(): Promise<string[]> {
  try {
    const res = await fetchAPI<unknown>(API.mePermissions);
    let perms: string[] = [];

    if (Array.isArray(res)) {
      perms = res.filter((item): item is string => typeof item === "string");
    } else if (
      res &&
      typeof res === "object" &&
      Array.isArray((res as Record<string, unknown>).data)
    ) {
      perms = ((res as Record<string, unknown>).data as unknown[]).filter(
        (item): item is string => typeof item === "string"
      );
    }

    return perms.filter((p) => p.trim() !== "");
  } catch (err) {
    console.error("Gagal fetch permissions:", err);
    return [];
  }
}

// ======================
// 📌 AUTH (ADMIN & DOKTER)
// ======================

/**
 * Login SSO Carolus Connect untuk Admin / Staf & Dokter.
 */
export async function loginWithToken(
  accessToken: string
): Promise<LoginResponse> {
  const payload = {
    access_token: accessToken,
    accessToken,
  };

  let res = await fetch(`${BASE_URL}${API.loginToken}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 404) {
    res = await fetch(`${BASE_URL}${API.loginTokenAlt}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!res.ok || !json) {
    throw new Error(extractErrorMessage(json, "Login via token SSO gagal"));
  }

  const session = buildLoginResponse(json);
  if (!session.token || !session.user?.id) {
    throw new Error("Token atau data pengguna tidak ditemukan dalam respons");
  }

  persistAuthSession(session);
  return session;
}

/**
 * Login terhubung untuk Admin / Staf & Dokter (AuthController -> /api/login).
 */
export async function loginUser(
  credentials: StaffLoginPayload | LoginRequest
): Promise<LoginResponse> {
  const raw = credentials as StaffLoginPayload;
  const username = (raw.username || raw.email || "").trim();

  const payload = {
    username,
    ...(raw.email ? { email: raw.email.trim() } : {}),
    password: raw.password,
    ...(raw.role ? { role: raw.role } : {}),
  };

  const res = await fetch(`${BASE_URL}${API.loginUsers}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!res.ok || !json) {
    throw new Error(
      extractErrorMessage(
        json,
        "Login gagal. Periksa kembali Username dan Password Anda."
      )
    );
  }

  const session = buildLoginResponse(json);
  if (
    !session.token ||
    session.token === "null" ||
    session.token === "undefined"
  ) {
    throw new Error("Token autentikasi tidak valid dari server");
  }

  persistAuthSession(session);
  return session;
}

// ======================
// 📌 AUTH PASIEN (LANDING PAGE)
// ======================

/**
 * Login terpisah khusus Pasien (PasienAuthController -> /api/pasien/login).
 * Mendukung No. RM / NIK + Tanggal Lahir maupun Identifier + Password.
 */
export async function loginPasien(
  payload: PasienLoginPayload
): Promise<LoginResponse> {
  const identitas = (
    payload.identitas ||
    payload.identifier ||
    payload.no_rm_atau_nik ||
    payload.email ||
    ""
  ).trim();

  const requestBody: Record<string, string> = {
    identitas,
    identifier: identitas,
    username: identitas,
  };

  if (payload.tanggal_lahir) {
    requestBody.tanggal_lahir = payload.tanggal_lahir;
  }
  if (payload.password) {
    requestBody.password = payload.password;
  }

  const res = await fetch(`${BASE_URL}${API.loginPasien}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!res.ok || !json) {
    throw new Error(
      extractErrorMessage(
        json,
        "Login pasien gagal. Periksa kembali No. RM / NIK dan Tanggal Lahir Anda."
      )
    );
  }

  const session = buildLoginResponse(json, ["Pasien"]);
  if (!session.token) {
    throw new Error("Sesi pasien tidak valid dari server.");
  }

  persistAuthSession(session);
  return session;
}

/**
 * Registrasi akun Pasien baru (PasienAuthController -> /api/pasien/register).
 */
export async function registerPasien(
  payload: PasienRegisterPayload
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}${API.registerPasien}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!res.ok || !json) {
    throw new Error(
      extractErrorMessage(json, "Pendaftaran pasien gagal. Pastikan data valid.")
    );
  }

  const session = buildLoginResponse(json, ["Pasien"]);
  if (session.token) {
    persistAuthSession(session);
  }

  return session;
}

/**
 * Logout user dan bersihkan sesi lokal maupun cookie.
 */
export async function logoutUser(redirectTo?: string): Promise<void> {
  try {
    await fetchAPI<ApiResponse<null>>(API.logoutUsers, {
      method: "POST",
    });
  } catch {
    // Tetap bersihkan sesi lokal meskipun token sudah kedaluwarsa di server
  } finally {
    clearAuthSession();
    if (typeof window !== "undefined" && redirectTo) {
      window.location.replace(redirectTo);
    }
  }
}

// ======================
// 📌 USERS
// ======================

export async function getUsers() {
  const res = await fetchAPI<ApiResponse<Record<string, unknown>[]>>(API.users);

  return {
    ...res,
    data: Array.isArray(res?.data) ? res.data.map(normalizeUser) : [],
  };
}

export async function createUser(data: CreateUserPayload) {
  return fetchAPI<ApiResponse<User>>(API.users, {
    method: "POST",
    body: data,
  });
}

export async function updateUser(id: number, data: Partial<CreateUserPayload>) {
  return fetchAPI<ApiResponse<User>>(`${API.users}/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteUser(id: number) {
  return fetchAPI<ApiResponse<null>>(`${API.users}/${id}`, {
    method: "DELETE",
  });
}

// ======================
// 📌 USERS-STATUS
// ======================

export function getStatusLabel(status: "active" | "inactive") {
  return status === "active" ? "Active" : "Inactive";
}

export function getStatusColor(status: "active" | "inactive") {
  return status === "active" ? "text-green-600" : "text-red-500";
}

export const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

// ======================
// 📌 ROLES
// ======================

export async function getRoles() {
  const res = await fetchAPI<ApiResponse<Role[]>>(API.roles);
  return {
    ...res,
    data: res?.data ?? [],
  };
}

export async function postRoles(data: { role_name: string }) {
  return fetchAPI<ApiResponse<Role>>(API.roles, {
    method: "POST",
    body: data,
  });
}

export async function putRoles(id: number, data: Partial<Role>) {
  return fetchAPI<ApiResponse<Role>>(`${API.roles}/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteRoles(id: number) {
  return fetchAPI<ApiResponse<null>>(`${API.roles}/${id}`, {
    method: "DELETE",
  });
}

// ======================
// 📌 PERMISSIONS
// ======================

export async function getPermissions() {
  return fetchAPI<ApiResponse<Permission[]>>(API.permissions);
}

export async function createPermission(data: {
  permission_name: string;
  route: string;
}) {
  return fetchAPI<ApiResponse<Permission>>(API.permissions, {
    method: "POST",
    body: data,
  });
}

export async function updatePermission(
  id: number,
  data: {
    permission_name: string;
    route: string;
  }
) {
  return fetchAPI<ApiResponse<Permission>>(`${API.permissions}/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deletePermission(id: number) {
  return fetchAPI<ApiResponse<null>>(`${API.permissions}/${id}`, {
    method: "DELETE",
  });
}

// ======================
// 📌 ROLE PERMISSION
// ======================

export async function getRolePermission(role_id: number) {
  return fetchAPI<ApiResponse<Record<string, unknown>[]>>(
    `${API.rolePermission}/${role_id}`
  );
}

export async function updateRolePermission(
  role_id: number,
  permissions: number[]
) {
  return fetchAPI<ApiResponse<null>>(`${API.rolePermission}/${role_id}`, {
    method: "POST",
    body: { permissions },
  });
}

// ======================
// 📌 USER ROLE
// ======================

export async function getUserRole(user_id: number) {
  return fetchAPI<ApiResponse<UserRole[]>>(`${API.userRole}/${user_id}`);
}

export async function updateUserRole(user_id: number, roles: number[]) {
  return fetchAPI<ApiResponse<UserRole[]>>(`${API.userRole}/${user_id}`, {
    method: "POST",
    body: { roles },
  });
}

// ======================
// 📌 USER PERMISSION
// ======================

export async function getUserPermission(user_id: number) {
  return fetchAPI<ApiResponse<UserPermission[]>>(
    `${API.userPermission}/${user_id}`
  );
}

export async function updateUserPermission(
  user_id: number,
  permissions: number[]
) {
  return fetchAPI<ApiResponse<null>>(`${API.userPermission}/${user_id}`, {
    method: "POST",
    body: { permissions },
  });
}