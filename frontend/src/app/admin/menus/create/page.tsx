"use client"

import { useRouter } from "next/navigation"
import { createMenu } from "@/services/menuService"
import MenuForm from "@/components/MenuForm"

export default function CreateMenu() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    await createMenu(data)
    router.push("/admin/menus")
  }

  return <div className="p-4"><h1 className="text-xl font-bold mb-4">Tambah Menu</h1><MenuForm onSubmit={handleSubmit} /></div>
}