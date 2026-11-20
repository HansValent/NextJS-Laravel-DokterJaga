import dayjs from "dayjs"

type Props = {
  view: "month" | "year"
  currentDate: dayjs.Dayjs
  prev: () => void
  next: () => void
  setView: (v: "month" | "year") => void
  setCurrentDate: (date: dayjs.Dayjs) => void
}

// Definisikan array bulan secara manual
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export default function CalendarNav({ view, currentDate, prev, next, setView, setCurrentDate }: Props) {
  const years = Array.from({ length: 10 }, (_, i) => dayjs().year() - 5 + i)

  return (
    <div className="flex justify-start items-center">
      <div className="flex items-center gap-2">
        <button onClick={prev} className="px-4 py-2 border rounded text-lg font-semibold">←</button>

        {/* Pilihan bulan */}
        <select
          value={currentDate.month()}
          onChange={(e) => setCurrentDate(currentDate.month(Number(e.target.value)))}
          className="border rounded px-3 py-2 text-base font-medium"
        >
          {MONTHS.map((month: string, idx: number) => (
            <option key={idx} value={idx}>{month}</option>
          ))}
        </select>

        {/* Pilihan tahun */}
        <select
          value={currentDate.year()}
          onChange={(e) => setCurrentDate(currentDate.year(Number(e.target.value)))}
          className="border rounded px-3 py-2 text-base font-medium"
        >
          {years.map((y: number) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button onClick={next} className="px-4 py-2 border rounded text-lg font-semibold">→</button>
      </div>
      
    </div>
  )
}