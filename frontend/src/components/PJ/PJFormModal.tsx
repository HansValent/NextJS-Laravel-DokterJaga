"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import {
  createPJ,
  updatePJ,
  getParamedicAdmin,
  type Paramedic,
} from "@/services/jadwalService"

import type {
  PenanggungJawab,
  CreatePJPayload,
} from "@/lib/type"

type Props = {
  open: boolean
  mode: "create" | "edit"
  data?: PenanggungJawab | null
  onClose: () => void
}

export default function PJFormModal({
  open,
  mode,
  data,
  onClose,
}: Props) {

  // ======================
  // STATE
  // ======================
  const [mounted, setMounted] = useState(false)

  const [tanggal, setTanggal] = useState("")
  const [idPerawat, setIdPerawat] = useState<number | "">("")
  const [idKepala, setIdKepala] = useState<number | "">("")
  const [idPonek, setIdPonek] = useState<number | "">("")

  const [paramedics, setParamedics] = useState<Paramedic[]>([])
  const [loading, setLoading] = useState(false)

  // ======================
  // INIT
  // ======================
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mode === "edit" && data) {
      setTanggal(data.tanggal)
      setIdPerawat(data.id_perawat ?? "")
      setIdKepala(data.id_kepala_jaga ?? "")
      setIdPonek(data.id_ponek ?? "")
    } else {
      resetForm()
    }
  }, [mode, data])

  // ======================
  // LOAD PARAMEDIC
  // ======================
  useEffect(() => {
    if (!open) return

    getParamedicAdmin()
      .then(setParamedics)
      .catch(console.error)
  }, [open])

  // ======================
  // ESC CLOSE
  // ======================
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // ======================
  // RESET
  // ======================
  const resetForm = () => {
    const today = new Date().toISOString().slice(0, 10)
    setTanggal(today)
    setIdPerawat("")
    setIdKepala("")
    setIdPonek("")
  }

  // ======================
  // FILTER PERAWAT (DROPDOWN KHUSUS)
  // ======================
  const perawatOptions = useMemo(() => {
    // Ambil semua paramedic berjenis perawat (case-insensitive)
    const filtered = paramedics.filter(
      p => p.jenis_paramedic?.toLowerCase() === 'perawat'
    )
    // Jika ada idPerawat yang terpilih namun tidak termasuk dalam filtered
    // (misal saat edit data lama yang jenisnya mungkin sudah berubah), 
    // tambahkan secara manual agar tetap muncul sebagai opsi.
    if (idPerawat && !filtered.find(p => p.id === idPerawat)) {
      const fallback = paramedics.find(p => p.id === idPerawat)
      if (fallback) filtered.push(fallback)
    }
    return filtered
  }, [paramedics, idPerawat])

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async () => {
    if (!tanggal) {
      alert("Tanggal wajib diisi")
      return
    }
    if (!idPerawat) {
      alert("Perawat wajib dipilih")
      return
    }

    const payload: CreatePJPayload = {
      tanggal,
      id_perawat: idPerawat || null,
      id_kepala_jaga: idKepala || null,
      id_ponek: idPonek || null,
    }

    try {
      setLoading(true)

      if (mode === "create") {
        await createPJ(payload)
      } else if (mode === "edit" && data) {
        await updatePJ(data.id, payload)
      }

      onClose()
      resetForm()

    } catch (err: any) {
      console.error("ERROR:", err)
      // Tampilkan pesan error dari response server jika ada
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menyimpan data"
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  // ======================
  // GUARD
  // ======================
  if (!open || !mounted) return null

  // ======================
  // RENDER
  // ======================
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      {/* MODAL BOX */}
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold">
            {mode === "create" ? "Tambah PJ" : "Edit PJ"}
          </h2>

          {mode === "edit" && data && (
            <p className="text-gray-500 text-sm">
              ID: {data.id}
            </p>
          )}
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* TANGGAL */}
          <div>
            <label className="text-sm font-medium">Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* PERAWAT (filter khusus perawat) */}
          <SelectParamedic
            label="Perawat"
            value={idPerawat}
            onChange={setIdPerawat}
            data={perawatOptions}
          />

          {/* KEPALA JAGA (semua paramedic) */}
          <SelectParamedic
            label="Kepala Jaga"
            value={idKepala}
            onChange={setIdKepala}
            data={paramedics}
          />

          {/* PONEK (semua paramedic) */}
          <SelectParamedic
            label="Ponek"
            value={idPonek}
            onChange={setIdPonek}
            data={paramedics}
          />

        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-white rounded-lg"
            style={{
              background:
                "linear-gradient(to right, #2563eb, #60a5fa)",
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

/* =========================
   🔧 REUSABLE SELECT
========================= */
function SelectParamedic({
  label,
  value,
  onChange,
  data,
}: {
  label: string
  value: number | ""
  onChange: (val: number | "") => void
  data: Paramedic[]
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : "")
        }
        className="w-full border rounded-lg px-3 py-2 mt-1"
      >
        <option value="">-- Pilih --</option>
        {data.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nama_paramedic}
          </option>
        ))}
      </select>
    </div>
  )
}