"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useJadwalSocket } from "@/hooks/useJadwalSocket";
import {
  getposisiDisplay,
  getJadwalDisplay,
  getPJDisplay,
  reorderposisi,
  MoD,
  getMoD,
} from "@/services/jadwalService";

import type { PenanggungJawab, Posisi, Jadwal } from "@/lib/type";

/* ================= TYPES ================= */
type ParamedicItem = {
  id: number;
  id_paramedic: number;
  nama: string;
  jenis_paramedic?: string;
  peran?: string;
  tipe_jaga?: string;
};

type DisplayItem = {
  id: number;
  posisi: string;
  paramedic: ParamedicItem[];
  urutan: number;
  kategori_id: number | null;
};

type DisplayGroup = {
  kategori: string;
  kategori_urutan: number;
  kategori_id: number | null;
  items: DisplayItem[];
};

/* ================= HOOK ================= */
export const useJadwalDisplay = () => {
  const [tanggal, setTanggal] = useState(dayjs().format("YYYY-MM-DD"));

  const [posisi, setposisi] = useState<Posisi[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [pjToday, setPjToday] = useState<PenanggungJawab | null>(null);
  const [modData, setModData] = useState<MoD | null>(null);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);

  const isFetchingRef = useRef(false);

  // Fungsi fetch data tanpa AbortController
  const fetchData = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) setLoading(true);
    
    try {
      const [posisiRes, jadwalRes, pjRes, modRes] = await Promise.all([
        getposisiDisplay(),
        getJadwalDisplay(),
        getPJDisplay(),
        getMoD(tanggal),
      ]);

      setposisi(posisiRes || []);
      setJadwal(jadwalRes || []);
      setModData(modRes);

      const pjHariIni = pjRes?.find((p: PenanggungJawab) => p.tanggal === tanggal) ?? null;
      setPjToday(pjHariIni);
    } catch (err: any) {
      console.error("fetch error:", err);
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [tanggal]);

  // Auto fetch saat tanggal berubah atau mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling MoD setiap 5 detik
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const mod = await getMoD(tanggal);
        setModData(mod);
      } catch (e) {
        console.warn("MoD polling error:", e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [tanggal]);

  // Gunakan useMemo dan fetchData(true) agar WebSocket tidak memicu loading loop dan re-registrasi event
  const socketEvents = useMemo(() => ["jadwal-updated", "posisi-updated", "pj-updated"], []);
  useJadwalSocket(socketEvents, useCallback(() => fetchData(true), [fetchData]));

  /* ================= COMPUTED ================= */
  const displayData: DisplayGroup[] = useMemo(() => {
    const grouped: Record<string, DisplayGroup> = {};

    const jadwalHariIni = jadwal.filter(
      (j) => dayjs(j.tanggal).format("YYYY-MM-DD") === tanggal
    );

    posisi.forEach((s) => {
      const kategori = s.kategori_nama || "Tanpa Kategori";

      if (!grouped[kategori]) {
        grouped[kategori] = {
          kategori,
          kategori_urutan: s.kategori_urutan ?? 0,
          kategori_id: s.kategori_id ?? null,
          items: [],
        };
      }

      const paramedicMap = new Map<number, ParamedicItem>();

      jadwalHariIni
        .filter((j) => j.posisi.id === s.id)
        .forEach((j) => {
          paramedicMap.set(j.id, {
            id: j.id, 
            id_paramedic: j.paramedic.id_paramedic,
            nama: j.paramedic.nama_paramedic,
            jenis_paramedic: (j.paramedic as any).jenis_paramedic || "",
            peran: j.peran || "-",
            tipe_jaga: j.tipe_jaga || "-",
          });
        });

      grouped[kategori].items.push({
        id: s.id,
        posisi: s.nama_posisi,
        paramedic: [...paramedicMap.values()],
        urutan: s.urutan ?? 0,
        kategori_id: s.kategori_id ?? null,
      });
    });

    return Object.values(grouped)
      .sort((a, b) => a.kategori_urutan - b.kategori_urutan)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => a.urutan - b.urutan),
      }));
  }, [posisi, jadwal, tanggal]);

  /* ================= CLICK ================= */
  const onClickParamedic = (item: ParamedicItem) => {
    const found = jadwal.find((j) => j.id === item.id);
    if (found) {
      setSelectedJadwal(found);
      setIsModalOpen(true);
    }
  };

  /* ================= REORDER ================= */
  const handleReorderposisi = async (
    items: { id: number; urutan: number; kategori_id: number | null }[]
  ) => {
    try {
      await reorderposisi(items);
      fetchData(true); // Diubah menjadi true (silent) agar tidak flashing loading screen
    } catch (err) {
      console.error("reorder error:", err);
    }
  };

  /* ================= GLOBAL DRAG ================= */
  const handleDragEndGlobal = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    const sourceGroup = displayData.find((group) =>
      group.items.some((i: DisplayItem) => i.id === activeId)
    );
    const targetGroup = displayData.find((group) =>
      group.items.some((i: DisplayItem) => i.id === overId)
    );
    if (!sourceGroup || !targetGroup) return;

    const sourceIndex = sourceGroup.items.findIndex(
      (i: DisplayItem) => i.id === activeId
    );
    const targetIndex = targetGroup.items.findIndex(
      (i: DisplayItem) => i.id === overId
    );
    if (sourceIndex === -1 || targetIndex === -1) return;

    let newSourceItems = [...sourceGroup.items];
    let newTargetItems = [...targetGroup.items];

    if (sourceGroup === targetGroup) {
      newSourceItems = arrayMove(newSourceItems, sourceIndex, targetIndex);
      const payload = newSourceItems.map((item, index) => ({
        id: item.id,
        urutan: index + 1,
        kategori_id: item.kategori_id,
      }));
      await handleReorderposisi(payload);
      return;
    }

    const [moved] = newSourceItems.splice(sourceIndex, 1);
    moved.kategori_id = targetGroup.kategori_id;
    newTargetItems.splice(targetIndex, 0, moved);

    const payload = [
      ...newSourceItems.map((item, index) => ({
        id: item.id,
        urutan: index + 1,
        kategori_id: item.kategori_id,
      })),
      ...newTargetItems.map((item, index) => ({
        id: item.id,
        urutan: index + 1,
        kategori_id: item.kategori_id,
      })),
    ];
    await handleReorderposisi(payload);
  };

  /* ================= RETURN ================= */
  return {
    tanggal,
    tanggalDisplay: dayjs(tanggal).locale("id").format("ddd, DD MMMM YYYY"),
    setTanggal,
    displayData,
    loading,
    onClickParamedic,
    isModalOpen,
    setIsModalOpen,
    selectedJadwal,
    reloadData: fetchData,
    pjToday,
    modData,
    handleReorderposisi,
    handleDragEndGlobal,
  };
};