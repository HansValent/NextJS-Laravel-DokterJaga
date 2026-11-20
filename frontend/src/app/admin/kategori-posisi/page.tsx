"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/app/admin/context/AuthContext";
import {
  getKategoriPosisiAdmin,
  createKategoriPosisi,
  updateKategoriPosisi,
  deleteKategoriPosisi,
} from "@/services/jadwalService";
import type { Kategori } from "@/lib/type";
import { ChevronUp, ChevronDown, X, Pencil, Trash2 } from "lucide-react";

export default function KategoriPosisiPage() {
  const { hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & sorting
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortKey, setSortKey] = useState<keyof Kategori>("urutan");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Kategori | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formUrutan, setFormUrutan] = useState<number | "">("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Load data
  const loadData = async () => {
    if (authLoading) return;
    try {
      setLoading(true);
      const res = await getKategoriPosisiAdmin();
      setData(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading]);

  // Filter
  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama_kategori.toLowerCase().includes(keyword) ||
          String(item.urutan).includes(keyword)
      );
    }

    return result;
  }, [data, search]);

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Toggle sorting
  const handleSort = (key: keyof Kategori) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Reset filter
  const resetFilters = () => {
    setSearch("");
    setSortKey("urutan");
    setSortOrder("asc");
  };

  // Buka modal create
  const openCreate = () => {
    setEditItem(null);
    setFormNama("");
    setFormUrutan("");
    setFormError("");
    setShowModal(true);
  };

  // Buka modal edit
  const openEdit = (item: Kategori) => {
    setEditItem(item);
    setFormNama(item.nama_kategori);
    setFormUrutan(item.urutan);
    setFormError("");
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formNama.trim()) {
      setFormError("Nama kategori wajib diisi");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        nama_kategori: formNama.trim(),
        urutan: formUrutan === "" ? undefined : Number(formUrutan),
      };

      if (editItem) {
        await updateKategoriPosisi(editItem.id, payload);
      } else {
        await createKategoriPosisi(payload);
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await deleteKategoriPosisi(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus");
    }
  };

  // Render sorting icon
  const renderSortIcon = (key: keyof Kategori) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Kategori posisi</h1>
        {hasPermission("kategori_posisi.manage") && (
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            + Tambah Kategori
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg border flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Cari</label>
          <input
            type="text"
            placeholder="Nama atau urutan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-48"
          />
        </div>
        <button
          onClick={resetFilters}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
        >
          <X size={14} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl border overflow-hidden">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : sortedData.length === 0 ? (
          <p className="p-4 text-gray-500">Tidak ada data</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th
                  className="p-3 cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => handleSort("urutan")}
                >
                  <div className="flex items-center gap-1">
                    Urutan {renderSortIcon("urutan")}
                  </div>
                </th>
                <th
                  className="p-3 cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => handleSort("nama_kategori")}
                >
                  <div className="flex items-center gap-1">
                    Nama Kategori {renderSortIcon("nama_kategori")}
                  </div>
                </th>
                <th className="p-3">Created</th>
                <th className="p-3">Updated</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{item.urutan}</td>
                  <td className="p-3 font-medium">{item.nama_kategori}</td>
                  <td className="p-3 text-xs text-gray-600">
                    <div>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "-"}
                    </div>
                    <div className="text-gray-400">
                      by: {item.created_by ?? "-"}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    <div>
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString()
                        : "-"}
                    </div>
                    <div className="text-gray-400">
                      by: {item.updated_by ?? "-"}
                    </div>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    {hasPermission("kategori_posisi.manage") && (
                      <>
                        <button
                          onClick={() => openEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">
              {editItem ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Kategori</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Nama kategori..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Urutan</label>
                <input
                  type="number"
                  value={formUrutan}
                  onChange={(e) =>
                    setFormUrutan(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Urutan (opsional)"
                  min={1}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {formLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}