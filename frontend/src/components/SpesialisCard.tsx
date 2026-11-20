"use client"

type ParamedicItem = {
  id: number
  nama: string
}

type Props = {
  posisi: string
  paramedic: ParamedicItem[]
  totalCard: number
  onClickParamedic?: (p: ParamedicItem) => void
}

const getFontSizes = (total: number, posisi: string) => {
  const BASE_CARD = 24
  const scale = Math.max(0.7, Math.min(1.5, BASE_CARD / total))

  let posisiSize = 16 * scale
  if (posisi.length > 15) posisiSize *= 0.75

  return {
    posisi: posisiSize,
    paramedic: 14 * scale,
  }
}

const hasNumber = (text: string) => /\d/.test(text)

export default function posisiCard({
  posisi,
  paramedic,
  totalCard,
  onClickParamedic,
}: Props) {
  const font = getFontSizes(totalCard, posisi)

  const list: ParamedicItem[] =
    paramedic && paramedic.length > 0
      ? paramedic
      : [{ id: 0, nama: "Tidak ada yang ditugaskan" }]

  return (
    <div className="
      flex flex-col h-full
      rounded-lg overflow-hidden
      shadow-md
      bg-white
      transition-all duration-200
      hover:scale-[1.01]
    ">

      {/* ================= HEADER ================= */}
      <div
        style={{
          fontSize: font.posisi,
          lineHeight: 1.1,
        }}
        className="
          bg-[#569A45]
          text-white
          text-center
          font-bold
          px-2 py-1
          break-words
          font-raleway
          tracking-wide
        "
      >
        {posisi}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="
        flex flex-col flex-1
        bg-[#dcdcdc]
        px-2 py-1
        overflow-y-auto
      ">

        {list.map((p) => {
          const isNum = hasNumber(p.nama)
          const isDummy = p.id === 0

          return (
            <div
              key={p.id}
              className="flex items-start gap-2 mb-1 animate-[fadeIn_0.3s_ease]"
            >
              {/* BULLET */}
              <div className="w-2.5 h-2.5 mt-[5px] rounded-full bg-black shrink-0" />

              {/* TEXT */}
              <span
                onClick={() =>
                  !isDummy && onClickParamedic?.(p)
                }
                style={{
                  fontSize: font.paramedic,
                  lineHeight: 1.2,
                }}
                className={`
                  break-words font-bold
                  ${isDummy
                    ? "opacity-50 cursor-default"
                    : "cursor-pointer hover:text-blue-600 transition-colors"}
                  ${isNum ? "font-nunito" : "font-raleway"}
                `}
              >
                {p.nama}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
