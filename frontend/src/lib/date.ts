import dayjs, { Dayjs } from "dayjs"

export const getMonthRange = (date: Dayjs) => ({
  start: date.startOf("month").format("YYYY-MM-DD"),
  end: date.endOf("month").format("YYYY-MM-DD"),
})

export const getCalendarDays = (date: Dayjs) => {
  const start = date.startOf("month").startOf("week")
  const end = date.endOf("month").endOf("week")

  const days = []
  let day = start

  while (day.isBefore(end)) {
    days.push(day)
    day = day.add(1, "day")
  }

  return days
}
