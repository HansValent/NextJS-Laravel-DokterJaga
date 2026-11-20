"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/services/api";

// 1. Perbarui tipe data agar menampung id dan name dari backend
export type UserProfile = {
  id: number;
  name: string;
  username: string;
  role: string;
  photo?: string;
};

export function useProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Ambil data user dari localStorage saat client-side mounted
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        
        // Simpan id dan name ke state untuk keperluan update password ke backend
        setUser({
          id: parsedUser.id,
          name: parsedUser.name || "User",
          username: parsedUser.username || "User",
          role: parsedUser.roles?.[0] || parsedUser.role || "Administrator",
          photo: parsedUser.photo,
        });
      } catch (e) {
        console.error("Gagal membaca data user", e);
      }
    }
    setLoading(false);
  }, []);

  // 2. Fungsi untuk mengubah password terintegrasi ke API Laravel
  const handleChangePassword = async (password: string) => {
    if (!user?.id) {
      throw new Error("ID Pengguna tidak ditemukan. Silakan login kembali.");
    }

    setActionLoading(true);
    try {
      // Menembak endpoint PUT /api/users/{id} sesuai konfigurasi api.php
      // Mengirimkan name, username, dan status agar lolos validasi UsersController backend
      await fetchAPI(`/api/users/${user.id}`, {
        method: "PUT",
        body: {
          name: user.name,
          username: user.username,
          status: "active", // default status aktif bagi user yang sedang login
          password: password,
        },
      });
    } catch (error: any) {
      // Melemparkan error agar ditangkap oleh komponen ChangePasswordModal
      throw new Error(error.message || "Gagal memperbarui password.");
    } finally {
      setActionLoading(false);
    }
  };

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 3. PASTIKAN handleChangePassword dan actionLoading IKUT DI-RETURN
  return {
    user,
    loading,
    isModalOpen,
    openModal,
    closeModal,
    handleLogout,
    handleChangePassword,
    actionLoading,        
  };
}