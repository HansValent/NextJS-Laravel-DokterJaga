"use client"

import { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  updateUserRole,
  getUserRole,
} from "@/services/usersService"
import type { User, Role } from "@/lib/type"

type Props = {
  user: User
  roles: Role[]
  onClose: () => void
  onSuccess: () => void
}

export default function UsersRoleFormModal({
  user,
  roles = [],
  onClose,
  onSuccess,
}: Props) {
  const [mounted, setMounted] = useState(false)

  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)


  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr)
        const roles = currentUser?.roles || []
        setIsSuperAdmin(roles.includes("Super Admin"))
      } catch (e) {
        console.error("Error parsing user:", e)
      }
    }
  }, [])

  /* ================= INIT ================= */
  useEffect(() => setMounted(true), [])

  /* ================= FETCH USER ROLE ================= */
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setLoadingRoles(true)

        const res = await getUserRole(user.id)
        const ids =
          res?.data?.map((r: any) =>
            Number(r.id_role ?? r.role_id ?? r.id)
          ) ?? []

        setSelectedRoles(
          ids.filter((id) => !isNaN(id))
        )
      } catch (err) {
        console.error("ERROR FETCH USER ROLE:", err)
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchUserRoles()
  }, [user.id])

  /* ================= DERIVED ================= */
  const availableRoles = useMemo(() => {
    let filtered = roles
    if (!isSuperAdmin) {
      filtered = filtered.filter((r) => r.role_name !== "Super Admin")
    }
    return filtered.filter((r) => !selectedRoles.includes(r.id_role))
  }, [roles, selectedRoles, isSuperAdmin])

  const chosenRoles = useMemo(() => {
    return roles.filter((r) =>
      selectedRoles.includes(r.id_role)
    )
  }, [roles, selectedRoles])

  /* ================= ACTION ================= */
  const addRole = (id: number) => {
    if (!id || isNaN(id)) return
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    )
  }

  const removeRole = (id: number) => {
    setSelectedRoles((prev) =>
      prev.filter((r) => r !== id)
    )
  }

  const selectAllAvailable = () => {
    const allIds = roles
      .map((r) => Number(r.id_role))
      .filter((id) => !isNaN(id))

    setSelectedRoles(allIds)
  }

  const clearAllSelected = () => {
    setSelectedRoles([])
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const cleanRoles = selectedRoles.filter(
      (id) => typeof id === "number" && !isNaN(id)
    )

    if (cleanRoles.length === 0) {
      alert("Minimal pilih 1 role")
      return
    }

    try {
      setLoading(true)

      await updateUserRole(user.id, cleanRoles)

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("ERROR UPDATE ROLE:", err)
      alert(err.message || "Gagal menyimpan perubahan")
    } finally {
      setLoading(false)
    }
  }

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* MODAL BOX */}
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LOADING */}
        {loadingRoles ? (
          <div className="text-center py-6 text-gray-500">
            Loading role...
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div>
              <h2 className="text-xl font-bold">
                Kelola Role
              </h2>
              <p className="text-gray-500">
                {user.username}
              </p>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* AVAILABLE */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Tersedia</h3>
                  <button
                    onClick={selectAllAvailable}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Pilih Semua
                  </button>
                </div>

                <div className="border rounded-lg h-64 overflow-y-auto p-2 space-y-1">
                  {availableRoles.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 text-sm">
                      Tidak ada role tersedia
                    </p>
                  ) : (
                    availableRoles.map((role) => (
                      <div
                        key={role.id_role}
                        onClick={() => addRole(role.id_role)}
                        className="cursor-pointer px-3 py-2 rounded hover:bg-green-50"
                      >
                        {role.role_name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SELECTED */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">Dipilih</h3>
                  <button
                    onClick={clearAllSelected}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Kosongkan
                  </button>
                </div>

                <div className="border rounded-lg h-64 overflow-y-auto p-2 space-y-1">
                  {chosenRoles.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 text-sm">
                      Belum ada role dipilih
                    </p>
                  ) : (
                    chosenRoles.map((role) => (
                      <div
                        key={role.id_role}
                        onClick={() =>
                          removeRole(role.id_role)
                        }
                        className="cursor-pointer px-3 py-2 rounded hover:bg-red-50 flex justify-between"
                      >
                        <span>{role.role_name}</span>
                        <span className="text-xs text-red-400">✕</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-white rounded-lg"
                style={{
                  background:
                    "linear-gradient(to right, #006838, #8DC63F)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
