"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Eye, EyeOff, XCircle, CheckCircle } from "lucide-react"

import {
  updateUser,
  createUser,
} from "@/services/usersService"

import type {
  User,
  Role,
  CreateUserPayload,
} from "@/lib/type"

type Props = {
  mode: "create" | "edit"
  user: User
  currentUser: User | null
  roles?: Role[]
  onClose: () => void
  onSuccess: () => void
}

export default function UsersFormModal({
  user,
  currentUser,
  onClose,
  onSuccess,
  mode,
  roles = [],
}: Props) {

  // ======================
  // STATE
  // ======================
  const [mounted, setMounted] = useState(false)

  const [name, setName] = useState(user.name || "")
  const [username, setUsername] = useState(user.username || "")
  const [npk, setNpk] = useState(user.npk || "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [status, setStatus] = useState<"active" | "inactive">(
    user.status ?? "active"
  )

  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // Notifikasi internal (ganti alert)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // ======================
  // INIT
  // ======================
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.roles) {
      setSelectedRoles(
        user.roles.map((r) => Number(r.id_role))
      )
    }
    // Inisialisasi NPK dari data user (untuk edit)
    setNpk(user.npk || "")
  }, [user])

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async () => {
    // Reset pesan sebelum submit
    setMessage(null)

    try {
      if (!name.trim()) {
        setMessage({ type: "error", text: "Nama wajib diisi" })
        return
      }

      if (!username.trim()) {
        setMessage({ type: "error", text: "Username wajib diisi" })
        return
      }

      if (mode === "create" && !password) {
        setMessage({ type: "error", text: "Password wajib untuk user baru" })
        return
      }

      // Validasi NPK jika diisi (opsional, hanya format)
      if (npk.trim() && !/^[A-Za-z0-9]+$/.test(npk.trim())) {
        setMessage({ type: "error", text: "NPK hanya boleh berisi huruf dan angka" })
        return
      }

      setLoading(true)

      if (mode === "create") {
        const payload: CreateUserPayload = {
          name,
          username,
          password,
          status,
          roles: selectedRoles,
          npk: npk.trim() || null,          // kirim NPK
        }

        await createUser(payload)
      } else {
        const payload: Partial<CreateUserPayload> = {
          name,
          username,
          status,
          npk: npk.trim() || null,          // kirim NPK saat edit
        }

        if (password) {
          payload.password = password
        }

        await updateUser(user.id, payload)
      }

      // Sukses: notifikasi sebentar lalu tutup
      setMessage({ type: "success", text: "Data berhasil disimpan" })
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 800)

    } catch (err: any) {
      console.error("ERROR:", err)
      setMessage({
        type: "error",
        text: err.message || "Gagal menyimpan data",
      })
    } finally {
      setLoading(false)
    }
  }

  // ======================
  // ESC CLOSE
  // ======================
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // ======================
  // GUARD SSR
  // ======================
  if (!mounted) return null

  // 1. Cek apakah user yang sedang login memiliki role 'Super Admin'
const isCurrentUserSuperAdmin = currentUser?.roles?.some(
  (r) => r.role_name === 'Super Admin'
)

// 2. Filter berdasarkan kondisi di atas
const availableRoles = roles.filter((r) => {
  if (r.role_name === 'Super Admin') {
    return isCurrentUserSuperAdmin // Hanya tampil jika pengakses adalah Super Admin
  }
  return true // Role selain Super Admin selalu tampil
})

  // ======================
  // RENDER
  // ======================
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold">
            {mode === "create" ? "Tambah User" : "Edit User"}
          </h2>
          {mode === "edit" && (
            <p className="text-gray-500 text-sm">
              ID: {user.id}
            </p>
          )}
        </div>

        {/* NOTIFIKASI INLINE */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.type === "error" ? (
              <XCircle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* FORM */}
        <div className="space-y-4">
          {/* NPK */}
          <div>
            <label className="text-sm font-medium">NPK</label>
            <input
              type="text"
              value={npk}
              onChange={(e) => setNpk(e.target.value)}
              placeholder="Nomor Pokok Karyawan (opsional)"
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Digunakan untuk integrasi login dengan token eksternal (Carolus Connect)
            </p>
          </div>
          
          {/* NAME */}
          <div>
            <label className="text-sm font-medium">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* USERNAME */}
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Password {mode === "edit" && "(opsional)"}
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "create"
                    ? "Password wajib"
                    : "Kosongkan jika tidak diubah"
                }
                className="w-full border rounded-lg px-3 py-2 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* ROLE (hanya saat create) */}
          {mode === "create" && (
            <div>
              <label className="text-sm font-medium">Role</label>

              <select
                multiple
                value={selectedRoles.map(String)}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions
                  ).map((opt) => Number(opt.value))

                  setSelectedRoles(values)
                }}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                {availableRoles.map((role) => (
                  <option
                    key={role.id_role}
                    value={role.id_role}
                  >
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium">Status</label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "active" | "inactive"
                )
              }
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-3">
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