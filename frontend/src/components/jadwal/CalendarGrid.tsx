import dayjs from "dayjs"
import 'dayjs/locale/id'
import localeData from 'dayjs/plugin/localeData'
import { Trash2 } from "lucide-react"
import { Jadwal } from "@/lib/type"
import { useAuth } from "@/app/admin/context/AuthContext"
import { useConfirm } from "@/app/admin/context/ConfirmContext"

dayjs.extend(localeData)
dayjs.locale('id')

type CalendarGridProps = {
  currentDate: dayjs.Dayjs
  jadwalMap: Record<string, Jadwal[]>
  loading: boolean
  onDateClick?: (date: string) => void
  onEdit?: (item: Jadwal) => void
  onDelete?: (id: number) => void
}

export default function CalendarGrid({
  currentDate,
  jadwalMap,
  loading,
  onDateClick,
  onEdit,
  onDelete,
}: CalendarGridProps) {
  const { hasPermission } = useAuth()
  const confirmDialog = useConfirm()

  const startOfMonth = currentDate.startOf("month").startOf("week")
  const endOfMonth = currentDate.endOf("month").endOf("week")

  const days: dayjs.Dayjs[] = []
  let day = startOfMonth

  while (day.isBefore(endOfMonth, "day") || day.isSame(endOfMonth, "day")) {
    days.push(day)
    day = day.add(1, "day")
  }

  const today = dayjs().format("DD/MM/YYYY")


  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div className="grid grid-cols-7 gap-1 w-full min-w-0">
      {days.map((d) => {
        const dateStr = d.format("DD/MM/YYYY")
        const isCurrentMonth = d.month() === currentDate.month();

        return (
          <div
            key={dateStr}
            onClick={() => onDateClick?.(dateStr)}
            className={`relative border p-2 flex flex-col h-[120px] cursor-pointer transition-colors duration-150 ${
            isCurrentMonth ? 'hover:bg-blue-300' : 'hover:bg-gray-300'
          } ${dateStr === today ? 'bg-green-100 border-green-500' : ''}`}
          >

            <div className={`font-semibold cursor-pointer ${!isCurrentMonth ? 'opacity-40' : ''}`}>
              <span className="block text-xs uppercase font-semibold tracking-wide">
                {d.format('ddd')}
              </span>
              <span className={`text-sm ${isCurrentMonth ? 'font-bold text-black' : 'text-gray-400'}`}>
                {d.date()}
              </span>
            </div>

            {/* LIST JADWAL */}
            <div className="text-xs space-y-1 mt-1 overflow-y-auto flex-1 pr-1">
              {jadwalMap[dateStr]?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center gap-2 group"
                >
                  {/* NAMA (EDIT) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(item);
                    }}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 
                               rounded-md px-2 py-[2px] cursor-pointer transition 
                               truncate"
                    title={item.paramedic.nama_paramedic}
                  >
                    {item.paramedic.nama_paramedic}
                  </div>
              
                  {/* Tombol Hapus (hanya tampil jika ada permission) */}
                  {hasPermission("jadwal.delete") && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await confirmDialog({
                          title: "Hapus Jadwal",
                          message: [
                            "Hapus jadwal ini?",
                            `ID: ${item.id}`,
                            `Tanggal: ${item.tanggal}`,
                            `posisi: ${item.posisi.nama_posisi}`,
                            `Paramedic: ${item.paramedic.nama_paramedic}`,
                          ].join("\n"),
                          confirmText: "Ya, Hapus",
                          danger: true,
                        });
                        if (ok) {
                          onDelete?.(item.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )
      })}
    </div>
  )
}