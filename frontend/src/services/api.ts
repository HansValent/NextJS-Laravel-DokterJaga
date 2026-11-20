export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.hostname}:8000` 
    : "http://localhost:8000");

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE"

type FetchOptions = {
  method?: HTTPMethod
  body?: unknown
}

// ======================
// 🚀 FETCH CORE + DEBUG
// ======================

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("Client only")
  }

  const { method = "GET", body } = options
  const token = localStorage.getItem("token")

  const isAuthEndpoint =
    endpoint.startsWith("/api") && !endpoint.includes("Display")

  if (!token && isAuthEndpoint) {
    window.location.replace("/login")
    throw new Error("Unauthorized: No token")
  }

  let res: Response

  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    console.error("❌ Network error:", error)
    throw new Error("Network error: tidak dapat terhubung ke server")
  }

  // 🔥 FIX UTAMA: HANDLE EMPTY RESPONSE
  let text = ""
  try {
    text = await res.text()
  } catch {
    text = ""
  }

  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  console.log("🟢 API:", {
    endpoint,
    status: res.status,
    data,
  })

  // 🔐 HANDLE 401
  if (res.status === 401 && isAuthEndpoint) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
      const isIdle = data?.message === "Sesi Anda telah berakhir karena tidak ada aktivitas."
      if (isIdle) {
        window.location.replace("/login?message=idle")
      } else {
        window.location.replace("/login")
      }
    
      throw new Error(data?.message || "Unauthorized")
    }

  // ❌ HANDLE ERROR
  if (!res.ok) {
    let message = "Terjadi kesalahan"

    if (data?.message) {
      // Jika message adalah string biasa
      if (typeof data.message === 'string') {
        message = data.message
      }
      // Jika message adalah objek (contoh: hasil validasi Laravel)
      else if (typeof data.message === 'object') {
        const firstKey = Object.keys(data.message)[0]
        const firstError = data.message[firstKey]
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0]          // ambil error pertama
        } else if (typeof firstError === 'string') {
          message = firstError
        }
      }
    }

    // Fallback kedua: cek field 'errors' (kadang digunakan)
    if (message === "Terjadi kesalahan" && data?.errors) {
      const firstError = Object.values(data.errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        message = firstError[0]
      } else if (typeof firstError === 'string') {
        message = firstError
      }
    }

    console.error("❌ API ERROR DETAIL:", {
      endpoint,
      status: res.status,
      data,
    })

    throw new Error(message)
  }

  return data as T
}
