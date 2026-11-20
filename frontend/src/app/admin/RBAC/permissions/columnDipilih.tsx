"use client"

import { Permission } from "@/lib/type"

type Props = {
  data: Permission[]
  onRemove: (p: Permission) => void
  canDelete?: boolean
}

export default function ColumnDipilih({ data, onRemove, canDelete = true }: Props) {
  return (
    <div className="space-y-2">
      {data.map((p) => (
        <div
          key={p.id_permission}
          className="flex justify-between items-center px-2 py-1 border rounded"
        >
          <span>{p.permission_name}</span>
          <button
            onClick={() => onRemove(p)}
            className="text-red-500"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
