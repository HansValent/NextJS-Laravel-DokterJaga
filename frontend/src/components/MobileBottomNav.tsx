// components/MobileBottomNav.tsx
// Komponen ini HANYA tampil di mobile (≤768px) via CSS .dj-mob-nav
// Tidak mempengaruhi layout desktop sama sekali.
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  {
    label: "Jadwal",
    href: "/admin",
    matchPaths: ["/admin", "/admin"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Penanggung Jawab",
    href: "/admin/penanggungjawab",
    matchPaths: ["/admin/penanggungjawab"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: "Paramedic",
    href: "/admin/paramedic",
    matchPaths: ["/admin/paramedic"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: "posisi",
    href: "/admin/posisi",
    matchPaths: ["/admin/posisi"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/admin/profile",
    matchPaths: ["/admin/profile"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="dj-mob-nav" aria-label="Navigasi mobile">
      {NAV_ITEMS.map((item) => {
        const isActive = item.matchPaths.some(p =>
          p === "/admin" ? pathname === "/admin" : pathname.startsWith(p)
        )
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`dj-mob-nav-item${isActive ? " active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}