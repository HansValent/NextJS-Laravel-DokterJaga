"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    permission_name: string
    route: string
  }) => void
  initialData?: {
    permission_name: string
    route: string
  }
}

export default function PermissionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState({
    permission_name: "",
    route: "",
  })

  // ✅ mount check (hindari SSR issue)
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ set initial data (edit mode)
  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setForm(initialData)
    } else {
      setForm({
        permission_name: "",
        route: "",
      })
    }
  }, [isOpen, initialData])

  if (!mounted || !isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 🔲 BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 📦 MODAL */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Permission" : "Tambah Permission"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Permission Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Permission Name
            </label>
            <input
              type="text"
              value={form.permission_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  permission_name: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Route */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Route
            </label>
            <input
              type="text"
              value={form.route}
              onChange={(e) =>
                setForm({
                  ...form,
                  route: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // 🔥 ini kunci utama
  )
}
