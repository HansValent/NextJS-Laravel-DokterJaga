import type { PenanggungJawab } from "@/lib/type"

export default function PJBox({ pj }: { pj: PenanggungJawab | null }) {
  return (
    <div className="relative z-50 bg-gradient-to-r from-[#006838] to-[#8DC63F] text-white p-4 rounded-lg min-w-[280px] shadow-lg">
      <table className="text-sm w-full">
        <tbody>
          <tr>
            <td className="w-[130px] font-bold">Perawat</td>
            <td className="font-bold">: {pj?.perawat_nama ?? "-"}</td>
          </tr>
          <tr>
            <td className="font-bold">Kepala Jaga</td>
            <td className="font-bold">: {pj?.kepala_jaga_nama ?? "-"}</td>
          </tr>
          <tr>
            <td className="font-bold">Ponek</td>
            <td className="font-bold">: {pj?.ponek_nama ?? "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
