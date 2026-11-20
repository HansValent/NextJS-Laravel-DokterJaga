"use client"

import { useEffect, useState, useCallback } from "react"
import PermissionFormModal from "@/components/users/permission/PermissionFormModal"
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission
} from "@/services/usersService"

import ColumnTersedia from "./columnTersedia"
import ColumnDipilih from "./columnDipilih"
import { useAuth } from "../../context/AuthContext"
import { Permission } from "@/lib/type"

export default function PickupPermission() {

  // ======================
  // STATE
  // ======================
  const { hasPermission } = useAuth()
  const canEditPermission = hasPermission("permission.update");
  const canDeletePermission = hasPermission("permission.delete");
  const canCreatePermission = hasPermission("permission.create");

  const [permissions, setPermissions] = useState<Permission[]>([])  // data dari server
  const [filtered, setFiltered] = useState<Permission[]>([])
  const [selected, setSelected] = useState<Permission[]>([])        // akan dihapus
  const [newPermissions, setNewPermissions] = useState<Permission[]>([]) // akan dibuat

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Permission | null>(null)

  const [search, setSearch] = useState("")
  const [searchLeft, setSearchLeft] = useState("")
  const [searchRight, setSearchRight] = useState("")

  const [manualRoute, setManualRoute] = useState("")

  const [loading, setLoading] = useState(false)

  // ======================
  // FETCH DATA
  // ======================
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getPermissions()
      const data: Permission[] = (res?.data ?? []).map((p: any) => ({
        id_permission: p.id_permission ?? p.id,
        permission_name: p.permission_name ?? p.name,
        route: p.route ?? "",
      }))
      setPermissions(data)
      setFiltered(data)
    } catch (err) {
      console.error(err)
      alert("Gagal mengambil permission")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ======================
  // SEARCH GLOBAL
  // ======================
  useEffect(() => {
    const keyword = search.toLowerCase()
    const result = permissions.filter((p) =>
      p.permission_name.toLowerCase().includes(keyword)
    )
    setFiltered(result)
  }, [search, permissions])

  // ======================
  // ACTION
  // ======================

  // Pindahkan dari Tersedia (kanan) → Dipilih (kiri) → akan dihapus
  const handleSelect = useCallback((p: Permission) => {
    // Jika item adalah permission baru (akan dibuat), batal buat
    if (newPermissions.some(np => np.id_permission === p.id_permission)) {
      setNewPermissions(prev => prev.filter(np => np.id_permission !== p.id_permission))
      return
    }
    // Jika sudah ada di selected, abaikan
    if (selected.find(s => s.id_permission === p.id_permission)) return
    setSelected(prev => [...prev, p])
  }, [newPermissions, selected])

  // Edit permission (dari Tersedia)
  const handleEdit = (p: Permission) => {
    setEditing(p)
    setModalOpen(true)
  }

  // Hapus item dari Dipilih (kiri) → kembalikan ke Tersedia sebagai item baru (akan dibuat ulang)
  const handleRemoveFromSelected = (p: Permission) => {
    setSelected(prev => prev.filter(s => s.id_permission !== p.id_permission))
    // Buat ID sementara agar unik di newPermissions
    const newItem: Permission = {
      ...p,
      id_permission: Date.now() + Math.random(), // pastikan unik
    }
    setNewPermissions(prev => [...prev, newItem])
  }

  // Hapus langsung dari database (tombol × di Tersedia, hanya untuk data server)
  const handleDeleteAvailable = async (p: Permission) => {
    // Jika item adalah newPermission, hapus dari state saja
    if (newPermissions.some(np => np.id_permission === p.id_permission)) {
      setNewPermissions(prev => prev.filter(np => np.id_permission !== p.id_permission))
      return
    }
    if (!confirm(`Hapus permission "${p.permission_name}"?`)) return
    try {
      setLoading(true)
      await deletePermission(p.id_permission)
      await fetchData()
    } catch (err) {
      console.error(err)
      alert("Gagal menghapus permission")
    } finally {
      setLoading(false)
    }
  }

  // Tambah route manual → newPermissions
  const handleAddManual = () => {
    if (!manualRoute.trim()) {
      alert("Route tidak boleh kosong")
      return
    }
    const newItem: Permission = {
      id_permission: Date.now() + Math.random(),
      permission_name: manualRoute,
      route: manualRoute,
    }
    setNewPermissions(prev => [...prev, newItem])
    setManualRoute("")
  }

  // Submit modal (create / update di database langsung)
  const handleSubmitModal = async (data: { permission_name: string; route: string }) => {
    try {
      setLoading(true)
      if (editing) {
        await updatePermission(editing.id_permission, data)
      } else {
        await createPermission(data)
      }
      setModalOpen(false)
      setEditing(null)
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Gagal simpan permission")
    } finally {
      setLoading(false)
    }
  }

  // SIMPAN PERUBAHAN: hapus selected, buat newPermissions
  const handleSave = async () => {
    if (selected.length === 0 && newPermissions.length === 0) {
      alert("Tidak ada perubahan untuk disimpan")
      return
    }
    try {
      setLoading(true)
      // Hapus semua yang dipilih
      for (const p of selected) {
        await deletePermission(p.id_permission)
      }
      // Buat semua yang baru
      for (const p of newPermissions) {
        await createPermission({
          permission_name: p.permission_name,
          route: p.route,
        })
      }
      alert("Perubahan berhasil disimpan")
      setSelected([])
      setNewPermissions([])
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Gagal menyimpan perubahan")
    } finally {
      setLoading(false)
    }
  }

  // ======================
  // DATA UNTUK PANEL
  // ======================
  // Data untuk kolom Kiri (Dipilih) → selected
  const dipilih = selected.filter(p =>
    p.permission_name.toLowerCase().includes(searchLeft.toLowerCase())
  )

  // Data untuk kolom Kanan (Tersedia)
  // Gabungan: permission dari server yang tidak dihapus (bukan selected) + newPermissions
  const existingNotSelected = filtered.filter(
    p => !selected.some(s => s.id_permission === p.id_permission)
  )
  // newPermissions yang tidak juga ada di selected (seharusnya tidak mungkin, tapi jaga-jaga)
  const newNotSelected = newPermissions.filter(
    np => !selected.some(s => s.id_permission === np.id_permission)
  )
  const tersedia = [...existingNotSelected, ...newNotSelected].filter(p =>
    p.permission_name.toLowerCase().includes(searchRight.toLowerCase())
  )

  // ======================
  // UI
  // ======================
  return (
    <>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Permission</h1>
            <p className="text-gray-500">{permissions.length} Permission Terdaftar</p>
          </div>

          {canCreatePermission && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-white rounded-lg shadow"
              style={{ background: "linear-gradient(to right, #006838, #8DC63F)" }}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          )}
        </div>

        {/* ================= SEARCH GLOBAL ================= */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari permission..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              title="Hapus pencarian"
            >
              clear
            </button>
          )}
        </div>

        {/* MANUAL ROUTE */}
        <div className="flex gap-2">
          {canCreatePermission && (
            <input
              type="text"
              placeholder="Tambah route manual (contoh: GET /api/users)"
              value={manualRoute}
              onChange={(e) => setManualRoute(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
          )}
          {canCreatePermission && (
            <button
              onClick={handleAddManual}
              className="px-4 py-2 text-white rounded-lg"
              style={{ background: "linear-gradient(to right, #006838, #8DC63F)" }}
            >
              Add
            </button>
          )}
        </div>

        {/* PANEL */}
        <div className="flex gap-4 h-[70vh]">

          {/* KIRI: Dipilih (akan dihapus) */}
          <div className="w-1/2 bg-white rounded-xl shadow p-3 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">
                Dipilih (Akan Dihapus) ({dipilih.length})
              </h2>
              <button
                onClick={() => setSelected([])}
                className="text-xs text-red-500"
              >
                Reset
              </button>
            </div>

            <div className="relative mb-2">
              <input
                placeholder="Search..."
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                className="w-full px-2 py-1 pr-6 border rounded text-sm"
              />
              {searchLeft && (
                <button
                  onClick={() => setSearchLeft("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  title="Hapus pencarian"
                >
                  clear
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              <ColumnDipilih
                data={dipilih}
                onRemove={handleRemoveFromSelected}
                canDelete={canDeletePermission}
              />
            </div>
          </div>

          {/* KANAN: Tersedia (existing + new) */}
          <div className="w-1/2 bg-white rounded-xl shadow p-3 flex flex-col">
            <h2 className="font-semibold mb-2">
              Tersedia ({tersedia.length})
            </h2>

            <div className="relative mb-2">
              <input
                placeholder="Search..."
                value={searchRight}
                onChange={(e) => setSearchRight(e.target.value)}
                className="w-full px-2 py-1 pr-6 border rounded text-sm"
              />
              {searchRight && (
                <button
                  onClick={() => setSearchRight("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  title="Hapus pencarian"
                >
                  clear
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ColumnTersedia
                  data={tersedia}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onRemove={handleDeleteAvailable}
                  canEdit={canEditPermission}
                  canDelete={canDeletePermission}
                  // Item baru tidak bisa dipindah ke kiri (tidak bisa di-select)
                  canSelect={(p) => !newPermissions.some(np => np.id_permission === p.id_permission)}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL */}
      <PermissionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmitModal}
        initialData={
          editing
            ? {
                permission_name: editing.permission_name,
                route: editing.route,
              }
            : undefined
        }
      />
    </>
  )
}