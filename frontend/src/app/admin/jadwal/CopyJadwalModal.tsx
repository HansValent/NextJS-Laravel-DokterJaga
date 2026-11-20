"use client"

import React from "react"

type CopyMode = "week" | "day"

type Props = {
  isOpen: boolean
  onClose: () => void
  mode: CopyMode
  setMode: (mode: CopyMode) => void
  sourceStart: string
  setSourceStart: (val: string) => void
  sourceEnd: string
  setSourceEnd: (val: string) => void
  targetStart: string
  setTargetStart: (val: string) => void
  singleSourceDate: string
  setSingleSourceDate: (val: string) => void
  singleTargetDate: string
  setSingleTargetDate: (val: string) => void
  onSubmitWeek: () => void
  onSubmitDay: () => void
  loading: boolean
}

export default function CopyJadwalModal({
  isOpen,
  onClose,
  mode,
  setMode,
  sourceStart,
  setSourceStart,
  sourceEnd,
  setSourceEnd,
  targetStart,
  setTargetStart,
  singleSourceDate,
  setSingleSourceDate,
  singleTargetDate,
  setSingleTargetDate,
  onSubmitWeek,
  onSubmitDay,
  loading,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold">Salin Jadwal</h2>

        {/* Pilihan mode */}
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2 rounded-lg font-medium ${mode === "week" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setMode("week")}
          >
            Rentang Tanggal
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium ${mode === "day" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setMode("day")}
          >
            Satu Hari
          </button>
        </div>

        {mode === "week" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Sumber (Rentang)</label>
              <div className="flex gap-2">
                <input type="date" value={sourceStart} onChange={e => setSourceStart(e.target.value)} className="w-1/2 border rounded-lg px-3 py-2" />
                <input type="date" value={sourceEnd} onChange={e => setSourceEnd(e.target.value)} className="w-1/2 border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Mulai</label>
              <input type="date" value={targetStart} onChange={e => setTargetStart(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <button
              onClick={onSubmitWeek}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Menyalin...' : 'Salin Rentang'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Sumber</label>
              <input type="date" value={singleSourceDate} onChange={e => setSingleSourceDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Target</label>
              <input type="date" value={singleTargetDate} onChange={e => setSingleTargetDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <button
              onClick={onSubmitDay}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Menyalin...' : 'Salin Hari'}
            </button>
          </div>
        )}

        <button onClick={onClose} className="w-full py-2 bg-gray-200 rounded-lg mt-2">
          Batal
        </button>
      </div>
    </div>
  )
}