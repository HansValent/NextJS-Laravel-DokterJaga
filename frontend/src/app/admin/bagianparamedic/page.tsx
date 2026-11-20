"use client"

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@/app/admin/context/AuthContext"
import {
  getBagianParamedicAdmin,
  getposisiAdmin,
  getParamedic,
  deleteBagianParamedic,
  BagianParamedicView,
  Paramedic,
} from "@/services/jadwalService"
import { Posisi } from "@/lib/type"

import BagianParamedicFormModal from "@/components/BagianParamedic/BagianParamedicFormModal"

export default function BagianParamedicPage() {
  const [data, setData] = useState<BagianParamedicView[]>([])
  const [posisi, setposisi] = useState<Posisi[]>([])
  const [paramedicList, setParamedicList] = useState<Paramedic[]>([])
  const [selectedposisi, setSelectedposisi] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<BagianParamedicView | null>(null)
  const { hasPermission } = useAuth()

  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // 🔍 FILTER
  const [searchposisi, setSearchposisi] = useState("")
  const [searchParamedic, setSearchParamedic] = useState("")

  // 🔽 SORT
  const [sortposisiAsc] = useState(true)
  const [sortParamedicAsc] = useState(true)

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      setLoading(true)

      const [bagianRes, posisiRes, paramedicRes] = await Promise.all([
        getBagianParamedicAdmin(),
        getposisiAdmin(),
        getParamedic(),
      ])

      setData(bagianRes.data)
      setposisi(posisiRes)
      setParamedicList(paramedicRes)

      setSelectedposisi((prev) => {
        if (!prev) {
          return posisiRes[0]?.id ?? null
        }
      
        const stillExist = posisiRes.some((s: Posisi) => s.id === prev)
      
        return stillExist
          ? prev
          : posisiRes[0]?.id ?? null
      })

    } catch (err) {
      console.error(err)
      alert("Gagal load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ================= DELETE =================
  const handleDelete = async (item: BagianParamedicView) => {
    if (
      !confirm(
        `Yakin hapus data?\n\nID: ${item.id}\nNama: ${item.paramedic_nama}`
      )
    ) return

    try {
      await deleteBagianParamedic(item.id)
      setData((prev) => prev.filter((d) => d.id !== item.id))
    } catch (err) {
      console.error(err)
      alert("Gagal hapus")
    }
  }

  // ================= COUNT =================
  const countMap = data.reduce((acc, item) => {
    acc[item.posisi_id] = (acc[item.posisi_id] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // ================= MAP NPK =================
  // Didefinisikan di sini agar bisa dipakai oleh filter paramedic
  const npkMap = paramedicList.reduce((acc, p) => {
    if (p.npk) acc[p.id] = p.npk
    return acc
  }, {} as Record<number, string>)

  // ================= FILTER posisi =================
  const filteredposisi = posisi
    .filter(s => {
      const keyword = searchposisi.toLowerCase()
      return (
        s.nama_posisi.toLowerCase().includes(keyword)
      )
    })
    .sort((a, b) =>
      sortposisiAsc
        ? a.nama_posisi.localeCompare(b.nama_posisi)
        : b.nama_posisi.localeCompare(a.nama_posisi)
    )

  // ================= FILTER PARAMEDIC =================
  const filtered = selectedposisi
    ? data.filter(d => {
        if (d.posisi_id !== selectedposisi) return false
        const keyword = searchParamedic.toLowerCase()
        const nama = (d.paramedic_nama ?? "").toLowerCase()
        const npk = (npkMap[d.paramedic_id] ?? "").toLowerCase()
        return nama.includes(keyword) || npk.includes(keyword)
      })
    : []

  // ================= SORT PARAMEDIC =================
  const sortedParamedic = [...filtered].sort((a, b) => {
    const nameA = a.paramedic_nama ?? ""
    const nameB = b.paramedic_nama ?? ""
    return sortParamedicAsc
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA)
  })

  return (
    <div className="flex flex-col gap-4">

      {/* TITLE */}
      <h1 className="text-2xl font-bold">Mapping Karyawan</h1>

      <div className="flex gap-4 h-[75vh]">

        {/* ================= LEFT ================= */}
        <div className="w-1/4 bg-white rounded-xl shadow p-3 flex flex-col">
          <h2 className="font-semibold mb-2">Posisi</h2>

          <input
            placeholder="Cari nama Posisi"
            value={searchposisi}
            onChange={(e) => setSearchposisi(e.target.value)}
            className="mb-2 px-2 py-1 border rounded text-sm"
          />

          <div className="overflow-y-auto">
            {filteredposisi.map((s) => {
              const count = countMap[s.id] || 0

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedposisi(s.id)}
                  className={`flex justify-between items-center px-3 py-2 rounded mb-2 cursor-pointer ${
                    selectedposisi === s.id
                      ? "bg-green-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {s.nama_posisi}
                    </p>
                    <p className="text-xs text-gray-500">
                      {count} karyawan
                    </p>
                  </div>

                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="w-3/4 bg-white rounded-xl shadow p-4 flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">
                {
                  posisi.find(s => s.id === selectedposisi)?.nama_posisi || "-"
                }
              </h2>
              <p className="text-sm text-gray-500">
                {sortedParamedic.length} karyawan
              </p>
            </div>

            {hasPermission("bagian_paramedic.create") && (
            <button
              disabled={!selectedposisi}
              onClick={() => {
                setSelectedItem(null)
                setModalOpen(true)
              }}
              className={`px-4 py-2 rounded text-white ${
                selectedposisi
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              + Tambah Mapping
            </button>
            )}
          </div>

          {/* SEARCH */}
          <input
            placeholder="Cari nama / NPK paramedic..."
            value={searchParamedic}
            onChange={(e) => setSearchParamedic(e.target.value)}
            className="mb-2 px-2 py-1 border rounded text-sm"
          />

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto">
              {sortedParamedic.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border rounded-xl p-3 shadow-sm hover:shadow"
                >
                  <div>
                    <p className="font-medium">
                      {item.paramedic_nama}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.posisi_nama}
                    </p>
                  </div>

                  {/* ACTION */}
                  <div className="flex items-center gap-2">

                    {/* EDIT */}
                    {hasPermission("bagian_paramedic.update") && (
                    <button
                      onClick={() => {
                        setSelectedItem(item)
                        setModalOpen(true)
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium 
                                 rounded-md bg-blue-50 text-blue-600 
                                 hover:bg-blue-100 active:scale-95 transition"
                    >
                      ✏️
                    </button>
                    )}

                    {/* DELETE */}
                    {hasPermission("bagian_paramedic.delete") && (
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex items-center justify-center w-7 h-7 
                                 rounded-md bg-red-50 text-red-500 
                                 hover:bg-red-100 active:scale-95 transition"
                    >
                      ×
                    </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <BagianParamedicFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedItem(null)
        }}
        onSuccess={loadData}
        selectedposisi={selectedposisi}
        editData={selectedItem}
      />
    </div>
  )
}