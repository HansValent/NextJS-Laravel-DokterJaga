"use client"

import ParamedicFormModal from "@/components/Paramedic/ParamedicFormModal"
import Loading from "@/components/Loading"
import { Toast } from "@/components/Toast"
import { useConfirm } from "@/app/admin/context/ConfirmContext"
import { useAuth } from "@/app/admin/context/AuthContext"
import { useEffect, useMemo, useState } from "react"
import {
  getParamedicAdmin,
  deleteParamedic,
  restoreParamedic,
  Paramedic,
  ParamedicSortKey,
} from "@/services/jadwalService"
import { useJadwalSocket } from "@/hooks/useJadwalSocket"

const PER_PAGE = 10

export default function ParamedicPage() {
  /* ================= STATE ================= */
  const [data, setData] = useState<Paramedic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hasPermission } = useAuth()
  const confirmDialog = useConfirm()
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<ParamedicSortKey>("id")
  const [sortAsc, setSortAsc] = useState(true)

  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<Paramedic | null>(null)

  // Mode filter
  const [mode, setMode] = useState<"aktif" | "deleted" | "semua">("aktif")
  const [page, setPage] = useState(1)

  // Filter jenis paramedic
  const [jenisFilter, setJenisFilter] = useState<string>("")

  // Toast notification
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  // Cek permission
  const canRestore = hasPermission("paramedic.restore")
  const canUpdate = hasPermission("paramedic.update")
  const canDelete = hasPermission("paramedic.delete")

  /* ================= WEBSOCKET ================= */
  useJadwalSocket(["paramedic-updated"], () => {
    fetchData()
  })

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getParamedicAdmin(true)
      setData(res)
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil data paramedic")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ================= HANDLERS ================= */
  const handleDelete = async (item: Paramedic) => {
    const ok = await confirmDialog({
      title: "Hapus Paramedic",
      message: `Yakin ingin menghapus paramedic ini?\n\nID: ${item.id}\nNama: ${item.nama_paramedic}\nNPK: ${item.npk || "-"}\nJenis: ${item.jenis_paramedic || "-"}`,
      confirmText: "Ya, Hapus",
      danger: true,
    })
    if (!ok) return
    try {
      await deleteParamedic(item.id)
      setToast({ message: "Paramedic berhasil dihapus (soft delete)", type: "success" })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.message || "Gagal menghapus paramedic", type: "error" })
    }
  }

  const handleRestore = async (item: Paramedic) => {
    const ok = await confirmDialog({
      title: "Restore Paramedic",
      message: `Restore paramedic ini?\n\nID: ${item.id}\nNama: ${item.nama_paramedic}\nNPK: ${item.npk || "-"}\nJenis: ${item.jenis_paramedic || "-"}`,
      confirmText: "Ya, Restore",
    })
    if (!ok) return
    try {
      await restoreParamedic(item.id)
      setToast({ message: "Paramedic berhasil direstore", type: "success" })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.message || "Gagal merestore paramedic", type: "error" })
    }
  }

  /* ================= FILTER + SORT + MODE ================= */
  const jenisOptions = useMemo(() => {
    const uniq = new Set<string>()
    data.forEach((item) => {
      if (item.jenis_paramedic) uniq.add(item.jenis_paramedic)
    })
    return Array.from(uniq).sort()
  }, [data])

  const filteredData = useMemo(() => {
    let result = [...data]

    if (mode === "aktif") result = result.filter((item) => !item.deleted_at)
    else if (mode === "deleted") result = result.filter((item) => item.deleted_at)

    // Filter jenis
    if (jenisFilter !== "") {
      result = result.filter((item) => item.jenis_paramedic === jenisFilter)
    }

    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter((item) => {
        return (
          String(item.id).includes(keyword) ||
          item.nama_paramedic.toLowerCase().includes(keyword) ||
          (item.npk && item.npk.toLowerCase().includes(keyword))
        )
      })
    }

    result.sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA
      }
      const strA = String(valA ?? "")
      const strB = String(valB ?? "")
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })

    return result
  }, [data, mode, search, sortKey, sortAsc, jenisFilter])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE))
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filteredData.slice(start, start + PER_PAGE)
  }, [filteredData, page])

  // Reset halaman saat filter berubah
  useEffect(() => {
    setPage(1)
  }, [mode, search, jenisFilter])

  const handleSort = (key: ParamedicSortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const formatDate = (date?: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleString("id-ID")
  }

  const isDeleted = (item: Paramedic) => !!item.deleted_at

  const modalEditData = editData
    ? {
        id: editData.id,
        nama_paramedic: editData.nama_paramedic,
        npk: editData.npk ?? undefined,
        jenis_paramedic: editData.jenis_paramedic ?? undefined,
      }
    : null

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Paramedic</h1>
        <button
          onClick={fetchData}
          className="text-sm px-3 py-2 bg-blue-500 text-white rounded"
        >
          Refresh
        </button>
      </div>

      {/* MODE FILTER BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("aktif")}
          className={`px-3 py-1 rounded ${
            mode === "aktif" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Aktif
        </button>
        <button
          onClick={() => setMode("deleted")}
          className={`px-3 py-1 rounded ${
            mode === "deleted" ? "bg-red-600 text-white" : "bg-gray-200"
          }`}
        >
          Dihapus
        </button>
        <button
          onClick={() => setMode("semua")}
          className={`px-3 py-1 rounded ${
            mode === "semua" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Semua
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Cari ID, nama, atau NPK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-[250px]"
          />
          <div className="text-sm text-gray-500">
            Total: {filteredData.length} | Halaman {page} dari {totalPages}
          </div>
        </div>

        {hasPermission("paramedic.create") && (
          <button
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Tambah Karyawan
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* TABLE CONTAINER (selalu tampil meskipun data kosong) */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : (
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-gray-100 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  className="p-3 w-[60px] text-left cursor-pointer"
                >
                  ID {sortKey === "id" && (sortAsc ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("nama_paramedic")}
                  className="p-3 text-left cursor-pointer"
                >
                  Nama {sortKey === "nama_paramedic" && (sortAsc ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("npk")}
                  className="p-3 w-[120px] text-left cursor-pointer"
                >
                  NPK {sortKey === "npk" && (sortAsc ? "↑" : "↓")}
                </th>
                {/* Kolom Jenis dengan dropdown filter */}
                <th className="p-3 w-[140px] text-left">
                  <div className="flex flex-col items-center gap-1">
                    <span>Jenis</span>
                    <select
                      value={jenisFilter}
                      onChange={(e) => setJenisFilter(e.target.value)}
                      className="border rounded text-xs px-1 py-0.5 w-28"
                    >
                      <option value="">Semua</option>
                      {jenisOptions.map((jenis) => (
                        <option key={jenis} value={jenis}>
                          {jenis}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="p-3 w-[120px] text-left">Created By</th>
                <th className="p-3 w-[160px] text-left">Created At</th>
                <th className="p-3 w-[120px] text-left">Updated By</th>
                <th className="p-3 w-[160px] text-left">Updated At</th>
                <th className="p-3 w-[120px] text-left">Deleted By</th>
                <th className="p-3 w-[160px] text-left">Deleted At</th>
                <th className="p-3 w-[60px] text-center">Del</th>
                <th className="p-3 w-[180px] text-center">Aksi</th>
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
                    <tr
                      key={item.id}
                      className={`border-t ${
                        isDeleted(item) ? "bg-red-50 text-red-900" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3">{item.id}</td>
                      <td className="p-3">{item.nama_paramedic}</td>
                      <td className="p-3">{item.npk || "-"}</td>
                      <td className="p-3">{item.jenis_paramedic || "-"}</td>
                      <td className="p-3">{item.created_by || "-"}</td>
                      <td className="p-3">{formatDate(item.created_at)}</td>
                      <td className="p-3">{item.updated_by || "-"}</td>
                      <td className="p-3">{formatDate(item.updated_at)}</td>
                      <td className="p-3">{item.deleted_by || "-"}</td>
                      <td className="p-3">{formatDate(item.deleted_at)}</td>
                      <td className="p-3 text-center font-bold">
                        {isDeleted(item) ? "✔" : "✖"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center items-center">
                          {!isDeleted(item) && (
                            <>
                              {canUpdate && (
                                <button
                                  onClick={() => {
                                    setEditData(item)
                                    setOpen(true)
                                  }}
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

      {/* PAGINATION */}
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

      {/* MODAL */}
      <ParamedicFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchData}
        editData={modalEditData}
      />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}