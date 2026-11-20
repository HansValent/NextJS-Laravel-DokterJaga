"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getMyPermissions } from "@/services/usersService"
import type { User } from "@/lib/type"

type AuthContextType = {
  user: User | null
  permissions: string[]
  loading: boolean
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: [],
  loading: true,
  hasPermission: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (parsedUser.permissions && Array.isArray(parsedUser.permissions)) {
            const validPerms = parsedUser.permissions.filter(
              (p: string) => typeof p === 'string' && p.trim() !== ''
            );
            if (validPerms.length > 0) {
              console.log("🔐 Loaded permissions from localStorage:", validPerms);
              setPermissions(validPerms);
              setLoading(false);
              return;
            }
          }
        }

        // 🔥 2. Fallback ke API jika tidak ada
        const perms = await getMyPermissions();
        console.log("🔐 Loaded permissions from API:", perms);
        setPermissions(perms);
      } catch (err) {
        console.error("Failed load permissions", err);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    load()
  }, [])

  const hasPermission = (perm: string) => {
    if (!perm) return true
    const required = perm.split(",").map((p: string)  => p.trim())
    return required.some((p: string)  => permissions.includes(p))
  }

  return (
    <AuthContext.Provider value={{ user, permissions, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}