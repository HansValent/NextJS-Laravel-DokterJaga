"use client"

import { useEffect, useState } from "react"
import {
  getRoles,
  deleteRoles,
} from "@/services/usersService"

import type { Role } from "@/lib/type"
import { useAuth } from "../../context/AuthContext"
import RolesTable from "./Table"
import RolesFormModal from "@/components/users/roles/RolesFormModal"
import RolePermissionModal from "@/components/users/roles/RolesPermissionFormModal"

export default function PickupRole() {

  // ======================
  // STATE
  // ======================
  const { hasPermission } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [filtered, setFiltered] = useState<Role[]>([])
  const [search, setSearch] = useState("")

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [permissionRole, setPermissionRole] = useState<Role | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // ======================
  // FETCH DATA
  // ======================
  const fetchData = async () => {
    try {
      setLoading(true)

      const res = await getRoles()

      const data = res?.data || []
      setRoles(data)
      setFiltered(data)

    } catch (err) {
      console.error("FETCH ERROR:", err)
      alert("Gagal mengambil data role")
    } finally {
      setLoading(false)
    }
  }

  // ======================
  // INIT LOAD
  // ======================
  useEffect(() => {
    fetchData()
  }, [])

  // ======================
  // SEARCH FILTER
  // ======================
  useEffect(() => {
    const keyword = search.toLowerCase()

    const result = roles.filter((r) =>
      r.role_name.toLowerCase().includes(keyword)
    )

    setFiltered(result)
  }, [search, roles])

  // ======================
  // HANDLERS
  // ======================

  // 🔥 CREATE
  const handleCreate = () => {
    setSelectedRole({
      id_role: 0,
      role_name: "",
    })
    setShowModal(true)
  }

  // ✏️ EDIT
  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setShowModal(true)
  }

  // 🗑 DELETE
  const handleDelete = async (role: Role) => {
    const confirmDelete = confirm(
      `Yakin hapus role?\n\nRole: ${role.role_name}`
    )

    if (!confirmDelete) return

    try {
      setLoading(true)

      await deleteRoles(role.id_role)

      await fetchData()

    } catch (err) {
      console.error("DELETE ERROR:", err)
      alert("Gagal menghapus role")
    } finally {
      setLoading(false)
    }
  }

  // 🔐 MANAGE PERMISSION
  const handleManagePermission = (role: Role) => {
    setPermissionRole(role)
  }

  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            Manajemen Role
          </h1>
          <p className="text-gray-500">
            {roles.length} Role Terdaftar
          </p>
        </div>

        {hasPermission("role.create") && (
        <button
          onClick={handleCreate}
          className="px-4 py-2 text-white rounded-lg shadow"
          style={{
            background:
              "linear-gradient(to right, #006838, #8DC63F)",
          }}
        >
          + Tambah Role
        </button>
        )}

      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Cari role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-80 border rounded-lg px-3 py-2"
      />

      {/* TABLE */}
      <RolesTable
        data={filtered}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={fetchData}
        onEdit={handleEdit}
        onManagePermission={handleManagePermission}
      />

      {/* MODAL CREATE / EDIT */}
      {showModal && selectedRole && (
        <RolesFormModal
          mode={selectedRole.id_role === 0 ? "create" : "edit"}
          role={selectedRole}
          onClose={() => {
            setShowModal(false)
            setSelectedRole(null)
          }}
          onSuccess={async () => {
            await fetchData()
            setShowModal(false)
            setSelectedRole(null)
          }}
        />
      )}

      {/* MODAL PERMISSION */}
      {permissionRole && (
        <RolePermissionModal
          roleId={permissionRole.id_role}
          roleName={permissionRole.role_name}
          onClose={() => setPermissionRole(null)}
        />
      )}

    </div>
  )
}
