"use client";

import { useState } from "react";
import { Jadwal } from "@/lib/type";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/app/admin/context/AuthContext";
import { useConfirm } from "@/app/admin/context/ConfirmContext";

export type SortKey =
  | "tanggal"
  | "created_at"
  | "updated_at"
  | "deleted_at"

type Props = {
  data: Jadwal[];
  onEdit?: (item: Jadwal) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  onDeletePermanent?: (id: number) => void;
  onSort?: (key: SortKey) => void;
  sortKey?: SortKey;
  sortOrder?: "asc" | "desc";
};

const PERAN_OPTIONS = ["", "Utama", "Backup 1", "Backup 2", "Backup 3", "-"];
const TIPE_JAGA_OPTIONS = ["", "Oncall", "Onsite Pagi", "Onsite Malam", "-"];

export default function TableJadwal({
  data,
  onEdit,
  onDelete,
  onRestore,
  onSort,
  sortKey,
  sortOrder,
}: Props) {
  const { hasPermission } = useAuth();
  const confirmDialog = useConfirm();

  const [peranFilter, setPeranFilter] = useState("");
  const [tipeJagaFilter, setTipeJagaFilter] = useState("");

  const canRestore = hasPermission("jadwal.restore");

  // Filter data berdasarkan kedua filter
  const filteredData = data.filter((item) => {
    const cocokPeran = peranFilter === "" || item.peran === peranFilter;
    const cocokTipe = tipeJagaFilter === "" || item.tipe_jaga === tipeJagaFilter;
    return cocokPeran && cocokTipe;
  });

  const renderSortIcon = (columnKey: SortKey) => {
    if (sortKey !== columnKey) return null;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const handleSort = (key: SortKey) => {
    if (onSort) onSort(key);
  };

  const handleDeleteClick = async (item: Jadwal) => {
    const ok = await confirmDialog({
      title: "Hapus Jadwal",
      message: `Yakin ingin menghapus jadwal ini?\n\nID: ${item.id}\nTanggal: ${item.tanggal}\nposisi: ${item.posisi?.nama_posisi}\nParamedic: ${item.paramedic?.nama_paramedic}`,
      confirmText: "Ya, Hapus",
      danger: true,
    });
    if (ok && onDelete) onDelete(item.id);
  };

  const handleRestoreClick = async (item: Jadwal) => {
    const ok = await confirmDialog({
      title: "Restore Jadwal",
      message: `Restore jadwal ini?\n\nID: ${item.id}\nTanggal: ${item.tanggal}\nposisi: ${item.posisi?.nama_posisi}\nParamedic: ${item.paramedic?.nama_paramedic}`,
      confirmText: "Ya, Restore",
    });
    if (ok && onRestore) onRestore(item.id);
  };

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleString("id-ID") : "-";

  const renderUserAndDate = (user?: string | null, date?: string | null) => {
    if (!user && !date) return "-";
    const userPart = user || "Sistem";
    const datePart = date ? formatDate(date) : "-";
    return `${userPart} (${datePart})`;
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-xl shadow-sm">
      <table className="w-full border-collapse text-sm min-w-[1400px]">
        <thead>
          <tr className="bg-green-600 text-white text-center sticky top-0 z-10">
            <th className="p-2">NO</th>
            <th
              className="p-2 cursor-pointer hover:bg-green-700 select-none"
              onClick={() => handleSort("tanggal")}
            >
              <div className="flex items-center justify-center gap-1">
                TANGGAL {renderSortIcon("tanggal")}
              </div>
            </th>
            <th className="p-2">Posisi</th>
            <th className="p-2">PARAMEDIC</th>

            {/* Kolom Peran dengan Filter */}
            <th className="p-2">
              <div className="flex flex-col items-center gap-1">
                <span>PERAN</span>
                <select
                  value={peranFilter}
                  onChange={(e) => setPeranFilter(e.target.value)}
                  className="text-xs text-black px-1 py-0.5 rounded border border-white/30 bg-white/10 backdrop-blur-sm focus:outline-none"
                >
                  {PERAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "" ? "Semua" : opt}
                    </option>
                  ))}
                </select>
              </div>
            </th>

            {/* Kolom Tipe Jaga dengan Filter */}
            <th className="p-2">
              <div className="flex flex-col items-center gap-1">
                <span>TIPE JAGA</span>
                <select
                  value={tipeJagaFilter}
                  onChange={(e) => setTipeJagaFilter(e.target.value)}
                  className="text-xs text-black px-1 py-0.5 rounded border border-white/30 bg-white/10 backdrop-blur-sm focus:outline-none"
                >
                  {TIPE_JAGA_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "" ? "Semua" : opt}
                    </option>
                  ))}
                </select>
              </div>
            </th>

            <th className="p-2">KETERANGAN</th>
            <th
              className="p-2 cursor-pointer hover:bg-green-700 select-none"
              onClick={() => handleSort("created_at")}
            >
              <div className="flex items-center justify-center gap-1">
                CREATED {renderSortIcon("created_at")}
              </div>
            </th>
            <th
              className="p-2 cursor-pointer hover:bg-green-700 select-none"
              onClick={() => handleSort("updated_at")}
            >
              <div className="flex items-center justify-center gap-1">
                UPDATED {renderSortIcon("updated_at")}
              </div>
            </th>
            <th
              className="p-2 cursor-pointer hover:bg-green-700 select-none"
              onClick={() => handleSort("deleted_at")}
            >
              <div className="flex items-center justify-center gap-1">
                DELETED {renderSortIcon("deleted_at")}
              </div>
            </th>
            <th className="p-2">DEL</th>
            <th className="p-2">AKSI</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center p-6 text-gray-500">
                Tidak ada data
              </td>
            </tr>
          ) : (
            filteredData.map((item, index) => {
              const isDeleted = !!item.deleted_at;
              return (
                <tr
                  key={item.id}
                  className={`text-center ${
                    isDeleted
                      ? "bg-red-200 text-red-900"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-100"
                  }`}
                >
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{item.tanggal}</td>
                  <td className="p-2 font-semibold">
                    {item.posisi?.nama_posisi || "-"}
                  </td>
                  <td className="p-2">
                    {item.paramedic?.nama_paramedic || "-"}
                  </td>
                  <td className="p-2">{item.peran || "-"}</td>
                  <td className="p-2">{item.tipe_jaga || "-"}</td>
                  <td className="p-2">{item.keterangan || "-"}</td>
                  <td className="p-2">
                    {renderUserAndDate(
                      item.created_by_name ?? item.created_by,
                      item.created_at
                    )}
                  </td>
                  <td className="p-2">
                    {renderUserAndDate(item.updated_by, item.updated_at)}
                  </td>
                  <td className="p-2">
                    {renderUserAndDate(item.deleted_by, item.deleted_at)}
                  </td>
                  <td className="p-2 font-bold">{isDeleted ? "✔" : "✖"}</td>
                  <td className="p-2 flex justify-center gap-2">
                    {!isDeleted && (
                      <>
                        {hasPermission("jadwal.update") && (
                          <button
                            onClick={() => onEdit?.(item)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission("jadwal.delete") && (
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                          >
                            Hapus
                          </button>
                        )}
                      </>
                    )}
                    {isDeleted && (
                      <>
                        {canRestore && (
                          <button
                            onClick={() => handleRestoreClick(item)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
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
    </div>
  );
}