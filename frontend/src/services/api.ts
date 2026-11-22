// services/api.ts
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type FetchOptions = {
  method?: HTTPMethod;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  skipAuth?: boolean;
};

const PUBLIC_ENDPOINT_PATTERNS = [
  "Display",
  "/api/login",
  "/api/register",
  "/api/pasien/login",
  "/api/pasien/register",
  "/api/jadwal/mod",
  "/api/public",
];

// ======================
// 🚀 FETCH CORE + DEBUG
// ======================

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers, skipAuth = false, method = "GET", ...rest } = options;

  const normalizedEndpoint = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token =
    !skipAuth && typeof window !== "undefined"
      ? localStorage.getItem("token") || getCookieValue("token")
      : null;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((headers as Record<string, string>) || {}),
  };

  // Hanya kirim Content-Type JSON jika ada payload dan bukan FormData
  // Menghindari preflight CORS yang tidak perlu pada request GET
  if (body !== undefined && body !== null && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(normalizedEndpoint, {
      method,
      headers: requestHeaders,
      body:
        body === undefined || body === null
          ? undefined
          : isFormData
          ? (body as FormData)
          : typeof body === "string"
          ? body
          : JSON.stringify(body),
      ...rest,
    });
  } catch (err) {
    console.error("❌ Network error:", err);
    throw new Error("Network error: tidak dapat terhubung ke server");
  }

  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = null;
    }
  }

  if (res.status === 401 && !skipAuth && typeof window !== "undefined") {
    const isIdle =
      typeof json?.message === "string" &&
      json.message.toLowerCase().includes("idle");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";

    if (!window.location.pathname.startsWith("/login")) {
      window.location.replace(isIdle ? "/login?message=idle" : "/login");
    }
  }

  if (!res.ok) {
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      `HTTP Error ${res.status}`;
    throw new Error(errorMsg);
  }

  return (json ?? ({} as T)) as T;
}