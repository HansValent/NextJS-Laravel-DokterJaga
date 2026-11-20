"use client";

import { useProfile } from "@/hooks/useProfile";
import ChangePasswordModal from "./ChangePasswordModal";
import { User, Shield, Key, LogOut } from "lucide-react";

export default function ProfileClient() {
  const { 
    user, 
    loading, 
    isModalOpen, 
    openModal, 
    closeModal, 
    handleLogout, 
    handleChangePassword,
    actionLoading 
  } = useProfile();

  if (loading) {
    return <div className="text-center py-10 text-gray-500 text-sm">Memuat informasi profil...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-red-500 text-sm">Data pengguna gagal dimuat.</div>;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800">
      {/* Avatar & Identitas */}
      <div className="flex flex-col items-center border-b border-gray-100 dark:border-zinc-800 pb-6 mb-6">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 shadow-inner">
          <User size={38} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
          {user.name}
        </h2>
        <p className="text-xs text-gray-400 mb-2">@{user.username}</p>
        
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-600 dark:text-zinc-400">
          <Shield size={12} />
          <span>{user.role}</span>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="space-y-3">
        <button
          onClick={openModal}
          className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-semibold py-3 px-4 rounded-xl transition duration-200 text-xs"
        >
          <Key size={15} />
          Ubah Password Akun
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold py-3 px-4 rounded-xl transition duration-200 text-xs"
        >
          <LogOut size={15} />
          Keluar Aplikasi
        </button>
      </div>

      {/* Sub-komponen Dialog Ubah Password */}
      <ChangePasswordModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSubmitPassword={handleChangePassword}
        isLoading={actionLoading}
      />
    </div>
  );
}