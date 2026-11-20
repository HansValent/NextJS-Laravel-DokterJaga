"use client"

import { useEffect, useState } from "react"
import {
  getUsers,
  deleteUser,
  getRoles,
  getStatusLabel,
  getStatusColor,
} from "@/services/usersService"
import type { User, Role } from "@/lib/type"
import { useAuth } from "@/app/admin/context/AuthContext"
import UserRoleFormModal from "@/components/users/UsersRoleFormModal"
import UsersFormModal from "@/components/users/UsersFormModal"

export default function UsersPage() {
  const { user: loggedInUser, hasPermission, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)

  // Fetch data hanya jika user memiliki akses baca user
  useEffect(() => {
    if (authLoading) return

    if (!hasPermission("user.read")) {
      setAccessDenied(true)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const userRes = await getUsers()
        const usersData = userRes?.data ?? []
        setUsers(usersData)
        setFiltered(usersData)

        if (hasPermission("role.read")) {
          const roleRes = await getRoles()
          setRoles(roleRes?.data ?? [])
        }
      } catch (err: any) {
        console.error("FETCH ERROR:", err)
        if (err.message === "Forbidden") {
          setAccessDenied(true)
        } else {
          alert("Gagal mengambil data: " + err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authLoading, hasPermission])

  // Search filter
  useEffect(() => {
    const keyword = search.toLowerCase()
    setFiltered(
      users.filter((u) =>
        (u.username ?? "").toLowerCase().includes(keyword) ||
        (u.npk ?? "").toLowerCase().includes(keyword)
      )
    )
  }, [search, users])

  // Handle delete
  const handleDelete = async (user: User) => {
    const roleList = user.roles?.map((r) => r.role_name).join(", ") || "-"
    if (!confirm(`Yakin hapus user?\n\nNPK      : ${user.npk || "-"}\nUsername : ${user.username}\nRole     : ${roleList}\nStatus   : ${user.status}`))
      return

    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setFiltered((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err) {
      console.error("DELETE ERROR:", err)
      alert("Gagal menghapus user")
    }
  }

  const createEmptyUser = (): User => ({
    id: 0,
    npk: null,
    name: "",
    username: "",
    status: "active",
    roles: [],
    permissions: [],
  })

  if (accessDenied) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Akses Ditolak!</strong> Anda tidak memiliki izin untuk melihat halaman ini.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-gray-500">{users.length} Pengguna Terdaftar</p>
        </div>

        {hasPermission("user.create") && (
          <button
            onClick={() => {
              setSelectedUser(createEmptyUser())
              setShowUserModal(true)
            }}
            className="px-4 py-2 text-white rounded-lg shadow hover:opacity-90"
            style={{ background: "linear-gradient(to right, #006838, #8DC63F)" }}
          >
            + Tambah Pengguna
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Cari pengguna..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-80 border rounded-lg px-3 py-2"
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">NPK</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Username</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Tidak ada data</td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.npk || "-"}</td>
                  <td className="p-3">{user.name || "-"}</td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">
                    {user.roles?.map((r) => r.role_name).join(", ") || "-"}
                  </td>
                  <td className="p-3">
                    <span className={getStatusColor(user.status)}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="p-3 space-x-2 text-center">
                    {hasPermission("user_role.update") && (
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowRoleModal(true)
                        }}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Kelola Role
                      </button>
                    )}
                    {hasPermission("user.update") && (
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Ubah
                      </button>
                    )}
                    {hasPermission("user.delete") && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showRoleModal && selectedUser && (
        <UserRoleFormModal
          user={selectedUser}
          roles={roles}
          onClose={() => setShowRoleModal(false)}
          onSuccess={() => {
          }}
        />
      )}

      {showUserModal && selectedUser && (
        <UsersFormModal
          mode={selectedUser.id === 0 ? "create" : "edit"}
          user={selectedUser}
          currentUser={loggedInUser}
          roles={roles}
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}