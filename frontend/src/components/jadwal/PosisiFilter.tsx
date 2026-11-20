"use client"

import { Posisi } from "@/lib/type"

type Props = {
  posisiList: Posisi[]
  selectedposisi: number | ""
  setSelectedposisi: (val: number | "") => void
  loading?: boolean
}

export default function PosisiFilter({
  posisiList,
  selectedposisi,
  setSelectedposisi,
  loading,
}: Props) {
  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <div className="flex gap-2 px-1">

          <button
            onClick={() => setSelectedposisi("")}
            className={`px-5 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap
              ${selectedposisi === "" ? "bg-blue-600 text-white" : ""}
            `}
          >
            Semua
          </button>

          {loading && (
            <span className="px-4 py-2 text-gray-400">
              Loading...
            </span>
          )}

          {!loading &&
            posisiList.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedposisi(sp.id)}
                className={`px-5 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap
                  ${selectedposisi === sp.id ? "bg-blue-600 text-white" : ""}
                `}
              >
                {sp.nama_posisi}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}