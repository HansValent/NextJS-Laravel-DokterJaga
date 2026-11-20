// hooks/useJadwalAdmin.ts
import { useState, useEffect, useCallback } from "react";
import { 
  getJadwal, 
  getDeletedJadwal,
  createJadwal, 
  updateJadwal, 
  deleteJadwal, 
  restoreJadwal, 
  CreateJadwalPayload,
  UpdateJadwalPayload,
  getJadwalAdmin
} from "@/services/jadwalService";
import { Jadwal } from "@/lib/type";
import { useJadwalSocket } from "./useJadwalSocket";
import dayjs from "dayjs";

export type AdminFilterParams = {
  start_date: string;
  end_date: string;
  id_posisi: string | number;
};

export const useJadwalAdmin = (initialFilters?: Partial<AdminFilterParams>) => {
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [trashJadwal, setTrashJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State filter dashboard admin
  const [filters, setFilters] = useState<AdminFilterParams>({
    start_date: "",
    end_date: "",
    id_posisi: "",
    ...initialFilters
  });

  /**
   * 1. Mengambil data jadwal aktif (is_deleted = 0)
   */
  const fetchJadwalData = useCallback(async () => {
  setLoading(true);
  try {
    const response = await getJadwalAdmin(false); // aktif
    if (response.success) {
      setJadwal(response.data);
    }
  } catch (err) {
    setError('Gagal memuat data');
  } finally {
    setLoading(false);
  }
}, []);


  /**
   * 2. Mengambil data sampah jadwal (is_deleted = 1) untuk Trash Panel
   */
  const fetchTrashData = useCallback(async () => {
    try {
      const response = await getDeletedJadwal();
      if (response.success) {
        setTrashJadwal(response.data || []);
      }
    } catch (err) {
      console.error("Gagal menarik data trash bin:", err);
    }
  }, []);

  // Memicu penarikan ulang data setiap kali parameter filter diubah oleh admin
  useEffect(() => {
    fetchJadwalData();
  }, [fetchJadwalData]);

  /**
   * 3. Aksi Pembuatan Jadwal Baru (Mendukung Single / Bulk)
   */
  const handleCreateJadwal = async (payload: CreateJadwalPayload) => {
    try {
      const response = await createJadwal(payload);
      if (response.success) {
        await fetchJadwalData();
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: "Gagal memproses pembuatan jadwal baru." };
    }
  };

  /**
   * 4. Aksi Pembaruan Data Satu Jadwal
   */
  const handleUpdateJadwal = async (id: number, payload: UpdateJadwalPayload) => {
    try {
      const response = await updateJadwal(id, payload);
      if (response.success) {
        await fetchJadwalData();
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: "Gagal memperbarui data jadwal." };
    }
  };

  /**
   * 5. Aksi Penghapusan Sementara (Soft Delete)
   */
  const handleDeleteJadwal = async (id: number) => {
    try {
      const response = await deleteJadwal(id);
      if (response.success) {
        await fetchJadwalData();
        await fetchTrashData();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: "Gagal menghapus jadwal harian." };
    }
  };

  /**
   * 6. Aksi Pemulihan Data dari Tempat Sampah (Restore)
   */
  const handleRestoreJadwal = async (id: number) => {
    try {
      const response = await restoreJadwal(id);
      if (response.success) {
        await fetchJadwalData();
        await fetchTrashData();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: "Gagal memulihkan jadwal." };
    }
  };

  /**
   * 7. Aksi Penghapusan Permanen dari Database (Hard Delete)
   */
  /* const handlePermanentDeleteJadwal = async (id: number) => {
    try {
      const response = await permanentDeleteJadwal(id);
      if (response.success) {
        await fetchTrashData();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: "Gagal menghapus data secara permanen." };
    }
  }; */

  /**
   * 🔄 REALTIME SYNCHRONIZATION VIA WEBSOCKET
   * Otomatis memicu refresh state lokal jika ada mutasi data dari client lain
   */
  useJadwalSocket(["jadwal-updated", "refresh-all"], (data: any) => {
    if (!data) return;
    
    const eventType = data.type || data.payload?.type;
    const targets = ["create", "update", "delete", "restore", "permanent_delete", "import_jadwal", "refresh_all"];
    
    if (targets.includes(eventType)) {
      fetchJadwalData();
      fetchTrashData();
    }
  });

  return {
    jadwal,
    trashJadwal,
    loading,
    error,
    filters,
    setFilters,
    refreshActive: fetchJadwalData,
    refreshTrash: fetchTrashData,
    createJadwal: handleCreateJadwal,
    updateJadwal: handleUpdateJadwal,
    deleteJadwal: handleDeleteJadwal,
    restoreJadwal: handleRestoreJadwal,
    /* permanentDeleteJadwal: handlePermanentDeleteJadwal, */
  };
};