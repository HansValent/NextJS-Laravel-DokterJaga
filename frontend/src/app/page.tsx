"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useJadwalDisplay } from "@/hooks/useJadwalDisplay";
import JadwalFormModal from "@/components/jadwal/JadwalFormModal";
import SortableItem from "@/components/SortableItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { User } from "@/lib/type";

type FilterChip = "semua" | "bertugas" | "kosong" | "igd" | "bedah" | "dalam" | "penunjang";

const Clock = dynamic(() => import("@/components/Clock"), { ssr: false });

export default function HomePage() {
  const {
    tanggal,
    tanggalDisplay,
    displayData,
    loading,
    onClickParamedic,
    isModalOpen,
    setIsModalOpen,
    selectedJadwal,
    reloadData,
    pjToday,
    modData,
    handleDragEndGlobal,
  } = useJadwalDisplay();

  // ================= MOBILE STATE =================
  const [activeFilter, setActiveFilter] = useState<FilterChip>("semua");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUsers(JSON.parse(storedUser));
    }
  }, []);

  // ================= FILTER DATA UNTUK MOBILE =================
  const filteredData = useMemo(() => {
    let result = [...displayData];

    if (activeFilter !== "semua") {
      if (activeFilter === "bertugas") {
        result = result.map(group => ({
          ...group,
          items: group.items.filter(item => item.paramedic.length > 0)
        })).filter(group => group.items.length > 0);
      } else if (activeFilter === "kosong") {
        result = result.map(group => ({
          ...group,
          items: group.items.filter(item => item.paramedic.length === 0)
        })).filter(group => group.items.length > 0);
      } else {
        const keyword = activeFilter === "igd" ? "gawat" :
                       activeFilter === "bedah" ? "bedah" :
                       activeFilter === "dalam" ? "dalam" :
                       "penunjang";
        result = result.filter(group =>
          group.kategori.toLowerCase().includes(keyword)
        );
      }
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.posisi.toLowerCase().includes(kw) ||
          item.paramedic.some(p => p.nama.toLowerCase().includes(kw))
        )
      })).filter(group => group.items.length > 0);
    }

    return result;
  }, [displayData, activeFilter, searchKeyword]);

  // ================= SENSORS =================
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-xl font-black font-[family-name:var(--font-nunito)] text-[#1A2E1A]">
        Loading...
      </div>
    );
  }

  return (
    <div className="font-[family-name:var(--font-nunito)] bg-[#F4F8F4] text-[#1A2E1A] min-h-screen selection:bg-[#569A45]/30 overflow-hidden select-none">
      
      {/* ================= DESKTOP / TV MODE (RESPONSIVE PROPORSI LAYAR BESAR - ANTI SCROLL 100vh) ================= */}
      <div className="hidden min-[1200px]:grid w-screen h-screen grid-rows-[10vh_1fr_6vh] p-[1.5vh_1.5vw_1vh] bg-[#F4F8F4] overflow-hidden box-border">
        
        {/* --- HEADER --- */}
        <div className="relative flex items-center px-[2vw] mb-[1.5vh] bg-gradient-to-br from-[#127F3F] via-[#569A45] to-[#73B045] rounded-xl shadow-[0_4px_24px_rgba(18,127,63,0.15)] overflow-hidden shrink-0">
          <div className="relative z-10 bg-white p-[0.6vh] rounded-xl shadow-md flex items-center justify-center">
            <img src="/images/logo.webp" alt="Logo RS" className="h-[5.5vh] w-auto object-contain" />
          </div>

          <div className="w-[2px] h-[5.5vh] mx-[1.5vw] bg-white/30 shrink-0 relative z-10"></div>

          <div className="relative z-10 flex-1">
            <div className="font-[family-name:var(--font-raleway)] text-[4.2vh] font-black text-white leading-none tracking-[4px] uppercase">DOKTER JAGA</div>
            <div className="mt-[0.4vh] text-[1.2vh] font-bold text-white/70 tracking-[3px] uppercase">Jadwal Dokter Penanggung Jawab</div>
          </div>

          <div className="relative z-10 flex items-center gap-[1.5vw] shrink-0">
            <div className="flex items-center gap-[0.5vw] py-[0.4vh] px-[1vw] bg-white/12 border-[1.5px] border-white/28 rounded-full">
              <div className="w-[0.8vh] h-[0.8vh] bg-white rounded-full shadow-[0_0_8px_#fff] animate-pulse"></div>
              <div className="font-[family-name:var(--font-raleway)] text-[1.1vh] font-black text-[#a3ff6e] uppercase tracking-[2px]">Live</div>
            </div>
            <div className="text-right">
              <div className="font-[family-name:var(--font-raleway)] text-[3.8vh] font-black text-white leading-none tracking-[1px]"><Clock /></div>
              <div className="mt-[0.2vh] text-[1.2vh] font-extrabold text-white/75 tracking-[0.5px]">{tanggalDisplay}</div>
            </div>
          </div>
        </div>

        {/* --- BODY (Proporsi Flexbox Dinamis & Anti Tenggelam) --- */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndGlobal}>
          <div className="flex gap-[1.2vw] h-full min-h-0 overflow-hidden w-full">
            
            {/* Kategori posisi (Kiri & Tengah) */}
            <div className="flex-1 grid grid-flow-col auto-cols-fr gap-[1vw] h-full min-h-0 overflow-hidden">
              {displayData.map((group) => (
                <div key={group.kategori} className="min-h-0 h-full flex flex-col gap-[1vh] overflow-hidden">
                  
                  {/* Judul Kolom Kategori */}
                  <div className="font-[family-name:var(--font-raleway)] shrink-0 text-[1.5vh] font-black tracking-[2px] uppercase text-[#569A45] px-[0.2vw] pb-[0.5vh] border-b-2 border-[#73B045] truncate">
                    {group.kategori}
                  </div>

                  {/* Menggunakan Susunan Flex Vertikal dengan kalkulasi porsi ukuran isi otomatis */}
                  <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex-1 flex flex-col gap-[0.6vh] min-h-0 overflow-hidden h-full w-full">
                      {group.items.map((item) => {
                        const isIgd = item.posisi.toLowerCase().includes("igd");
                        const isManyParamedis = item.paramedic.length > 2;
                        
                        return (
                          <SortableItem 
                            key={item.id} 
                            id={item.id} 
                            className={`${isManyParamedis ? 'flex-[2_2_auto]' : 'flex-auto'} min-h-0 w-full flex flex-col`}
                          >
                            <div className="bg-white border border-[#D4E4D4] rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(18,127,63,0.08)] flex-1 min-h-0 flex flex-col justify-between">
                              
                              {/* Header Card */}
                              <div className="flex items-center p-[0.4vh_0.6vw] border-b border-[#D4E4D4] relative shrink-0">
                                <div className={`absolute left-0 top-0 bottom-0 w-[0.3vw] ${isIgd ? 'bg-gradient-to-b from-[#B72227] to-[#D42027]' : 'bg-gradient-to-b from-[#569A45] to-[#73B045]'}`}></div>
                                <div className={`font-[family-name:var(--font-raleway)] text-[1.3vh] font-black tracking-[0.5px] uppercase ml-[0.5vw] truncate ${isIgd ? 'text-[#B72227]' : 'text-[#3A5A3A]'}`}>
                                  {item.posisi}
                                </div>
                              </div>

                              {/* Isi / Paramedic List (Gap & padding menyusut proporsional jika jumlah dokter banyak) */}
                              <div className={`p-[0.4vh_0.6vw_0.4vh_0.8vw] flex-1 min-h-0 flex flex-col justify-center overflow-hidden ${isManyParamedis ? 'gap-[0.2vh]' : 'gap-[0.4vh]'}`}>
                                {item.paramedic.length === 0 ? (
                                  <div className="text-[1.2vh] font-semibold italic text-[#999999] truncate">Belum ditugaskan</div>
                                ) : (
                                  item.paramedic.map((p: any) => {
                                    const hasPeran = p.peran && p.peran !== '-';
                                    const hasTipeJaga = p.tipe_jaga && p.tipe_jaga !== '-';
                                  
                                    const tipeJagaRaw = (p.tipe_jaga || "").toLowerCase();
                                    const jamInfo =
                                      tipeJagaRaw.includes('pagi')
                                        ? '[06.00-18.00]'
                                        : tipeJagaRaw.includes('malam')
                                        ? '[18.00-06.00]'
                                        : null;
                                  
                                    return (
                                      <div 
                                        key={p.id} 
                                        className={`flex items-center gap-[0.4vw] min-w-0 cursor-pointer hover:bg-emerald-50/60 rounded transition-colors duration-150 ${isManyParamedis ? 'p-[0.1vh]' : 'p-[0.2vh]'}`}
                                        onClick={() => onClickParamedic(p)}
                                      >
                                        {/* Badge jenis paramedic */}
                                        <div className={`shrink-0 bg-[#E6F4EC] text-[#569A45] font-black px-[0.3vw] py-[0.1vh] rounded leading-none ${isManyParamedis ? 'text-[0.9vh]' : 'text-[1vh]'}`}>
                                          {p.jenis_paramedic || '-'}
                                        </div>
                                    
                                        {/* Nama – Teks extrabold & scaling mikro otomatis */}
                                        <div className="flex-1 min-w-0">
                                          <div className={`text-[#1A2E1A] font-extrabold leading-tight break-words ${isManyParamedis ? 'text-[1.1vh]' : 'text-[1.25vh]'}`}>
                                            {p.nama}
                                          </div>
                                        </div>
                                    
                                        {/* Label Jaga + Jam */}
                                        <div className="shrink-0 flex flex-col items-end gap-[0.1vh]">
                                          {hasPeran && (
                                            <div className={`font-black text-[#127F3F] bg-[#D4EDDA] px-[0.4vw] py-[0.1vh] rounded border border-[#C3E6CB] whitespace-nowrap leading-none ${isManyParamedis ? 'text-[0.8vh]' : 'text-[0.95vh]'}`}>
                                              {p.peran}
                                            </div>
                                          )}
                                          
                                          {hasTipeJaga && (
                                            <div className={`font-black text-[#569A45] bg-[#E6F4EC] px-[0.4vw] py-[0.1vh] rounded border border-[#D4E4D4]/50 whitespace-nowrap leading-none ${isManyParamedis ? 'text-[0.8vh]' : 'text-[0.95vh]'}`}>
                                              {p.tipe_jaga}
                                            </div>
                                          )}
                                          
                                          {jamInfo && (
                                            <div className={`font-bold text-[#000000] bg-[#E6F4EC] px-[0.3vw] py-[0.1vh] rounded leading-none whitespace-nowrap ${isManyParamedis ? 'text-[0.75vh]' : 'text-[0.9vh]'}`}>
                                              {jamInfo}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>

            {/* --- MoD (Manager on Duty) --- */}
            <div className="w-[16vw] shrink-0 flex flex-col justify-center gap-[2vh] h-full min-h-0 overflow-hidden border-l border-[#D4E4D4]/60 pl-[1vw]">
              <div className="font-[family-name:var(--font-raleway)] shrink-0 text-[2vh] font-black tracking-[2px] uppercase text-[#569A45] pb-[0.8vh] border-b-2 border-[#73B045] truncate">
                MoD - Manager on Duty
              </div>

              <div className="flex-1 flex flex-col gap-[1vh] min-h-0">
                {["pagi", "sore", "malam"].map((shift) => {
                  const shiftData = modData?.[shift as keyof typeof modData];
                  const namaPetugas = typeof shiftData === "object" && shiftData !== null && "nama" in shiftData 
                    ? (shiftData as { nama: string }).nama 
                    : "-";
                
                  return (
                    <div key={shift} className="flex-1 min-h-0 flex flex-col gap-[0.5vh] bg-gradient-to-br from-[#f0faf3] to-[#e6f4ec] rounded-2xl p-[1.2vh_0.8vw] border border-[#D4E4D4] shadow-md justify-center">
                      <div className="font-[family-name:var(--font-raleway)] text-[1.4vh] font-black tracking-[1px] uppercase text-[#569A45] text-center shrink-0">
                        Petugas {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </div>
                  
                      <div className="flex flex-col items-center justify-center gap-[0.4vh] min-h-0 overflow-hidden">
                        <span className="font-[family-name:var(--font-raleway)] text-[2vh] font-extrabold text-[#2C3E2C] leading-tight text-center break-words">
                          {namaPetugas}
                        </span>
                        <div className="bg-gradient-to-br from-[#1faa59] to-[#28c76f] text-white text-[1.1vh] font-black py-[0.2vh] px-[0.5vw] rounded-full shrink-0">
                          JAGA
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </DndContext>

        {/* --- FOOTER --- */}
        <div className="flex items-center h-full px-[1.5vw] mt-[1vh] bg-white border border-[#D4E4D4] rounded-lg shadow-[0_2px_8px_rgba(18,127,63,0.06)] shrink-0">
          {[
            { label: "Tanggal", val: tanggalDisplay },
            { label: "Perawat", val: pjToday?.perawat_nama },
            { label: "Kepala Jaga", val: pjToday?.kepala_jaga_nama },
            { label: "PONEK", val: pjToday?.ponek_nama },
          ].map((foot, idx) => (
            <div key={foot.label} className="flex items-center">
              {idx > 0 && <div className="w-[1px] h-[3vh] bg-[#D4E4D4]"></div>}
              <div className="flex items-center gap-[0.8vw] px-[1.2vw]">
                <span className="font-[family-name:var(--font-raleway)] text-[1.1vh] font-extrabold text-[#6A8A6A] uppercase tracking-[2px]">{foot.label}</span>
                <span className="text-[1.6vh] font-black text-[#1A2E1A] whitespace-nowrap">{foot.val || "-"}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center ml-auto font-[family-name:var(--font-raleway)] text-[1.2vh] font-black text-[#6A8A6A]">
            Sistem Manajemen Jadwal Dokter
          </div>
        </div>
      </div>

      {/* ================= MOBILE MODE ================= */}
      <div className="block min-[1200px]:hidden bg-[#F4F8F4] min-h-screen pb-[240px] text-[#1A2E1A]">
        {/* Header */}
        <header className="bg-gradient-to-br from-[#127F3F] to-[#82B040] p-[15px] text-white flex flex-col sticky top-0 z-[100] gap-3 border-b border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-white p-2 rounded-xl w-fit shadow-md flex items-center justify-center">
              <img src="/images/logo.webp" alt="Logo RS" className="w-[125px] h-auto object-contain" />
            </div>

            <div className="flex flex-col items-end text-right text-white">
              <div className="text-sm font-bold"><Clock /></div>
              <div className="text-[10px] opacity-90">{tanggalDisplay}</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-1">
            <h1 className="text-xl font-extrabold text-white tracking-wide">DOKTER JAGA</h1>
            <div className="inline-flex items-center gap-1.5 font-extrabold text-[#6FFF00] bg-white/20 py-1 px-2.5 rounded-full text-[10px] uppercase before:content-[''] before:block before:w-2 before:h-2 before:bg-white before:rounded-full before:animate-ping">
              LIVE
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-[4px_0_4px_0]">
            <div className="relative flex items-center bg-white border-[1.5px] border-[#D4E4D4] rounded-xl p-[2px_8px] shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all duration-200 focus-within:border-[#569A45] focus-within:shadow-[0_2px_8px_rgba(86,154,69,0.15)]">
              <input
                type="text"
                className="w-full border-none outline-none p-[10px_32px_10px_8px] text-sm text-[#1A2E1A] bg-transparent placeholder-[#6A8A6A]"
                placeholder="Cari Posisi atau nama dokter..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button className="absolute right-10 bg-none border-none text-lg text-[#99AAAA] cursor-pointer" onClick={() => setSearchKeyword("")}>
                  &times;
                </button>
              )}
              <button className="bg-none border-none text-base cursor-pointer p-1 text-[#569A45]">🔍</button>
            </div>
            {searchKeyword && (
              <div className="text-xs text-white/90 mt-1.5 pl-1 font-medium italic">
                Hasil pencarian untuk "{searchKeyword}"
              </div>
            )}
          </div>
        </header>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto p-[12px_16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["semua", "bertugas", "kosong", "igd", "bedah", "dalam", "penunjang"] as FilterChip[]).map((filter) => (
            <div
              key={filter}
              className={`bg-white border border-[#D4E4D4] text-[#3A5A3A] p-[8px_16px] rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] ${
                activeFilter === filter ? "!bg-[#569A45] !border-[#569A45] !text-white shadow-[0_3px_8px_rgba(86,154,69,0.25)]" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </div>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-[4px_16px_16px_16px] flex flex-col gap-5">
          {filteredData.map((group) => {
            if (group.items.length === 0) return null;

            return (
              <div key={group.kategori} className="flex flex-col gap-[10px]">
                <div className="font-[family-name:var(--font-raleway)] text-xs font-black text-[#569A45] tracking-[1px] pl-[2px]">
                  {group.kategori.toUpperCase()}
                </div>
                {group.items.map((item) => {
                  const isIgd = item.posisi.toLowerCase().includes("igd");
                  return (
                    <div key={item.id} className={`bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-transform duration-200 border-l-[5px] ${isIgd ? "border-l-[#D42027]" : "border-l-[#569A45]"}`}>
                      <div className="p-[10px_14px] border-b border-[#F0F4F0] bg-gradient-to-r from-white to-[#FAFDFF]">
                        <div className={`font-[family-name:var(--font-raleway)] text-sm font-bold ${isIgd ? "text-[#B72227]" : "text-[#006838]"}`}>{item.posisi}</div>
                      </div>
                      <div className="p-[4px_14px]">
                        {item.paramedic.length === 0 ? (
                          <div className="py-3 text-xs italic text-[#999999]">Belum ditugaskan</div>
                        ) : (
                          item.paramedic.map((p: any) => {
                            const hasPeran = p.peran && p.peran !== '-';
                            const hasTipeJaga = p.tipe_jaga && p.tipe_jaga !== '-';
                          
                            const tipeJagaRaw = (p.tipe_jaga || p.tipeJaga || '').toLowerCase();
                            const jamInfo =
                              tipeJagaRaw.includes('pagi')
                                ? '[06.00 - 18.00]'
                                : tipeJagaRaw.includes('malam')
                                ? '[18.00 - 06.00]'
                                : null;
                          
                            return (
                              <div
                                key={p.id}
                                className="flex items-start justify-between py-[10px] border-b border-[#F5FAFD] last:border-b-0 cursor-pointer gap-2"
                                onClick={() => onClickParamedic(p)}
                              >
                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                  <div className="shrink-0 bg-[#E6F4EC] text-[#569A45] text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 leading-none">
                                    {p.jenis_paramedic || '-'}
                                  </div>
                            
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-[#2C3E2C] leading-tight break-words">
                                      {p.nama}
                                    </div>
                                  </div>
                                </div>
                            
                                <div className="flex items-start gap-1.5 shrink-0">
                                  <div className="flex flex-col items-end gap-0.5 mt-0.5">
                                    {hasPeran && (
                                      <span className="text-[10px] font-bold text-[#127F3F] bg-[#D4EDDA] px-1.5 py-0.5 rounded-md whitespace-nowrap leading-tight">
                                        {p.peran}
                                      </span>
                                    )}
                                    
                                    {hasTipeJaga && (
                                      <span className="text-[10px] font-bold text-[#569A45] bg-[#E6F4EC] px-1.5 py-0.5 rounded-md whitespace-nowrap leading-tight">
                                        {p.tipe_jaga}
                                      </span>
                                    )}
                                    
                                    {jamInfo && (
                                      <span className="text-[10px] text-[#6A8A6A] font-medium bg-[#E6F4EC] px-1.5 py-0.5 rounded-md whitespace-nowrap leading-tight">
                                        {jamInfo}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredData.every((group) => group.items.length === 0) && (
            <div className="text-center py-8 text-[#6A8A6A] italic text-sm">Tidak ada jadwal dokter yang cocok.</div>
          )}

          {/* MoD Section Sticky/Fixed Bottom Boundary */}
          <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-br from-white to-[#F4FCF6] border border-[#D4E4D4] rounded-t-xl p-[10px_15px] border-t border-t-[#E2E8F0] shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40">
            <div className="font-[family-name:var(--font-raleway)] text-[13px] font-black text-[#127F3F] mb-2">📋 MoD – Manager on Duty</div>
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const dapatkanNamaMoD = (shiftObj: any) => {
                  return typeof shiftObj === "object" && shiftObj !== null && "nama" in shiftObj 
                    ? shiftObj.nama 
                    : "-";
                };

                return [
                  { label: "MoD Pagi", val: dapatkanNamaMoD(modData?.pagi) },
                  { label: "MoD Sore", val: dapatkanNamaMoD(modData?.sore) },
                  { label: "MoD Malam", val: dapatkanNamaMoD(modData?.malam) },
                ].map((mod) => (
                  <div key={mod.label} className="bg-white border border-[#E2EEE2] rounded-lg p-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.01)] min-w-0">
                    <div className="text-[11px] text-[#6A8A6A] mb-0.5 font-medium">{mod.label}</div>
                    <div className="text-xs font-bold text-[#1A2E1A] truncate">{mod.val}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#D4E4D4] grid grid-cols-4 items-center text-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50">
          {[
            { label: "Tanggal", val: tanggal },
            { label: "Perawat", val: pjToday?.perawat_nama },
            { label: "Kepala Jaga", val: pjToday?.kepala_jaga_nama },
            { label: "PONEK", val: pjToday?.ponek_nama },
          ].map((fItem) => (
            <div key={fItem.label} className="flex flex-col gap-0.5 min-w-0">
              <div className="text-[10px] text-[#6A8A6A] uppercase font-semibold tracking-[0.5px]">{fItem.label}</div>
              <div className="text-xs font-bold text-[#1A2E1A] whitespace-nowrap overflow-hidden text-ellipsis px-1">{fItem.val || "-"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <JadwalFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            reloadData();
          }}
          editData={selectedJadwal}
          tanggal={tanggal}
        />
      )}
    </div>
  );
}