// hooks/useJadwalCalendar.ts

import { useEffect, useState, useCallback } from "react"
import dayjs from "dayjs"
import 'dayjs/locale/id'
import localeData from 'dayjs/plugin/localeData'
dayjs.extend(localeData)
dayjs.locale('id')
import { getJadwal } from "@/services/jadwalService"
import { copyWeekJadwalCustom, copyDayJadwal } from "@/services/jadwalService"
import { Jadwal } from "@/lib/type"
import { useJadwalSocket } from "@/hooks/useJadwalSocket"

export const useJadwalCalendar = (
  posisiId: number | "" = "",
  refreshKey: number = 0,
  onRefresh?: () => void,
  onToast?: (message: string, type: "success" | "error") => void
) => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [jadwalMap, setJadwalMap] = useState<Record<string, Jadwal[]>>({})
  const [loading, setLoading] = useState(false)

  // ========== COPY STATE ==========
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [copyMode, setCopyMode] = useState<"week" | "day">("week")
  const [sourceStart, setSourceStart] = useState("")
  const [sourceEnd, setSourceEnd] = useState("")
  const [targetStart, setTargetStart] = useState("")
  const [singleSourceDate, setSingleSourceDate] = useState("")
  const [singleTargetDate, setSingleTargetDate] = useState("")
  const [copyLoading, setCopyLoading] = useState(false)

  // ========== FETCH DATA ==========
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getJadwal()
      const allData: Jadwal[] = res.data || []

      const filtered = posisiId
        ? allData.filter((item) => item.posisi?.id === posisiId)
        : allData

      const map: Record<string, Jadwal[]> = {}
      filtered.forEach((item) => {
        const key = dayjs(item.tanggal).format("DD/MM/YYYY")
        if (!map[key]) map[key] = []
        map[key].push(item)
      })

      setJadwalMap(map)
    } catch (error) {
      console.error("Gagal fetch jadwal:", error)
    } finally {
      setLoading(false)
    }
  }, [posisiId])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  useJadwalSocket(["jadwal-updated", "refresh-all"], () => {
    fetchData()
  })

  const prev = () => setCurrentDate((d) => d.subtract(1, "month"))
  const next = () => setCurrentDate((d) => d.add(1, "month"))

  const getMonday = (d: dayjs.Dayjs) => d.day(1).startOf('day')   // Senin
  const getSunday = (d: dayjs.Dayjs) => getMonday(d).add(6, 'day') // Minggu

  // ========== COPY HELPERS ==========
  const openCopyModal = () => {
    const today = dayjs()
    const monday = getMonday(today)
    const sunday = getSunday(today)
    setSourceStart(monday.format('YYYY-MM-DD'))
    setSourceEnd(sunday.format('YYYY-MM-DD'))
    setTargetStart(monday.add(7, 'day').format('YYYY-MM-DD'))
    setSingleSourceDate(today.format('YYYY-MM-DD'))
    setSingleTargetDate(today.add(1, 'day').format('YYYY-MM-DD'))
    setCopyMode("week")
    setCopyModalOpen(true)
  }

  const closeCopyModal = () => {
    setCopyModalOpen(false)
  }

  const handleCopyWeekQuick = async () => {
    setCopyLoading(true)
    try {
      const today = dayjs()
      const start = getMonday(today).format('YYYY-MM-DD')
      const end   = getSunday(today).format('YYYY-MM-DD')
      const target = getMonday(today).add(7, 'day').format('YYYY-MM-DD')
    
      const res = await copyWeekJadwalCustom(start, end, target)
      onRefresh?.()
      onToast?.(res?.message || 'Jadwal berhasil disalin!', "success")
    } catch (err: any) {
      onToast?.('Gagal menyalin: ' + (err.message || 'Terjadi kesalahan'), "error")
    } finally {
      setCopyLoading(false)
    }
  }


  const handleCopyWeekCustom = async () => {
    if (!sourceStart || !sourceEnd || !targetStart) {
      onToast?.("Semua tanggal harus diisi", "error")
      return
    }

    setCopyLoading(true)
    try {
      const res = await copyWeekJadwalCustom(sourceStart, sourceEnd, targetStart)
      onRefresh?.()
      onToast?.(res?.message || 'Jadwal berhasil disalin!', "success")
      closeCopyModal()
    } catch (err: any) {
      onToast?.('Gagal menyalin: ' + (err.message || 'Terjadi kesalahan'), "error")
    } finally {
      setCopyLoading(false)
    }
  }

  const handleCopyDay = async () => {
    if (!singleSourceDate || !singleTargetDate) {
      onToast?.("Tanggal sumber dan target harus diisi", "error")
      return
    }

    setCopyLoading(true)
    try {
      const res = await copyDayJadwal(singleSourceDate, singleTargetDate)
      onRefresh?.()
      onToast?.(res?.message || 'Jadwal berhasil disalin!', "success")
      closeCopyModal()
    } catch (err: any) {
      onToast?.('Gagal menyalin: ' + (err.message || 'Terjadi kesalahan'), "error")
    } finally {
      setCopyLoading(false)
    }
  }

  return {
    currentDate,
    jadwalMap,
    loading,
    prev,
    next,
    setCurrentDate,
    // copy modal & states
    copyModalOpen,
    openCopyModal,
    closeCopyModal,
    copyMode,
    setCopyMode,
    sourceStart,
    setSourceStart,
    sourceEnd,
    setSourceEnd,
    targetStart,
    setTargetStart,
    singleSourceDate,
    setSingleSourceDate,
    singleTargetDate,
    setSingleTargetDate,
    copyLoading,
    handleCopyWeekQuick,
    handleCopyWeekCustom,
    handleCopyDay,
  }
}