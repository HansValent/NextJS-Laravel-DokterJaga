"use client"

import type { Role } from "@/lib/type"
import {
  Pencil,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

type Props = {
  data: Role[]
  loading: boolean
  onDelete: (role: Role) => void
  onRefresh: () => void
  onEdit: (role: Role) => void
  onManagePermission: (role: Role) => void
}

export default function RolesTable({
  data,
  loading,
  onDelete,
  onRefresh,
  onEdit,
  onManagePermission,
}: Props) {
  const { hasPermission } = useAuth()
  
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      
      {/* HEADER TABLE */}

      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Nama Role</th>
            <th className="p-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={2} className="text-center p-4">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center p-4">
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((role) => (
              <tr key={role.id_role} className="border-t">
                <td className="p-3">{role.role_name}</td>

                <td className="p-3">
                  <div className="flex justify-center gap-2 text-center">

                    {/* 🔐 Kelola Permission */}
                    {hasPermission("role_permission.update") && (
                    <button
                      onClick={() => onManagePermission(role)}
                      className="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                      title="Kelola Permission"
                    >
                      <ShieldCheck size={14} />
                    </button>
                    )}

                    {/* ✏️ Edit */}
                    {hasPermission("role.update") && (
                    <button
                      onClick={() => onEdit(role)}
                      className="p-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                      title="Ubah Role"
                    >
                      <Pencil size={14} />
                    </button>
                    )}

                    {/* 🗑 Delete */}
                    {hasPermission("role.delete") && (
                    <button
                      onClick={() => onDelete(role)}
                      className="p-2 rounded bg-red-500 hover:bg-red-600 text-white"
                      title="Hapus Role"
                    >
                      <Trash2 size={14} />
                    </button>
                    )}

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
