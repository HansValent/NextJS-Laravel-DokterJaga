"use client"

import { useEffect, useState } from "react"
import { getMenus, deleteMenu, MenuItem } from "@/services/menuService"
import Link from "next/link"
import { useAuth } from "@/app/admin/context/AuthContext"

export default function MenuList() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const { hasPermission } = useAuth()

  useEffect(() => {
    getMenus().then(setMenus)
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Hapus menu ini? Semua sub‑menu juga akan terhapus.")) {
      await deleteMenu(id)
      setMenus(prev => prev.filter(m => m.id !== id))
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Render baris tabel secara rekursif dengan tombol toggle
  const renderRows = (items: MenuItem[], level = 0, parentId: number | null = null): React.ReactNode[] => {
    return items.flatMap(item => {
      const hasChildren = Array.isArray(item.children) && item.children.length > 0
      const isExpanded = expandedIds.has(item.id)
      const canToggle = hasChildren

      const row = (
        <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
          {/* Nama Menu */}
          <td
            className="py-3 px-4 font-medium flex items-center gap-2"
            style={{ paddingLeft: `${level * 24 + 16}px` }}
          >
            {canToggle ? (
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-gray-500 hover:text-gray-800 w-5 h-5 flex items-center justify-center"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "▼" : "▶"}
              </button>
            ) : (
              <span className="w-5 h-5 inline-block" />
            )}
            <span className="text-gray-500">{item.icon}</span>
            <span>{item.name}</span>
          </td>

          {/* URL */}
          <td className="py-3 px-4 text-gray-600 text-sm">
            {item.url || <span className="text-gray-400">-</span>}
          </td>

          {/* Permission */}
          <td className="py-3 px-4">
            {item.permission ? (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                {item.permission}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </td>

          {/* Aksi */}
          <td className="py-3 px-4 text-right">
            {hasPermission("menu.manage") && (
              <div className="flex items-center gap-2 justify-end">
                <Link
                  href={`/admin/menus/${item.id}/edit`}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  ✏️
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
            )}
          </td>
        </tr>
      )

      // Jika punya anak dan sedang expanded, render anak di bawahnya
      const childrenRows = hasChildren && isExpanded
        ? renderRows(item.children!, level + 1, item.id)
        : []

      return [row, ...childrenRows]
    })
  }

  return (
    <div className="p-4">
      {/* Header & Tombol Tambah */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Kelola Menu</h1>
        {hasPermission("menu.manage") && (
          <Link
            href="/admin/menus/create"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-sm"
          >
            + Tambah Menu
          </Link>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-600 border-b">
              <th className="py-3 px-4">Nama Menu</th>
              <th className="py-3 px-4">URL</th>
              <th className="py-3 px-4">Permission</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {menus.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  Belum ada menu. Klik “Tambah Menu” untuk memulai.
                </td>
              </tr>
            ) : (
              renderRows(menus)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}