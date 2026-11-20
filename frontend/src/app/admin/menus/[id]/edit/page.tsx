// app/admin/menus/[id]/edit/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getMenus, updateMenu } from "@/services/menuService"
import MenuForm from "@/components/MenuForm"

export default function EditMenu() {
  const router = useRouter()
  const params = useParams()
  const [initialData, setInitialData] = useState<any>(null)

  useEffect(() => {
    getMenus().then(menus => {
      // Cari menu berdasarkan id dari tree (rekursif)
      const find = (items: any[]): any => {
        for (const item of items) {
          if (item.id === Number(params.id)) return item
          if (item.children) {
            const found = find(item.children)
            if (found) return found
          }
        }
        return null
      }
      setInitialData(find(menus))
    })
  }, [params.id])

  const handleSubmit = async (data: any) => {
    await updateMenu(Number(params.id), data)
    router.push("/admin/menus")
  }

  if (!initialData) return <div>Loading...</div>

  return <div className="p-4"><h1 className="text-xl font-bold mb-4">Edit Menu</h1><MenuForm onSubmit={handleSubmit} initialData={initialData} /></div>
}