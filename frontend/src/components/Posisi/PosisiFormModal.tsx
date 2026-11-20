"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  createposisi,
  updateposisi,
  getKategoriPosisi,
} from "@/services/jadwalService"

import type { Kategori } from "@/lib/type"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: {
    id?: number
    nama_posisi?: string
    kategori_id?: number | null
  } | null
}

export default function PosisiFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [nama, setNama] = useState("")
  const [kategoriId, setKategoriId] = useState<number | null>(null)

  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingKategori, setLoadingKategori] = useState(false)

  const isEdit = !!editData?.id

  /* ================= INIT ================= */
  useEffect(() => setMounted(true), [])

  /* ================= FETCH KATEGORI ================= */
  useEffect(() => {
    if (!isOpen) return

    const fetchKategori = async () => {
      try {
        setLoadingKategori(true)
        const data = await getKategoriPosisi()
        setKategoriList(data)
      } catch (err) {
        console.error("Gagal load kategori:", err)
        setKategoriList([])
      } finally {
        setLoadingKategori(false)
      }
    }

    fetchKategori()
  }, [isOpen])

  /* ================= SET EDIT DATA ================= */
  useEffect(() => {
    if (editData) {
      setNama(editData.nama_posisi || "")
      setKategoriId(editData.kategori_id ?? null)
    } else {
      setNama("")
      setKategoriId(null)
    }
  }, [editData])

  /* ================= RESET SAAT CLOSE ================= */
  useEffect(() => {
    if (!isOpen) {
      setNama("")
      setKategoriId(null)
      setLoading(false)
    }
  }, [isOpen])

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!nama.trim()) {
      alert("Nama posisi wajib diisi")
      return
    }

    try {
      setLoading(true)

      const payload = {
        nama_posisi: nama.trim(),
        kategori_id: kategoriId ?? null,
      }

      console.log("📦 SUBMIT posisi:", payload)

      if (isEdit && editData?.id) {
        await updateposisi(editData.id, payload)
      } else {
        await createposisi(payload)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("❌ Submit error:", err)
      alert(err.message || "Gagal menyimpan data")
    } finally {
      setLoading(false)
    }
  }

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <h2 className="text-lg font-semibold">
          {isEdit ? "Ubah posisi" : "Tambah posisi"}
        </h2>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >

          {/* NAMA */}
          <div>
            <label className="text-sm text-gray-600">
              Nama Posisi
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Contoh: Dokter Umum"
              autoFocus
            />
          </div>

          {/* KATEGORI */}
          <div>
            <label className="text-sm text-gray-600">
              Kategori
            </label>

            <select
              value={kategoriId ?? ""}
              onChange={(e) =>
                setKategoriId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full border rounded-lg px-3 py-2 mt-1"
              disabled={loadingKategori}
            >
              <option value="">
                {loadingKategori
                  ? "Memuat kategori..."
                  : "Tanpa Kategori"}
              </option>

              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-2 pt-2">
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
        </form>
      </div>
    </div>,
    document.body
  )
}
