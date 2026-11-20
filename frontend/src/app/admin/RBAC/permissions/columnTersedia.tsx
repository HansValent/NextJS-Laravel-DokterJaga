"use client"

import { Permission } from "@/lib/type"

type Props = {
  data: Permission[]
  onSelect: (p: Permission) => void
  onEdit: (p: Permission) => void
  onRemove: (p: Permission) => void
  canEdit?: boolean
  canDelete?: boolean
  /** fungsi untuk menentukan apakah item bisa dipindahkan ke Dipilih (default true) */
  canSelect?: (p: Permission) => boolean
}

export default function ColumnTersedia({
  data,
  onSelect,
  onEdit,
  onRemove,
  canEdit = true,
  canDelete = true,
  canSelect,
}: Props) {
  return (
    <div className="space-y-2">
      {data.map((p) => {
        const showAdd = canSelect ? canSelect(p) : true
        return (
          <div
            key={p.id_permission}
            className="flex justify-between items-center px-2 py-1 border rounded"
          >
            <span
              onClick={() => onEdit(p)}
              className="cursor-pointer"
            >
              {p.permission_name}
            </span>

            <div className="flex gap-2">
              {showAdd && (
                <button onClick={() => onSelect(p)}>+</button>
              )}
              <button
                onClick={() => onRemove(p)}
                className="text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}