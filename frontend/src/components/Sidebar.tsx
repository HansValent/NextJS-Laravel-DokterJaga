"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getMyMenus, MenuItem } from "@/services/menuService"
import { useAuth } from "@/app/admin/context/AuthContext"

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const { hasPermission } = useAuth()

  useEffect(() => {
    getMyMenus()
      .then(setMenuItems)
      .catch(err => console.error("Failed to load menus", err))
  }, [])

  const toggleMenu = (key: string) => {
    setOpenMenu(openMenu === key ? null : key)
  }

  // Rekursif render
    const renderMenuItem = (item: MenuItem, level = 0) => {
      if (item.permission && !hasPermission(item.permission)) {
        return null;
      }
    const hasChildren = item.children && item.children.length > 0
    const isActive = pathname === item.url

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <div
              className="cursor-pointer select-none px-2 py-1 rounded hover:bg-gray-100 flex justify-between items-center"
              onClick={() => toggleMenu(item.id.toString())}
            >
              <span>{item.icon} {item.name}</span>
              <span className="text-xs">
                {openMenu === item.id.toString() ? "▲" : "▼"}
              </span>
            </div>
            {openMenu === item.id.toString() && (
              <ul className="ml-4 mt-1">
                {item.children!.map(child => renderMenuItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : item.url ? (
          <Link
            href={item.url}
            className={`block px-2 py-1 rounded ${
              isActive ? "active" : "hover:bg-gray-100"
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ) : null}
      </li>
    )
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <strong>St. Carolus</strong>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map(item => renderMenuItem(item))}
      </ul>
    </div>
  )
}