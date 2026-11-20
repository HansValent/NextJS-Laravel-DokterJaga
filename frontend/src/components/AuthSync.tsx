"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const GRACE_PERIOD = 3000; // Toleransi 3 detik untuk membedakan REFRESH vs CLOSE TAB
    const now = Date.now();

    const activeTabs = parseInt(localStorage.getItem("active_tabs") || "0", 10);
    const lastActiveTime = parseInt(localStorage.getItem("last_active_time") || "0", 10);

    // Jika tab counter bernilai 0 dan waktu penutupan terakhir sudah lewat dari masa tenggang,
    // artinya browser atau seluruh tab benar-benar baru dibuka kembali (bukan refresh halaman).
    if (activeTabs <= 0 && lastActiveTime > 0 && (now - lastActiveTime) > GRACE_PERIOD) {
      // Jalankan Auto-Logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("active_tabs", "0");
      
      // Bersihkan cookie pendamping agar middleware mengenali status logout
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      
      if (pathname.startsWith("/admin")) {
        router.replace("/login");
      }
    }

    // Daftarkan tab baru yang sedang aktif
    const currentTabs = parseInt(localStorage.getItem("active_tabs") || "0", 10);
    localStorage.setItem("active_tabs", (currentTabs + 1).toString());

    // Event saat tab ditutup atau dijalankan penyegaran (refresh)
    const handleBeforeUnload = () => {
      const tabs = parseInt(localStorage.getItem("active_tabs") || "0", 10);
      localStorage.setItem("active_tabs", Math.max(0, tabs - 1).toString());
      localStorage.setItem("last_active_time", Date.now().toString());
    };

    // Sinkronisasi dinamis jika ada aktivitas login/logout di tab lain
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        if (!e.newValue) {
          document.cookie = `${e.key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
          if (pathname.startsWith("/admin")) {
            router.replace("/login");
          }
        } else {
          document.cookie = `${e.key}=${encodeURIComponent(e.newValue)}; path=/; max-age=86400;`;
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router, pathname]);

  return null;
}