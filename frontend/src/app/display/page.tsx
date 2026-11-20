import Clock from "@/components/Clock";
import NextImage from "next/image";

/* ================== TYPE ================== */
type JadwalItem = {
  poli: string;
  dokter: string;
};

type DokterItem = {
  dokter: string;
};

type DisplayItem = {
  poli: string;
  dokter: DokterItem[];
};

type ApiResponse = {
  tanggal: string;
  poli: {
    id_poli: number;
    nama_poli: string;
  }[];
  jadwal: JadwalItem[];
  penanggung_jawab?: {
    perawat: string;
    kepala: string;
    ponek: string;
  };
};

/* ================== HELPER ================== */
const normalize = (str: string) => str?.trim().toUpperCase();

const getFontSize = (text: string) => {
  if (!text) return "text-[14px]";
  if (text.length > 25) return "text-[10px]";
  if (text.length > 15) return "text-[12px]";
  return "text-[14px]";
};

/* ================== FETCH ================== */
async function getJadwal(): Promise<ApiResponse> {
  const res = await fetch(
    "http://localhost/admdokter_jaga/web/index.php?r=api/jadwal",
    { cache: "no-store" }
  );

  const json = await res.json();
  return json.data;
}

/* ================== PAGE ================== */
export default async function Page() {
  const api = await getJadwal();

  const allPoli = api.poli || [];

  /* 🔥 GROUPING JADWAL */
  const mapJadwal = new Map<string, JadwalItem[]>();

  api.jadwal.forEach((j) => {
    const key = normalize(j.poli);

    if (!mapJadwal.has(key)) {
      mapJadwal.set(key, []);
    }

    mapJadwal.get(key)!.push(j);
  });

  /* 🔥 DISPLAY DATA */
  const displayData: DisplayItem[] = allPoli.map((poli) => {
    const namaPoli = poli.nama_poli;

    const list = mapJadwal.get(normalize(namaPoli)) || [];

    return {
      poli: namaPoli,
      dokter: list.slice(0, 2),
    };
  });

  const BASE_CARD = 30;
  const BASE_FONT = 12;
  
  const totalCard = displayData.length;
  
  // hitung font dinamis
  const fontSize = Math.max(
    8, // minimum font (jangan lebih kecil dari ini)
    Math.min(
      16, // maksimum font
      (BASE_CARD / totalCard) * BASE_FONT
    )
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-white overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-6 h-[120px]">

        {/* LEFT */}
        <div className="flex items-center gap-3 w-[260px]">
          <div className="w-[140px] h-[140px] relative">
            <NextImage
              src="/images/Logo RS.png"
              alt="Logo RS"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-[16px]">RUMAH SAKIT</div>
            <div className="text-[18px] font-bold">St. Carolus</div>
            <div className="text-[14px]">Melayani Dengan Harapan</div>
          </div>
        </div>

        {/* CENTER */}
        <div className="text-center flex-1">
          <div className="text-[38px] font-extrabold">
            DOKTER JAGA
          </div>
          <div className="text-[18px] font-bold">
            TANGGAL : {api.tanggal}
          </div>
          <Clock />
        </div>

        {/* RIGHT */}
        <div className="w-[100px] h-[100px] relative">
          <NextImage
            src="/images/Logo ICare.png"
            alt="Logo ICare"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-6 gap-[6px] px-4 h-[calc(100vh-190px)] auto-rows-fr">

        {displayData.map((item: DisplayItem, i: number) => (
          <div key={i} className="border flex flex-col">

            {/* POLI */}
            <div
              className={`bg-[#569A45] text-white text-center font-bold px-2 py-1 leading-tight break-words ${getFontSize(
                item.poli
              )}`}
            >
              {item.poli}
            </div>

            {/* DOKTER */}
            <div className="flex flex-col flex-1 bg-[#dcdcdc] px-2 py-1 overflow-hidden">

              {item.dokter.length > 0 ? (
                item.dokter.map((d: DokterItem, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">

                    <div
                      className={`w-2.5 h-2.5 mt-[5px] rounded-full ${
                        idx === 0 ? "bg-black" : "bg-black"
                      }`}
                    />

                    <span
                      className={`leading-tight break-words whitespace-normal ${
                        idx === 0
                          ? "font-bold text-[15px]"
                          : "font-bold text-[14px]"
                      }`}
                    >
                      {d.dokter}
                    </span>

                  </div>
                ))
              ) : (
                <span className="text-[14px] font-bold">-</span>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-6 h-[70px] flex items-center justify-between text-[15px]">

        <div>
          <span className="font-semibold">Perawat Penanggung Jawab:</span>{" "}
          <span className="font-bold">
            {api.penanggung_jawab?.perawat || "-"}
          </span>
        </div>

        <div>
          <span className="font-semibold">Kepala Jaga Rumah Sakit:</span>{" "}
          <span className="font-bold">
            {api.penanggung_jawab?.kepala || "-"}
          </span>
        </div>

        <div>
          <span className="font-semibold">PONEK:</span>{" "}
          <span className="font-bold">
            {api.penanggung_jawab?.ponek || "-"}
          </span>
        </div>

      </div>

    </div>
  );
}
