"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import {
  postRoles,
  putRoles,
} from "@/services/usersService"

import type { Role } from "@/lib/type"

type Props = {
  mode: "create" | "edit"
  role: Role
  onClose: () => void
  onSuccess: () => void
}

export default function RolesFormModal({
  role,
  onClose,
  onSuccess,
  mode,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [roleName, setRoleName] = useState(role.role_name || "")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async () => {
    try {
      if (!roleName.trim()) {
        alert("Nama role wajib diisi")
        return
      }

      setLoading(true)

      if (mode === "create") {
        await postRoles({ role_name: roleName })
      } else {
        await putRoles(role.id_role, { role_name: roleName })
      }

      onSuccess()
      onClose()

    } catch (err: any) {
      console.error(err)
      alert(err.message || "Gagal")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      {/* MODAL */}
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold">
            {mode === "create" ? "Tambah Role" : "Edit Role"}
          </h2>

          {mode === "edit" && (
            <p className="text-gray-500 text-sm">
              ID: {role.id_role}
            </p>
          )}
        </div>

        {/* FORM */}
        <div>
          <label className="text-sm font-medium">
            Nama Role
          </label>

          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Contoh: admin, dokter, perawat"
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-2">
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

      </div>
    </div>,
    document.body
  )
}
