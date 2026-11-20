"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/Sidebar"
import { useRouter } from "next/navigation"
import { AuthProvider } from "./context/AuthContext"
import { ConfirmProvider } from "./context/ConfirmContext"
import dynamic from "next/dynamic"

import "../styles/adminResponsive.css"
import MobileBottomNav from "@/components/MobileBottomNav"

const Header = dynamic(() => import("@/components/Header"), { ssr: false })

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      const timeout = setTimeout(() => {
        const reCheckToken = localStorage.getItem("token");
        if (!reCheckToken) {
          router.replace("/login");
        } else {
          setToken(reCheckToken);
          setLoading(false);
        }
      }, 300);
    return () => clearTimeout(timeout);
    } else {
      setToken(storedToken);
      setLoading(false);
    }
  }, [router])

  if (loading) {
    return <div>Checking authentication...</div>
  }

  return (
    <AuthProvider key={token}>
      <ConfirmProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="main-content p-4 relative">
            {children}
          </div>
        </div>
      </div>
       <MobileBottomNav />
      </ConfirmProvider>
    </AuthProvider>
  )
}