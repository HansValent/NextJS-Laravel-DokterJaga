"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  getPermissions,
  getRolePermission,
  updateRolePermission,
} from "@/services/usersService"

type Permission = {
  id_permission: number
  permission_name: string
}

type Props = {
  roleId: number
  roleName: string
  onClose: () => void
}

export default function RolePermissionModal({
  roleId,
  roleName,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false)

  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const [searchLeft, setSearchLeft] = useState("")
  const [searchRight, setSearchRight] = useState("")

  // ================= INIT =================
  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [permRes, rolePermRes] = await Promise.all([
        getPermissions(),
        getRolePermission(roleId),
      ])

      setAllPermissions(permRes?.data ?? [])
      setSelected(
        rolePermRes?.data?.map((p: any) => p.id_permission) ?? []
      )
    } catch (err) {
      console.error(err)
      alert("Gagal load permission")
    }
  }

  // ================= ACTION =================
  const addPermission = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    )
  }

  const removePermission = (id: number) => {
    setSelected((prev) => prev.filter((p) => p !== id))
  }

  // ================= FILTER =================
  const leftList = allPermissions
    .filter((p) => !selected.includes(p.id_permission))
    .filter((p) =>
      p.permission_name
        .toLowerCase()
        .includes(searchLeft.toLowerCase())
    )

  const rightList = allPermissions
    .filter((p) => selected.includes(p.id_permission))
    .filter((p) =>
      p.permission_name
        .toLowerCase()
        .includes(searchRight.toLowerCase())
    )

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setLoading(true)
      await updateRolePermission(roleId, selected)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Gagal update permission")
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
        className="bg-white w-full max-w-5xl rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold">
            Mapping Permission: {roleName}
          </h2>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 gap-4 overflow-hidden">

          {/* LEFT */}
          <div className="w-1/2 bg-gray-50 rounded-xl p-3 flex flex-col overflow-hidden">
            <h3 className="font-semibold mb-2">
              Permission Tersedia
            </h3>

            <input
              placeholder="Search..."
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
              className="mb-2 px-2 py-1 border rounded text-sm"
            />

            {/* TOMBOL "Pilih Semua" */}
            <button
              type="button"
              onClick={() =>
                setSelected((prev) => [
                  ...new Set([
                    ...prev,
                    ...leftList.map((p) => p.id_permission),
                  ]),
                ])
              }
              disabled={leftList.length === 0}
              className="mb-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Pilih Semua
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {leftList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">
                  Kosong
                </p>
              ) : (
                leftList.map((p) => (
                  <div
                    key={p.id_permission}
                    onClick={() => addPermission(p.id_permission)}
                    className="cursor-pointer px-3 py-2 rounded border hover:bg-green-100"
                  >
                    {p.permission_name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-1/2 bg-green-50 rounded-xl p-3 flex flex-col overflow-hidden">
            <h3 className="font-semibold mb-2">
              Permission Dipilih
            </h3>

            <input
              placeholder="Search..."
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className="mb-2 px-2 py-1 border rounded text-sm"
            />

            {/* TOMBOL "Clear" */}
            <button
              type="button"
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="mb-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Clear
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {rightList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">
                  Belum ada
                </p>
              ) : (
                rightList.map((p) => (
                  <div
                    key={p.id_permission}
                    onClick={() => removePermission(p.id_permission)}
                    className="cursor-pointer px-3 py-2 rounded border bg-white hover:bg-red-100"
                  >
                    {p.permission_name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
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