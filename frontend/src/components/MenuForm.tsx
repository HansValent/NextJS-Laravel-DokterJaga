"use client"

import { useState, useEffect } from "react"
import { getMenus, MenuItem } from "@/services/menuService"

type Props = {
  onSubmit: (data: any) => void
  initialData?: any
}

export default function MenuForm({ onSubmit, initialData }: Props) {
  const [name, setName] = useState(initialData?.name || "")
  const [icon, setIcon] = useState(initialData?.icon || "")
  const [url, setUrl] = useState(initialData?.url || "")
  const [parentId, setParentId] = useState<number | "">(initialData?.parent_id || "")
  const [permission, setPermission] = useState(initialData?.permission || "")
  const [order, setOrder] = useState(initialData?.order || 0)
  const [menus, setMenus] = useState<MenuItem[]>([])

  useEffect(() => {
    getMenus().then(setMenus)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      icon,
      url,
      parent_id: parentId || null,
      permission,
      order,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label>Nama</label>
        <input className="w-full border p-2" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Icon (emoji)</label>
        <input className="w-full border p-2" value={icon} onChange={e => setIcon(e.target.value)} />
      </div>
      <div>
        <label>URL</label>
        <input className="w-full border p-2" value={url} onChange={e => setUrl(e.target.value)} />
      </div>
      <div>
        <label>Parent</label>
        <select className="w-full border p-2" value={parentId} onChange={e => setParentId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">Root</option>
          {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div>
        <label>Permission (pisahkan dengan koma)</label>
        <input className="w-full border p-2" value={permission} onChange={e => setPermission(e.target.value)} />
      </div>
      <div>
        <label>Urutan</label>
        <input type="number" className="w-full border p-2" value={order} onChange={e => setOrder(Number(e.target.value))} />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
    </form>
  )
}