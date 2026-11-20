"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Toast } from "@/components/Toast"
import dayjs from "dayjs"

import {
  createJadwal,
  updateJadwal,
  getParamedic,
  getposisi,
  getBagianParamedic,
  Paramedic,
  BagianParamedic,
} from "@/services/jadwalService"
import { Jadwal, Posisi } from "@/lib/type"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: Jadwal | null
  tanggal?: string
  defaultposisiId?: number | ""
}

export default function JadwalFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  tanggal: tanggalProp,
  defaultposisiId,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [paramedics, setParamedics] = useState<Paramedic[]>([])
  const [posisi, setposisi] = useState<Posisi[]>([])
  const [bagian, setBagian] = useState<BagianParamedic[]>([])

  const [searchposisi, setSearchposisi] = useState("")
  const [searchParamedic, setSearchParamedic] = useState("")

  const [openposisi, setOpenposisi] = useState(false)
  const [openParamedic, setOpenParamedic] = useState(false)

  const posisiRef = useRef<HTMLDivElement>(null)
  const paramedicRef = useRef<HTMLDivElement>(null)

  const [posisiId, setposisiId] = useState<number | "">("")
  const [paramedicId, setParamedicId] = useState<number | "">("")

  const [tanggal, setTanggal] = useState("")
  const [isRange, setIsRange] = useState(false)
  const [tanggalMulai, setTanggalMulai] = useState("")
  const [tanggalSelesai, setTanggalSelesai] = useState("")

  const [peran, setPeran] = useState<string>('Utama')
  const [tipeJaga, setTipeJaga] = useState<string>('-')
  const [keterangan, setKeterangan] = useState<string>('')

  const [loading, setLoading] = useState(false)

  // ─── HELPER ──────────────────────────────────────────
  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = []
    let current = dayjs(start)
    const endDate = dayjs(end)
    while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
      dates.push(current.format("YYYY/MM/DD"))
      current = current.add(1, "day")
    }
    return dates
  }

  // ─── MOUNT ───────────────────────────────────────────
  useEffect(() => { setMounted(true) }, [])

  // ─── FETCH DATA ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const [p, s, b] = await Promise.all([
          getParamedic(),
          getposisi(),
          getBagianParamedic(),
        ])
        if (cancelled) return
        setParamedics(p)
        setposisi(s)
        setBagian(b.data)
      
        if (!editData) {
          const selected = s.find((sp) => sp.id === defaultposisiId)
          setposisiId(defaultposisiId || "")
          setSearchposisi(selected?.nama_posisi || "")
          
          // 🛠️ UBAH BAGIAN INI: Konversi DD/MM/YYYY ke YYYY-MM-DD
          if (tanggalProp) {
            const parts = tanggalProp.split("/") // Memecah "DD/MM/YYYY"
            if (parts.length === 3) {
              const [day, month, year] = parts
              setTanggal(`${year}-${month}-${day}`) // Menjadi "YYYY-MM-DD"
            } else {
              setTanggal(tanggalProp)
            }
          }
          
          setPeran('Utama')
          setTipeJaga('-')
          setKeterangan('')
        }
      } catch (err: any) {
        setToast({ message: "Gagal memuat data referensi", type: "error" })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isOpen])

  // ─── INIT EDIT ──────────────────────────────────────
  useEffect(() => {
    if (!editData || bagian.length === 0) return
    setposisiId(editData.posisi?.id ?? "")
    setSearchposisi(editData.posisi?.nama_posisi || "")
    setParamedicId(editData.paramedic?.id_paramedic ?? "")
    setSearchParamedic(editData.paramedic?.nama_paramedic || "")
    setTanggal(editData.tanggal)
    setIsRange(false)
    setPeran(editData.peran || 'Utama')
    setTipeJaga(editData.tipe_jaga || '-')
    setKeterangan(editData.keterangan || '')
  }, [editData, bagian])

  // ─── ESC & CLICK OUTSIDE ─────────────────────────────
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!posisiRef.current?.contains(e.target as Node)) setOpenposisi(false)
      if (!paramedicRef.current?.contains(e.target as Node)) setOpenParamedic(false)
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [])

  // ─── FILTER ──────────────────────────────────────────
  const filteredposisi = posisi.filter(s =>
    s.nama_posisi.toLowerCase().includes(searchposisi.toLowerCase())
  )

  const filteredParamedics = useMemo(() => {
    if (!posisiId) return []
    const ids = bagian
      .filter(b => b.id_posisi === posisiId)
      .map(b => b.id_paramedic)
    return paramedics.filter(p => ids.includes(p.id))
  }, [paramedics, bagian, posisiId])

  const filteredParamedicSearch = filteredParamedics.filter(p =>
    p.nama_paramedic.toLowerCase().includes(searchParamedic.toLowerCase())
  )

  // ─── SUBMIT ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paramedicId || !posisiId) {
      setToast({ message: "Paramedic dan posisi wajib dipilih", type: "error" })
      return
    }

    const selectedBagian = bagian.find(
      b => b.id_paramedic === paramedicId && b.id_posisi === posisiId
    )
    if (!selectedBagian) {
      setToast({ message: "Relasi paramedic‑posisi tidak ditemukan", type: "error" })
      return
    }

    let dates: string[] = []
    if (editData) {
      if (!tanggal) {
        setToast({ message: "Tanggal wajib diisi", type: "error" })
        return
      }
      dates = [tanggal]
    } else if (isRange) {
      if (!tanggalMulai || !tanggalSelesai) {
        setToast({ message: "Tanggal mulai dan selesai wajib diisi", type: "error" })
        return
      }
      const start = dayjs(tanggalMulai)
      const end = dayjs(tanggalSelesai)
      if (end.isBefore(start)) {
        setToast({ message: "Tanggal selesai harus setelah atau sama dengan tanggal mulai", type: "error" })
        return
      }
      dates = generateDateRange(tanggalMulai, tanggalSelesai)
    } else {
      if (!tanggal) {
        setToast({ message: "Tanggal wajib diisi", type: "error" })
        return
      }
      dates = [tanggal]
    }

    try {
      setLoading(true)

      if (editData) {
        await updateJadwal(editData.id, {
          id_bagian_paramedic: selectedBagian.id_bagian_paramedic,
          tanggal: dates[0],
          peran: peran || undefined,
          tipe_jaga: tipeJaga || undefined,
          keterangan: keterangan || null,
        })
        setToast({ message: "Jadwal berhasil diupdate", type: "success" })
      } else {
        let successCount = 0
        for (const date of dates) {
          await createJadwal({
            id_bagian_paramedic: selectedBagian.id_bagian_paramedic,
            tanggal: date,
            peran: peran || undefined,
            tipe_jaga: tipeJaga || undefined,
            keterangan: keterangan || null,
          })
          successCount++
        }
        setToast({ message: `${successCount} jadwal berhasil ditambahkan`, type: "success" })
      }

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 500)
    } catch (err: any) {
      console.error(err)
      // Ambil pesan dari response server (Laravel)
      let message = "Gagal menyimpan data"
      if (err?.response?.data?.message) {
        message = err.response.data.message
      } else if (err?.response?.data?.errors) {
        // Format error validasi
        const errors = Object.values(err.response.data.errors).flat()
        message = errors.join(". ")
      } else if (err?.message) {
        message = err.message
      }
      setToast({ message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const toggleRange = () => {
    setIsRange(!isRange)
    if (!isRange) {
      setTanggal("")
    } else {
      setTanggalMulai("")
      setTanggalSelesai("")
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold">
          {editData ? "Edit Jadwal" : "Tambah Jadwal"}
        </h2>

        {/* posisi */}
        <div ref={posisiRef} className="relative">
          <label className="block text-base font-semibold mb-1">Posisi</label>
          <input
            value={searchposisi}
            onFocus={() => setOpenposisi(true)}
            onChange={e => { setSearchposisi(e.target.value); setOpenposisi(true) }}
            placeholder="Cari posisi..."
            className="w-full border rounded-lg px-4 py-3 text-base placeholder-gray-400"
          />
          {openposisi && (
            <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow">
              {filteredposisi.length > 0 ? (
                filteredposisi.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setposisiId(s.id)
                      setSearchposisi(s.nama_posisi)
                      setOpenposisi(false)
                      setParamedicId("")
                      setSearchParamedic("")
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {s.nama_posisi}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">Tidak ada hasil</div>
              )}
            </div>
          )}
        </div>

        {/* PARAMEDIC */}
        <div ref={paramedicRef} className="relative">
          <label className="block text-base font-semibold mb-1">Paramedic</label>
          <input
            value={searchParamedic}
            onFocus={() => setOpenParamedic(true)}
            onChange={e => { setSearchParamedic(e.target.value); setOpenParamedic(true) }}
            placeholder="Cari paramedic..."
            className="w-full border rounded-lg px-4 py-3 text-base placeholder-gray-400"
            disabled={!posisiId}
          />
          {openParamedic && (
            <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow">
              {posisiId ? (
                filteredParamedicSearch.length > 0 ? (
                  filteredParamedicSearch.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setParamedicId(p.id)
                        setSearchParamedic(p.nama_paramedic)
                        setOpenParamedic(false)
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {p.nama_paramedic}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    {filteredParamedics.length === 0
                      ? "Tidak ada paramedic untuk posisi ini"
                      : "Tidak ada hasil pencarian"}
                  </div>
                )
              ) : (
                <div className="px-3 py-2 text-gray-500">Pilih posisi terlebih dahulu</div>
              )}
            </div>
          )}
        </div>

        {/* PERAN */}
        <div>
          <label className="block text-sm font-medium mb-1">Peran</label>
          <select
            value={peran}
            onChange={e => setPeran(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base"
          >
            <option value="-">-</option>
            <option value="Utama">Utama</option>
            <option value="Backup 1">Backup 1</option>
            <option value="Backup 2">Backup 2</option>
            <option value="Backup 3">Backup 3</option>
          </select>
        </div>

        {/* TIPE JAGA */}
        <div>
          <label className="block text-base font-semibold mb-1">Tipe Jaga</label>
          <select
            value={tipeJaga}
            onChange={e => setTipeJaga(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base"
          >
            <option value="-">-</option>
            <option value="Oncall">Oncall</option>
            <option value="Onsite Pagi">Onsite Pagi</option>
            <option value="Onsite Malam">Onsite Malam</option>
          </select>
        </div>

        {/* KETERANGAN */}
        <div>
          <label className="block text-base font-semibold mb-1">Keterangan</label>
          <input
            type="text"
            value={keterangan}
            onChange={e => setKeterangan(e.target.value)}
            placeholder="Tambahan keterangan..."
            className="w-full border rounded-lg px-4 py-3 text-base"
          />
        </div>

        {/* TANGGAL */}
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          {editData ? (
            <input
              type="date"
              value={tanggal}
              onChange={e => setTanggal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isRange}
                  onChange={toggleRange}
                  id="rangeMode"
                />
                <label htmlFor="rangeMode" className="text-sm">
                  Gunakan rentang tanggal
                </label>
              </div>

              {isRange ? (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={e => setTanggalMulai(e.target.value)}
                    className="w-1/2 border rounded-lg px-3 py-2"
                    placeholder="Mulai"
                  />
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={e => setTanggalSelesai(e.target.value)}
                    className="w-1/2 border rounded-lg px-3 py-2"
                    placeholder="Selesai"
                  />
                </div>
              ) : (
                <input
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              )}
            </>
          )}
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white rounded-lg bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>,
    document.body
  )
}