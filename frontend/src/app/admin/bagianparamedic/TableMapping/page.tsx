"use client"

import { useEffect, useState, useMemo } from "react"
import Loading from "@/components/Loading"
import { Toast } from "@/components/Toast"
import { useConfirm } from "@/app/admin/context/ConfirmContext"
import { useAuth } from "@/app/admin/context/AuthContext"
import {
  getBagianParamedicAdmin,
  getParamedic,
  getposisiAdmin,
  deleteBagianParamedic,
  restoreBagianParamedic,
} from "@/services/jadwalService"
import { Posisi } from "@/lib/type"
import BagianParamedicFormModal from "@/components/BagianParamedic/BagianParamedicFormModal"
import { useJadwalSocket } from "@/hooks/useJadwalSocket"

import type { BagianParamedicView, Paramedic } from "@/services/jadwalService"

const PER_PAGE = 10

export default function TableMappingPage() {
  const [data, setData] = useState<BagianParamedicView[]>([])
  const [paramedicList, setParamedicList] = useState<Paramedic[]>([])
  const [posisiList, setposisiList] = useState<Posisi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hasPermission } = useAuth()
  const confirmDialog = useConfirm()

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<"paramedic_nama" | "posisi_nama">("paramedic_nama")
  const [sortAsc, setSortAsc] = useState(true)

  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<BagianParamedicView | null>(null)

  const [mode, setMode] = useState<"aktif" | "deleted" | "semua">("aktif")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [page, setPage] = useState(1)

  // Filter posisi via dropdown di header
  const [posisiFilter, setposisiFilter] = useState<string>("")

  const canRestore = hasPermission("bagian_paramedic.restore")
  const canUpdate = hasPermission("bagian_paramedic.update")
  const canDelete = hasPermission("bagian_paramedic.delete")

  useJadwalSocket(["bagian_paramedic-updated"], () => {
    fetchData()
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [bagianRes, paramedicRes, posisiRes] = await Promise.all([
        getBagianParamedicAdmin(true),
        getParamedic(),
        getposisiAdmin(true),
      ])
      setData(bagianRes.data)
      setParamedicList(paramedicRes)
      setposisiList(posisiRes)
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil data mapping")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (item: BagianParamedicView) => {
    const ok = await confirmDialog({
      title: "Hapus Mapping",
      message: `Yakin ingin menghapus mapping ini?\n\nID: ${item.id}\nParamedic: ${item.paramedic_nama}\nposisi: ${item.posisi_nama}`,
      confirmText: "Ya, Hapus",
      danger: true,
    })
    if (!ok) return
    try {
      await deleteBagianParamedic(item.id)
      setToast({ message: "Mapping berhasil dihapus (soft delete)", type: "success" })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.message || "Gagal menghapus mapping", type: "error" })
    }
  }

  const handleRestore = async (item: BagianParamedicView) => {
    const ok = await confirmDialog({
      title: "Restore Mapping",
      message: `Restore mapping ini?\n\nID: ${item.id}\nParamedic: ${item.paramedic_nama}\nposisi: ${item.posisi_nama}`,
      confirmText: "Ya, Restore",
    })
    if (!ok) return
    try {
      await restoreBagianParamedic(item.id)
      setToast({ message: "Mapping berhasil direstore", type: "success" })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.message || "Gagal merestore mapping", type: "error" })
    }
  }

  const npkMap = useMemo(
    () =>
      paramedicList.reduce(
        (acc, p) => {
          if (p.npk) acc[p.id] = p.npk
          return acc
        },
        {} as Record<number, string>
      ),
    [paramedicList]
  )

  const filteredData = useMemo(() => {
    let result = [...data]
    if (mode === "aktif") result = result.filter((item) => !item.deleted_at)
    else if (mode === "deleted") result = result.filter((item) => item.deleted_at)

    // Filter dropdown posisi (berdasarkan ID)
    if (posisiFilter !== "") {
      result = result.filter((item) => item.posisi_id === Number(posisiFilter))
    }

    if (search.trim()) {
      const keyword = search.toLowerCase()
      result = result.filter((item) => {
        const namaParamedic = (item.paramedic_nama ?? "").toLowerCase()
        const npk = (npkMap[item.paramedic_id] ?? "").toLowerCase()
        const namaposisi = (item.posisi_nama ?? "").toLowerCase()
        return namaParamedic.includes(keyword) || npk.includes(keyword) || namaposisi.includes(keyword)
      })
    }
    result.sort((a, b) => {
      const valA = sortKey === "paramedic_nama" ? (a.paramedic_nama ?? "") : (a.posisi_nama ?? "")
      const valB = sortKey === "paramedic_nama" ? (b.paramedic_nama ?? "") : (b.posisi_nama ?? "")
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })
    return result
  }, [data, mode, search, sortKey, sortAsc, npkMap, posisiFilter])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE))
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filteredData.slice(start, start + PER_PAGE)
  }, [filteredData, page])

  // Reset halaman saat filter berubah
  useEffect(() => {
    setPage(1)
  }, [mode, search, posisiFilter])

  const handleSort = (key: "paramedic_nama" | "posisi_nama") => {
    if (key === sortKey) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleString("id-ID") : "-"
  const isDeleted = (item: BagianParamedicView) => !!(item.deleted_at || item.is_deleted)

  // Hitung jumlah kolom untuk colspan saat "Tidak ada data"
  const getColSpan = () => {
    let count = 4 // No, Paramedic, NPK, posisi
    if (mode !== "deleted") count += 4 // Created By, Created At, Updated By, Updated At
    if (mode !== "aktif") count += 3 // Deleted By, Deleted At, Del
    count += 1 // Aksi
    return count
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Mapping Karyawan</h1>
        <button onClick={fetchData} className="text-sm px-3 py-2 bg-blue-500 text-white rounded">
          Refresh
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("aktif")}
          className={`px-3 py-1 rounded ${mode === "aktif" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Aktif
        </button>
        <button
          onClick={() => setMode("deleted")}
          className={`px-3 py-1 rounded ${mode === "deleted" ? "bg-red-600 text-white" : "bg-gray-200"}`}
        >
          Dihapus
        </button>
        <button
          onClick={() => setMode("semua")}
          className={`px-3 py-1 rounded ${mode === "semua" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Semua
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Cari nama / NPK / Posisi ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-[300px]"
          />
          <div className="text-sm text-gray-500">
            Total: {filteredData.length} | Halaman {page} dari {totalPages}
          </div>
        </div>
        {hasPermission("bagian_paramedic.create") && (
          <button
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Tambah Mapping
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Tabel selalu ditampilkan, meskipun tidak ada data */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6"><Loading /></div>
        ) : (
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-gray-100 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-2 w-[5%] text-left">No.</th>
                <th
                  className="p-2 text-left cursor-pointer"
                  onClick={() => handleSort("paramedic_nama")}
                >
                  Paramedic {sortKey === "paramedic_nama" && (sortAsc ? "↑" : "↓")}
                </th>
                <th className="p-2 w-[10%] text-left">NPK</th>
                {/* Kolom posisi dengan dropdown filter */}
                <th className="p-2 text-left">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="cursor-pointer"
                      onClick={() => handleSort("posisi_nama")}
                    >
                      Posisi {sortKey === "posisi_nama" && (sortAsc ? "↑" : "↓")}
                    </span>
                    <select
                      value={posisiFilter}
                      onChange={(e) => setposisiFilter(e.target.value)}
                      className="border rounded text-xs px-1 py-0.5 w-36"
                    >
                      <option value="">Semua</option>
                      {posisiList
                        .filter((s) => !s.deleted_at)
                        .sort((a, b) => a.nama_posisi.localeCompare(b.nama_posisi))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nama_posisi}
                          </option>
                        ))}
                    </select>
                  </div>
                </th>
                {mode !== "deleted" && (
                  <>
                    <th className="p-2 w-[12%] text-left">Created By</th>
                    <th className="p-2 w-[14%] text-left">Created At</th>
                    <th className="p-2 w-[12%] text-left">Updated By</th>
                    <th className="p-2 w-[14%] text-left">Updated At</th>
                  </>
                )}
                {mode !== "aktif" && (
                  <>
                    <th className="p-2 w-[12%] text-left">Deleted By</th>
                    <th className="p-2 w-[14%] text-left">Deleted At</th>
                    <th className="p-2 w-[5%] text-center">Del</th>
                  </>
                )}
                <th className="p-2 text-center w-[10%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={getColSpan()} className="p-6 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const no = (page - 1) * PER_PAGE + paginatedData.indexOf(item) + 1
                  return (
                    <tr
                      key={item.id}
                      className={`border-t ${isDeleted(item) ? "bg-red-50 text-red-900" : ""}`}
                    >
                      <td className="p-2">{no}</td>
                      <td className="p-2">{item.paramedic_nama}</td>
                      <td className="p-2">{npkMap[item.paramedic_id] || "-"}</td>
                      <td className="p-2">{item.posisi_nama}</td>
                      {mode !== "deleted" && (
                        <>
                          <td className="p-2">{item.created_by || "-"}</td>
                          <td className="p-2">{formatDate(item.created_at)}</td>
                          <td className="p-2">{item.updated_by || "-"}</td>
                          <td className="p-2">{formatDate(item.updated_at)}</td>
                        </>
                      )}
                      {mode !== "aktif" && (
                        <>
                          <td className="p-2">{item.deleted_by || "-"}</td>
                          <td className="p-2">{formatDate(item.deleted_at)}</td>
                          <td className="p-2 text-center font-bold">
                            {isDeleted(item) ? "✔" : "✖"}
                          </td>
                        </>
                      )}
                      <td className="p-2 text-center">
                        <div
                          className={`flex gap-2 justify-center items-center ${isDeleted(item) ? "flex-col" : ""}`}
                        >
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

      <BagianParamedicFormModal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          setEditData(null)
        }}
        onSuccess={fetchData}
        selectedposisi={null}
        editData={editData}
      />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}