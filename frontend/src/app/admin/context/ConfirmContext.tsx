"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import ConfirmDialog, { ConfirmOptions } from "@/components/ConfirmDialog"

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false))

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    resolvePromise?.(true)
    setIsOpen(false)
    setOptions(null)
  }

  const handleCancel = () => {
    resolvePromise?.(false)
    setIsOpen(false)
    setOptions(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          isOpen={isOpen}
          options={options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)