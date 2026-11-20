"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import {
  createParamedic,
  updateParamedic,
} from "@/services/jadwalService"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: {
    id?: number
    nama_paramedic?: string
    npk?: string
    jenis_paramedic?: string
  } | null
}

export default function ParamedicFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: Props) {
  const isEdit = !!editData?.id

  const [mounted, setMounted] = useState(false)

  const [nama, setNama] = useState("")
  const [npk, setNpk] = useState("")
  const [jenis, setJenis] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= INIT ================= */
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (editData) {
      setNama(editData.nama_paramedic || "")
      setNpk(editData.npk || "")
      setJenis(editData.jenis_paramedic || "")
    } else {
      setNama("")
      setNpk("")
      setJenis("")
    }
  }, [editData])

  useEffect(() => {
    if (!isOpen) {
      setNama("")
      setNpk("")
      setJenis("")
    }
  }, [isOpen])

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!nama.trim()) {
      alert("Nama paramedic wajib diisi")
      return
    }

    try {
      setLoading(true)

      if (isEdit && editData?.id) {
        await updateParamedic(editData.id, {
          nama_paramedic: nama,
          npk: npk,
          jenis_paramedic: jenis,
        })
      } else {
        await createParamedic({
          nama_paramedic: nama,
          npk: npk,
          jenis_paramedic: jenis,
        })
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      alert("Gagal menyimpan data")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* MODAL BOX */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          {/* HEADER */}
          <h2 className="text-xl font-bold">
            {isEdit ? "Ubah Data Karyawan" : "Tambah Karyawan"}
          </h2>

          {/* NAMA */}
          <div>
            <label className="text-sm font-medium">
              Nama Paramedic
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
              autoFocus
            />
          </div>

          {/* NPK */}
          <div>
            <label className="text-sm font-medium">NPK</label>
            <input
              type="text"
              value={npk}
              onChange={(e) => setNpk(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* JENIS */}
          <div>
            <label className="text-sm font-medium">
              Jenis Paramedic
            </label>
            <input
              type="text"
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-2 pt-3">
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
              className="px-4 py-2 text-white rounded-lg bg-green-600"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
