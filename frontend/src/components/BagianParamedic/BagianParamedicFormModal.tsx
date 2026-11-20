"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  createBagianParamedic,
  updateBagianParamedic,
  getParamedic,
  getposisi,
  Paramedic,
  BagianParamedicView,
} from "@/services/jadwalService"

import { Posisi } from "@/lib/type"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: BagianParamedicView | null
  selectedposisi: number | null
}

export default function BagianParamedicFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  selectedposisi,
}: Props) {
  const [mounted, setMounted] = useState(false)

  const [paramedicList, setParamedicList] = useState<Paramedic[]>([])
  const [posisiList, setposisiList] = useState<Posisi[]>([])

  const [paramedicId, setParamedicId] = useState<number | "">("")
  const [posisiId, setposisiId] = useState<number | "">("")

  const [loading, setLoading] = useState(false)
  const [loadingMaster, setLoadingMaster] = useState(false)

  /* ================= INIT ================= */
  useEffect(() => setMounted(true), [])

  /* ================= LOAD MASTER ================= */
  useEffect(() => {
    if (!isOpen) return

    const loadMaster = async () => {
      try {
        setLoadingMaster(true)

        const [p, s] = await Promise.all([
          getParamedic(),
          getposisi(),
        ])

        setParamedicList(p)
        setposisiList(s)

      } catch (err) {
        console.error(err)
        alert("Gagal load master data")
      } finally {
        setLoadingMaster(false)
      }
    }

    loadMaster()
  }, [isOpen])

  /* ================= HANDLE EDIT / CREATE ================= */
  useEffect(() => {
    if (!isOpen) return

    if (editData) {
      setParamedicId(editData.paramedic_id ?? "")
      setposisiId(editData.posisi_id ?? "")
    } else {
      setParamedicId("")
      setposisiId(selectedposisi ?? "")
    }
  }, [editData, selectedposisi, isOpen])

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!paramedicId || !posisiId) {
      alert("Semua field wajib diisi")
      return
    }

    try {
      setLoading(true)

      if (editData) {
        await updateBagianParamedic(editData.id, {
          id_paramedic: Number(paramedicId),
          id_posisi: Number(posisiId),
        })
      } else {
        await createBagianParamedic({
          id_paramedic: Number(paramedicId),
          id_posisi: Number(posisiId),
        })
      }

      onSuccess()
      onClose()

    } catch (err) {
      console.error(err)
      alert("Gagal simpan data")
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
      {/* MODAL BOX */}
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* TITLE */}
        <h2 className="text-lg font-semibold">
          {editData ? "Edit Mapping Karyawan" : "Tambah Mapping Karyawan"}
        </h2>

        {/* CONTENT */}
        {loadingMaster ? (
          <p className="text-sm text-gray-500">Loading data...</p>
        ) : (
          <div className="space-y-4">

            {/* posisi */}
            <div>
              <label className="text-sm">Posisi</label>
              <select
                value={posisiId}
                onChange={(e) =>
                  setposisiId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Pilih posisi</option>
                {posisiList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_posisi}
                  </option>
                ))}
              </select>
            </div>

            {/* PARAMEDIC */}
            <div>
              <label className="text-sm">Paramedic</label>
              <select
                value={paramedicId}
                onChange={(e) =>
                  setParamedicId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Pilih Paramedic</option>
                {paramedicList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_paramedic}
                  </option>
                ))}
              </select>
            </div>

          </div>
        )}

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || loadingMaster}
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
