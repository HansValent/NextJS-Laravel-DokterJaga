"use client";

import { useEffect, useState, useMemo } from "react";
import { Toast } from "@/components/Toast";
import TableJadwal, { SortKey } from "@/components/TableJadwal";
import JadwalFormModal from "@/components/jadwal/JadwalFormModal";
import {
  getposisiAdmin,
  getJadwalAdmin,
  deleteJadwal,
  restoreJadwal,
} from "@/services/jadwalService";
import { Posisi, Jadwal } from "@/lib/type";
import { useJadwalSocket } from "@/hooks/useJadwalSocket";
import { useAuth } from "@/app/admin/context/AuthContext";
import { X, Plus } from "lucide-react";

export default function JadwalPage() {
  const { loading: authLoading } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [allData, setAllData] = useState<Jadwal[]>([]);
  const [posisiList, setposisiList] = useState<Posisi[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [selectedposisi, setSelectedposisi] = useState<number | "">("");
  const [filterParamedic, setFilterParamedic] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState<"aktif" | "deleted" | "semua">("aktif");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("tanggal");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [selectedItem, setSelectedItem] = useState<Jadwal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data
  const loadData = async () => {
    if (authLoading) return;
    try {
      setLoading(true);
      const res = await getJadwalAdmin(true);
      setAllData(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: "Gagal mengambil data jadwal", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading]);

  // Realtime via WebSocket (panggil ulang data saat ada perubahan)
  useJadwalSocket(["jadwal-updated", "refresh-all"], () => {
    loadData();
  });

  // Filter & Sort data
  const filteredData = useMemo(() => {
    let result = [...allData];

    if (mode === "aktif") result = result.filter((item) => !item.deleted_at);
    if (mode === "deleted") result = result.filter((item) => item.deleted_at);

    if (selectedposisi) {
      result = result.filter((item) => item.posisi?.id === selectedposisi);
    }

    if (filterParamedic.trim()) {
      const keyword = filterParamedic.toLowerCase();
      result = result.filter((item) =>
        (item.paramedic?.nama_paramedic ?? "").toLowerCase().includes(keyword)
      );
    }

    if (startDate && endDate) {
      result = result.filter(
        (item) => item.tanggal >= startDate && item.tanggal <= endDate
      );
    }

    result.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortKey) {
        case "tanggal":
          valA = new Date(a.tanggal).getTime();
          valB = new Date(b.tanggal).getTime();
          break;
        case "created_at":
          valA = a.created_at ? new Date(a.created_at).getTime() : 0;
          valB = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        case "updated_at":
          valA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          valB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          break;
        case "deleted_at":
          valA = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
          valB = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [allData, mode, selectedposisi, filterParamedic, startDate, endDate, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedposisi("");
    setFilterParamedic("");
    setMode("aktif");
    setSortKey("tanggal");
    setSortOrder("asc");
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Jadwal) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJadwal(id);
      setToast({ message: "Jadwal berhasil dihapus (soft delete)", type: "success" });
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Gagal menghapus jadwal", type: "error" });
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreJadwal(id);
      setToast({ message: "Jadwal berhasil direstore", type: "success" });
      loadData();
    } catch (err: any) {
      setToast({ message: err.message || "Gagal merestore jadwal", type: "error" });
    }
  };

  useEffect(() => {
    const loadposisi = async () => {
      const data = await getposisiAdmin();
      setposisiList(data);
    };
    loadposisi();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("aktif")}
          className={`px-3 py-1 rounded ${mode === "aktif" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Aktif
        </button>
        <button
          onClick={() => setMode("deleted")}
          className={`px-3 py-1 rounded ${mode === "deleted" ? "bg-red-600 text-white" : "bg-gray-200"}`}
        >
          Deleted
        </button>
        <button
          onClick={() => setMode("semua")}
          className={`px-3 py-1 rounded ${mode === "semua" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Semua
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Posisi</label>
            <select
              value={selectedposisi}
              onChange={(e) =>
                setSelectedposisi(e.target.value ? Number(e.target.value) : "")
              }
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Semua</option>
              {posisiList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_posisi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter Paramedic</label>
            <input
              type="text"
              placeholder="Cari paramedic..."
              value={filterParamedic}
              onChange={(e) => setFilterParamedic(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
            />
          </div>
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
          >
            <X size={14} /> Reset Filter
          </button>
        </div>
      </div>

      <button
        onClick={handleCreate}
        className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 justify-center font-medium mt-2 w-full"
      >
        <Plus size={14} /> Tambah Jadwal Baru
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive w-full">
          <TableJadwal
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onSort={handleSort}
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </div>
      )}

      {isModalOpen && (
        <JadwalFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          editData={selectedItem}
          onSuccess={async () => {
            await loadData();
            setIsModalOpen(false);
          }}
        />
      )}

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