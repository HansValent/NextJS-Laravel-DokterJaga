"use client"
import { useEffect, useState } from "react"

export default function Clock() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()

      const formatted = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      setTime(formatted)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-[20px] font-bold tracking-wider">
      {time} WIB
    </div>
  )
}
