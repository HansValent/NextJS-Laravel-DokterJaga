"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type User = {
  username: string;
  photo?: string;
};

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [time, setTime] = useState("");
  const [today, setToday] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadUserFromSession = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  // =========================
  // INIT (CLIENT ONLY)
  // =========================
  useEffect(() => {
    setMounted(true);
    loadUserFromSession();

    // tanggal
    setToday(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  // =========================
  // CLOCK
  // =========================
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // SCROLL BEHAVIOR
  // =========================
  useEffect(() => {
    const container = document.querySelector(".main-content") as HTMLElement;
    if (!container) return;

    const handleScroll = () => {
      const current = container.scrollTop;
      if (Math.abs(current - lastScrollY.current) < 2) return;
      setShowHeader(!(current > lastScrollY.current && current > 80));
      lastScrollY.current = current;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("header-hidden", !showHeader);
  }, [showHeader]);

  // =========================
  // CLICK OUTSIDE (MENU)
  // =========================
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    // Opsional: panggil API logout (jika ada)
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
  };

  // =========================
  // GUARD SSR
  // =========================
  if (!mounted) return null;

  const username = currentUser?.username ?? "Guest";
  const photo = currentUser?.photo || "/images/default-user.png";

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <div
        className="header-hover-zone"
        onMouseEnter={() => setShowHeader(true)}
      />

      <div className={`main-header ${showHeader ? "show" : "hide"}`}>
        {/* LEFT */}
        <div className="header-left">
          <Image src="/images/Logo RS.png" alt="Logo" width={55} height={55} />
          <div className="header-text">
            <div className="rs-title-small">RUMAH SAKIT</div>
            <div className="rs-title-main">St. Carolus</div>
            <div className="rs-tagline">Melayani Dengan Harapan</div>
          </div>
        </div>

        {/* CENTER */}
        <div style={{ textAlign: "center" }}>
          <h2 className="text-2xl font-extrabold">DOKTER JAGA</h2>
          <div>
            📅 {today} <br />
            🕒 {time} WIB
          </div>
        </div>

        {/* RIGHT */}
        {!currentUser ? (
          <a href="/login">
            <div className="user-info">
              <div className="user-name">🔐 Login</div>
            </div>
          </a>
        ) : (
          <div className="user-dropdown" ref={menuRef}>
            <div
              className="user-info"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
            >
              <Image src={photo} alt="User" width={35} height={35} />
              <div className="user-name">{username}</div>
            </div>

            {showMenu && (
              <div className="user-menu">
                <button onClick={handleLogout} className="menu-item">
                  🚪 Logout
                </button>
                <div className="menu-divider" />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}