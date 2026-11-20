"use client";

import { useEffect, useState, useMemo } from "react";
import { Toast } from "@/components/Toast";
import { useConfirm } from "@/app/admin/context/ConfirmContext";
import {
  getPJAdmin,
  deletePJ,
  restorePJ,
} from "@/services/jadwalService";
import { PenanggungJawab } from "@/lib/type";
import { useAuth } from "@/app/admin/context/AuthContext";
import PJFormModal from "@/components/PJ/PJFormModal";
import { ChevronUp, ChevronDown, X, Trash2 } from "lucide-react";
import { useJadwalSocket } from "@/hooks/useJadwalSocket";

const PER_PAGE = 15;

export default function PJPage() {
  const { loading: authLoading, hasPermission } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [data, setData] = useState<PenanggungJawab[]>([]);
  const [loading, setLoading] = useState(true);
  const confirmDialog = useConfirm();

  // Mode
  const [mode, setMode] = useState<"aktif" | "deleted" | "semua">("aktif");

  // Filter tanggal (range)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter teks untuk kolom Perawat, Kepala Jaga, Ponek
  const [filterPerawat, setFilterPerawat] = useState("");
  const [filterKepalaJaga, setFilterKepalaJaga] = useState("");
  const [filterPonek, setFilterPonek] = useState("");

  // Sorting tanggal
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PenanggungJawab | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);

  // Load data (selalu ambil dengan showDeleted=true agar data lengkap)
  const loadData = async () => {
    if (authLoading) return;
    try {
      setLoading(true);
      const res = await getPJAdmin(true); // ambil semua termasuk deleted
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading]);

  // WebSocket realtime
  useJadwalSocket(["pj-updated"], () => {
    loadData();
  });

  // Filter dan sorting data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Mode filter
    if (mode === "aktif") {
      result = result.filter((item) => !item.deleted_at);
    } else if (mode === "deleted") {
      result = result.filter((item) => item.deleted_at);
    }

    // Filter rentang tanggal
    if (startDate) {
      result = result.filter((item) => item.tanggal >= startDate);
    }
    if (endDate) {
      result = result.filter((item) => item.tanggal <= endDate);
    }

    // Filter teks per kolom (case-insensitive)
    if (filterPerawat.trim()) {
      const keyword = filterPerawat.toLowerCase();
      result = result.filter((item) =>
        (item.perawat_nama ?? "").toLowerCase().includes(keyword)
      );
    }
    if (filterKepalaJaga.trim()) {
      const keyword = filterKepalaJaga.toLowerCase();
      result = result.filter((item) =>
        (item.kepala_jaga_nama ?? "").toLowerCase().includes(keyword)
      );
    }
    if (filterPonek.trim()) {
      const keyword = filterPonek.toLowerCase();
      result = result.filter((item) =>
        (item.ponek_nama ?? "").toLowerCase().includes(keyword)
      );
    }

    // Sorting tanggal
    result.sort((a, b) => {
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [
    data,
    mode,
    startDate,
    endDate,
    filterPerawat,
    filterKepalaJaga,
    filterPonek,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredData.slice(start, start + PER_PAGE);
  }, [filteredData, page]);

  // Reset halaman saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [mode, startDate, endDate, filterPerawat, filterKepalaJaga, filterPonek, sortOrder]);

  // Reset semua filter
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterPerawat("");
    setFilterKepalaJaga("");
    setFilterPonek("");
    setSortOrder("asc");
    setMode("aktif");
    // page akan di-reset oleh useEffect di atas
  };

  const handleEdit = (item: PenanggungJawab) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PenanggungJawab) => {
    const ok = await confirmDialog({
      title: "Hapus Penanggung Jawab",
      message: `Yakin ingin menghapus Penanggung Jawab ini?\n\nID: ${item.id}\nTanggal: ${item.tanggal}\nPerawat: ${item.perawat_nama}\nKepala Jaga: ${item.kepala_jaga_nama}\nPONEK: ${item.ponek_nama}`,
      confirmText: "Ya, Hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePJ(item.id);
      setToast({ message: "Penanggung Jawab berhasil dihapus", type: "success" });
      loadData();
    } catch (err) {
      console.error(err);
      setToast({ message: "Gagal delete", type: "error" });
    }
  };

  const handleRestore = async (item: PenanggungJawab) => {
    const ok = await confirmDialog({
      title: "Restore Penanggung Jawab",
      message: `Restore Penanggung Jawab ini?\n\nID: ${item.id}\nTanggal: ${item.tanggal}\nPerawat: ${item.perawat_nama}\nKepala Jaga: ${item.kepala_jaga_nama}\nPONEK: ${item.ponek_nama}`,
      confirmText: "Ya, Restore",
    });
    if (!ok) return;
    try {
      await restorePJ(item.id);
      setToast({ message: "Penanggung Jawab berhasil direstore", type: "success" });
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Gagal merestore Penanggung Jawab", type: "error" });
    }
  };

  // Toggle sorting
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Cek permission
  const canRestore = hasPermission("penanggung_jawab.restore");
  const canUpdate = hasPermission("penanggung_jawab.update");
  const canDelete = hasPermission("penanggung_jawab.delete");

  return (
    <div className="space-y-6 p-4">
      {/* Header & Tombol Tambah */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Penanggung Jawab</h1>
        {hasPermission("penanggung_jawab.create") && (
          <button
            onClick={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
          >
            + Tambah
          </button>
        )}
      </div>

      {/* Mode Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("aktif")}
          className={`px-3 py-1 rounded ${
            mode === "aktif" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Aktif
        </button>
        <button
          onClick={() => setMode("deleted")}
          className={`px-3 py-1 rounded ${
            mode === "deleted" ? "bg-red-600 text-white" : "bg-gray-200"
          }`}
        >
          Dihapus
        </button>
        <button
          onClick={() => setMode("semua")}
          className={`px-3 py-1 rounded ${
            mode === "semua" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Semua
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Filter Tanggal */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          {/* Filter Perawat */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter Perawat
            </label>
            <input
              type="text"
              placeholder="Cari perawat..."
              value={filterPerawat}
              onChange={(e) => setFilterPerawat(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
            />
          </div>

          {/* Filter Kepala Jaga */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter Kepala Jaga
            </label>
            <input
              type="text"
              placeholder="Cari kepala jaga..."
              value={filterKepalaJaga}
              onChange={(e) => setFilterKepalaJaga(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
            />
          </div>

          {/* Filter Ponek */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Filter Ponek
            </label>
            <input
              type="text"
              placeholder="Cari ponek..."
              value={filterPonek}
              onChange={(e) => setFilterPonek(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
            />
          </div>

          {/* Tombol Reset */}
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <X size={14} /> Reset Filter
          </button>
        </div>
      </div>

      {/* Tabel dengan container scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-xl shadow-sm">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-gray-100 text-left sticky top-0 z-10">
              <tr>
                <th
                  className="p-3 cursor-pointer hover:bg-gray-200 select-none"
                  onClick={toggleSortOrder}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    {sortOrder === "asc" ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="p-3">Perawat</th>
                <th className="p-3">Kepala Jaga</th>
                <th className="p-3">Ponek</th>
                <th className="p-3">Created</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Deleted By</th>
                <th className="p-3">Deleted At</th>
                <th className="p-3 text-center">Deleted</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const no = (page - 1) * PER_PAGE + index + 1;
                  const isDeleted = !!item.deleted_at;
                  return (
                    <tr
                      key={item.id}
                      className={`border-t hover:bg-gray-50 ${
                        isDeleted ? "bg-red-100 text-red-900" : ""
                      }`}
                    >
                      <td className="p-3">{item.tanggal}</td>
                      <td className="p-3">{item.perawat_nama || "-"}</td>
                      <td className="p-3">{item.kepala_jaga_nama || "-"}</td>
                      <td className="p-3">{item.ponek_nama || "-"}</td>
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
                      <td className="p-3 text-xs">
                        {item.deleted_by ?? "-"}
                      </td>
                      <td className="p-3 text-xs">
                        {item.deleted_at
                          ? new Date(item.deleted_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {isDeleted ? "✔" : "✖"}
                      </td>
                      <td className="p-3 text-center space-x-2">
                        {!isDeleted && (
                          <>
                            {canUpdate && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-red-600 hover:underline"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            )}
                          </>
                        )}
                        {isDeleted && (
                          <>
                            <span className="text-red-600 font-bold mr-1">✔</span>
                            {canRestore && (
                              <button
                                onClick={() => handleRestore(item)}
                                className="text-blue-600 hover:underline px-2 py-1"
                              >
                                Restore
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PJFormModal
          open={isModalOpen}
          mode={selectedItem ? "edit" : "create"}
          data={selectedItem}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Toast notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}