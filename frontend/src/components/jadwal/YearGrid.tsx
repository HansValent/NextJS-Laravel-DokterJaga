import dayjs from "dayjs"

type YearGridProps = {
  currentDate: dayjs.Dayjs
  setCurrentDate: (d: dayjs.Dayjs) => void
  setView: (v: "month") => void
  onDateClick?: (date: string) => void // ✅ TAMBAH INI
}

export default function YearGrid({
  currentDate,
  setCurrentDate,
  setView,
  onDateClick,
}: YearGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, i) => {
        const m = currentDate.month(i)

        return (
          <div
            key={i}
            onClick={() => {
              setCurrentDate(m)
              setView("month")
              onDateClick?.(m.format("YYYY-MM-DD")) 
            }}
            className="border p-6 text-center cursor-pointer hover:bg-green-100 rounded"
          >
            <div className="font-bold text-lg">
              {m.format("MMMM")}
            </div>
          </div>
        )
      })}
    </div>
  )
}
