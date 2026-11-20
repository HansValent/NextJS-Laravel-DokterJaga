"use client"

import Loading from "@/components/Loading"
import { Toast } from "@/components/Toast"
import { useConfirm } from "@/app/admin/context/ConfirmContext"
import PosisiFormModal from "@/components/Posisi/PosisiFormModal"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/app/admin/context/AuthContext"
import {
  getposisiAdmin,
  deleteposisi,
  restoreposisi,
} from "@/services/jadwalService"
import { useJadwalSocket } from "@/hooks/useJadwalSocket"

import { Posisi } from "@/lib/type"

const PER_PAGE = 10

export default function posisiPage() {
  const [data, setData] = useState<Posisi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hasPermission } = useAuth()
  const confirmDialog = useConfirm()
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<"nama_posisi" | "kategori">("kategori")
  const [sortAsc, setSortAsc] = useState(true)

  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<Posisi | null>(null)

  const [mode, setMode] = useState<"aktif" | "deleted" | "semua">("aktif")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const [page, setPage] = useState(1)

  const canRestore = hasPermission("posisi.restore")
  const canUpdate = hasPermission("posisi.update")
  const canDelete = hasPermission("posisi.delete")

  useJadwalSocket(["posisi-updated"], () => {
    fetchData()
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getposisiAdmin(true)
      setData(res)
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil data posisi")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (item: Posisi) => {
    const ok = await confirmDialog({
      title: "Hapus posisi",
      message: `Yakin ingin menghapus posisi ini?\n\nID: ${item.id}\nNama: ${item.nama_posisi}\nKategori: ${item.kategori_nama || "-"}`,
      confirmText: "Ya, Hapus",
      danger: true,
    })
    if (!ok) return
    try {
      await deleteposisi(item.id)
      setToast({ message: "posisi berhasil dihapus (soft delete)", type: "success" })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.message || "Gagal menghapus posisi", type: "error" })
    }
  }

  const handleRestore = async (item: Posisi) => {
    const ok = await confirmDialog({
      title: "Restore posisi",
      message: `Restore posisi ini?\n\nID: ${item.id}\nNama: ${item.nama_posisi}\nKategori: ${item.kategori_nama || "-"}`,
      confirmText: "Ya, Restore",
    })
    if (!ok) return
    try {
      await restoreposisi(item.id)
      setToast({ message: "posisi berhasil direstore", type: "success" })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.message || "Gagal merestore posisi", type: "error" })
    }
  }

  const filteredData = useMemo(() => {
    let result = [...data]
    if (mode === "aktif") result = result.filter((item) => !item.deleted_at)
    else if (mode === "deleted") result = result.filter((item) => item.deleted_at)
    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter((item) =>
        item.nama_posisi.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
      )
    }
    result.sort((a, b) => {
      if (sortKey === "kategori") {
        if (a.kategori_urutan !== b.kategori_urutan)
          return sortAsc ? a.kategori_urutan - b.kategori_urutan : b.kategori_urutan - a.kategori_urutan
        return sortAsc ? a.urutan - b.urutan : b.urutan - a.urutan
      }
      return sortAsc ? a.nama_posisi.localeCompare(b.nama_posisi) : b.nama_posisi.localeCompare(a.nama_posisi)
    })
    return result
  }, [data, mode, search, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE))
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filteredData.slice(start, start + PER_PAGE)
  }, [filteredData, page])

  useEffect(() => { setPage(1) }, [mode, search])

  const handleSort = (key: "nama_posisi" | "kategori") => {
    if (key === sortKey) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleString("id-ID") : "-"
  const isDeleted = (item: Posisi) => !!item.deleted_at

  const modalEditData = editData ? {
    id: editData.id,
    nama_posisi: editData.nama_posisi,
    kategori_id: editData.kategori_id ?? null,
  } : null

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Posisi</h1>
        <button onClick={fetchData} className="text-sm px-3 py-2 bg-blue-500 text-white rounded">Refresh</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setMode("aktif")} className={`px-3 py-1 rounded ${mode === "aktif" ? "bg-green-600 text-white" : "bg-gray-200"}`}>Aktif</button>
        <button onClick={() => setMode("deleted")} className={`px-3 py-1 rounded ${mode === "deleted" ? "bg-red-600 text-white" : "bg-gray-200"}`}>Dihapus</button>
        <button onClick={() => setMode("semua")} className={`px-3 py-1 rounded ${mode === "semua" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Semua</button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Cari nama Posisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-[250px]"
          />
          <div className="text-sm text-gray-500">
            Total: {filteredData.length} | Halaman {page} dari {totalPages}
          </div>
        </div>
        {hasPermission("posisi.create") && (
          <button
            onClick={() => { setEditData(null); setOpen(true) }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Tambah Posisi
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Container tunggal dengan tinggi maksimal, overflow-x dan overflow-y */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6"><Loading /></div>
        ) : (
          <table className="min-w-[1200px] text-sm table-auto">
            <thead className="bg-gray-100 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-2 w-[5%] text-left">No.</th>
                <th onClick={() => handleSort("nama_posisi")} className="p-2 text-left cursor-pointer">
                  Nama {sortKey === "nama_posisi" && (sortAsc ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("kategori")} className="p-2 w-[12%] text-left cursor-pointer">
                  Kategori {sortKey === "kategori" && (sortAsc ? "↑" : "↓")}
                </th>
                <th className="p-2 w-[6%] text-left">Urutan</th>
                <th className="p-2 w-[12%] text-left">Created By</th>
                <th className="p-2 w-[14%] text-left">Created At</th>
                <th className="p-2 w-[12%] text-left">Updated By</th>
                <th className="p-2 w-[14%] text-left">Updated At</th>
                <th className="p-2 w-[12%] text-left">Deleted By</th>
                <th className="p-2 w-[14%] text-left">Deleted At</th>
                <th className="p-2 w-[5%] text-center">Del</th>
                <th className="p-2 text-center w-[10%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-6 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const no = (page - 1) * PER_PAGE + index + 1
                  return (
                    <tr key={item.id} className={`border-t ${isDeleted(item) ? "bg-red-50 text-red-900" : ""}`}>
                      <td className="p-2">{no}</td>
                      <td className="p-2">{item.nama_posisi}</td>
                      <td className="p-2">{item.kategori_nama || "-"}</td>
                      <td className="p-2">{item.urutan}</td>
                      <td className="p-2">{item.created_by || "-"}</td>
                      <td className="p-2">{formatDate(item.created_at)}</td>
                      <td className="p-2">{item.updated_by || "-"}</td>
                      <td className="p-2">{formatDate(item.updated_at)}</td>
                      <td className="p-2">{item.deleted_by || "-"}</td>
                      <td className="p-2">{formatDate(item.deleted_at)}</td>
                      <td className="p-2 text-center font-bold">{isDeleted(item) ? "✔" : "✖"}</td>
                      <td className="p-2 text-center">
                        <div className={`flex gap-2 justify-center items-center ${isDeleted(item) ? 'flex-col' : ''}`}>
                          {!isDeleted(item) && (
                            <>
                              {canUpdate && (
                                <button
                                  onClick={() => { setEditData(item); setOpen(true) }}
                                  className="px-2 py-1 bg-yellow-400 text-white rounded"
                                >
                                  Ubah
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="px-2 py-1 bg-red-500 text-white rounded"
                                >
                                  Hapus
                                </button>
                              )}
                            </>
                          )}
                          {isDeleted(item) && (
                            <>
                              {canRestore && (
                                <button
                                  onClick={() => handleRestore(item)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded"
                                >
                                  Restore
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Navigasi Halaman */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <PosisiFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchData}
        editData={modalEditData}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}