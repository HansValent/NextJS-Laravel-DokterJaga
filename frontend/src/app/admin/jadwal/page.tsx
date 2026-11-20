"use client"

import { useEffect, useState } from "react"
import { useConfirm } from "@/app/admin/context/ConfirmContext";
import CalendarNav from "@/components/jadwal/CalendarNAV"
import CalendarGrid from "@/components/jadwal/CalendarGrid"
import { useJadwalCalendar } from "@/hooks/useJadwalCalendar"
import dayjs from "dayjs"
import JadwalFormModal from "@/components/jadwal/JadwalFormModal"
import PosisiFilter from "@/components/jadwal/PosisiFilter";
import { useAuth } from "@/app/admin/context/AuthContext"
import { Toast } from "@/components/Toast"
import CopyJadwalModal from "./CopyJadwalModal";

import {
  getposisi,
  deleteJadwal,
  getJadwalById,
} from "@/services/jadwalService"

import { Jadwal, Posisi } from "@/lib/type";

export default function JadwalPage() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { hasPermission } = useAuth()
  const { loading: authLoading } = useAuth()
  const confirmDialog = useConfirm();

  const [selectedposisi, setSelectedposisi] = useState<number | "">("")
  const [posisiList, setposisiList] = useState<Posisi[]>([])
  const [loadingposisi, setLoadingposisi] = useState(false)

  const [editData, setEditData] = useState<Jadwal | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  // hook kalender dengan copy logic
  const {
    currentDate, jadwalMap, loading: calendarLoading, prev, next, setCurrentDate,
    copyModalOpen, openCopyModal, closeCopyModal,
    copyMode, setCopyMode,
    sourceStart, setSourceStart,
    sourceEnd, setSourceEnd,
    targetStart, setTargetStart,
    singleSourceDate, setSingleSourceDate,
    singleTargetDate, setSingleTargetDate,
    copyLoading,
    handleCopyWeekQuick,
    handleCopyWeekCustom,
    handleCopyDay,
  } = useJadwalCalendar(
    selectedposisi,
    refreshKey,
    () => setRefreshKey(prev => prev + 1),
    (msg, type) => setToast({ message: msg, type })
  )

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  useEffect(() => {
    let mounted = true
    const loadposisi = async () => {
      try {
        setLoadingposisi(true)
        const data = await getposisi()
        if (mounted) setposisiList(data)
      } catch (err) {
        console.error(err)
        showToast("Gagal memuat data posisi", "error");
      } finally {
        if (mounted) setLoadingposisi(false)
      }
    }
    loadposisi()
    return () => { mounted = false }
  }, [authLoading])

  // --- handler yang tidak terkait copy ---
  const handleDateClick = (date: string) => {
    setEditData(null)
    setSelectedDate(date)
    setModalOpen(true)
  }

  const handleEdit = async (item: Jadwal) => {
    try {
      setSelectedDate(item.tanggal)
      const res = await getJadwalById(item.id)
      setEditData(res.data)
      setModalOpen(true)
    } catch (err) {
      console.error(err)
      showToast("Gagal memuat data edit", "error");
    }
  }

  const handleDelete = async (id: number) => {
    const ok = await confirmDialog({
      title: "Hapus Jadwal",
      message: "Yakin ingin menghapus jadwal ini?",
      confirmText: "Ya, Hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteJadwal(id);
      setRefreshKey((prev) => prev + 1);
      showToast("Jadwal berhasil dihapus", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus jadwal", "error");
    }
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setModalOpen(false)
    setEditData(null)
    showToast("Jadwal berhasil disimpan", "success");
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditData(null)
  }

  // wrapper untuk quick copy dengan konfirmasi
  const handleQuickCopy = async () => {
    const ok = await confirmDialog({
      title: "Salin Jadwal Minggu",
      message: "Salin jadwal minggu ini ke minggu depan? Data yang bentrok akan dilewati.",
      confirmText: "Ya, Salin",
      danger: false,
    });
    if (ok) handleCopyWeekQuick()
  }

  return (
    <>
      <div className="p-4 space-y-4 ">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Input Jadwal Dokter Jaga</h1>
            <p className="text-gray-700 font-medium text-base">Jadwal Dokter Jaga IGD - {currentDate.format("MM/YYYY")}</p>
          </div>

          <div className="flex gap-2">
            {hasPermission("jadwal.create") && (
              <>
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={handleQuickCopy}
                  disabled={copyLoading}
                >
                  {copyLoading ? 'Menyalin...' : 'Copy Minggu Depan'}
                </button>
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={openCopyModal}
                  disabled={copyLoading}
                >
                  📋 Copy Jadwal...
                </button>
              </>
            )}

            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => window.open(window.location.origin, "_blank")}
            >
              Lihat Tampilan TV
            </button>
          </div>
        </div>
      </div>

      <div className="top-0 z-30 bg-transparent border-b">
        <div className="px-4 py-2">
          <PosisiFilter
            posisiList={posisiList}
            selectedposisi={selectedposisi}
            setSelectedposisi={setSelectedposisi}
            loading={loadingposisi}
          />
        </div>
      </div>

      <div className="p-4 space-y-4 min-w-0">
        <CalendarNav
          view="month"
          currentDate={currentDate}
          prev={prev}
          next={next}
          setView={() => {}}
          setCurrentDate={setCurrentDate}
        />

        <div className="max-h-[65vh] overflow-auto overflow-x-auto border rounded w-full">
          <CalendarGrid
            currentDate={currentDate}
            jadwalMap={jadwalMap}
            loading={calendarLoading}
            onDateClick={handleDateClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {modalOpen && selectedDate && (
        <JadwalFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          tanggal={selectedDate}
          defaultposisiId={selectedposisi}
          editData={editData}
        />
      )}

      {/* Copy Modal */}
      <CopyJadwalModal
        isOpen={copyModalOpen}
        onClose={closeCopyModal}
        mode={copyMode}
        setMode={setCopyMode}
        sourceStart={sourceStart}
        setSourceStart={setSourceStart}
        sourceEnd={sourceEnd}
        setSourceEnd={setSourceEnd}
        targetStart={targetStart}
        setTargetStart={setTargetStart}
        singleSourceDate={singleSourceDate}
        setSingleSourceDate={setSingleSourceDate}
        singleTargetDate={singleTargetDate}
        setSingleTargetDate={setSingleTargetDate}
        onSubmitWeek={handleCopyWeekCustom}
        onSubmitDay={handleCopyDay}
        loading={copyLoading}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}