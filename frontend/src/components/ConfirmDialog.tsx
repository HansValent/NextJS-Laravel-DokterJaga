"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

export type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

type Props = {
  isOpen: boolean
  options: ConfirmOptions
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    if (isOpen) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onCancel])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 animate-in slide-in-from-bottom-10 duration-200"
      >
        <h2 className="text-lg font-semibold">
          {options.title || "Konfirmasi"}
        </h2>

        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {options.message}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-lg text-sm"
          >
            {options.cancelText || "Batal"}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm text-white ${
              options.danger !== false
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {options.confirmText || "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}