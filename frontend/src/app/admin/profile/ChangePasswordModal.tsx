"use client";

import { useState } from "react";
// 1. Import Icon Eye dan EyeOff
import { X, Loader2, Eye, EyeOff } from "lucide-react";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPassword: (password: string) => Promise<void>;
  isLoading: boolean;
};

export default function ChangePasswordModal({ 
  isOpen, 
  onClose, 
  onSubmitPassword,
  isLoading 
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // 2. Tambahkan state untuk toggle visibility
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  // Fungsi reset form dan state saat menutup modal
  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false); // Reset toggle mata
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Silakan isi semua kolom!");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru minimal berukuran 6 karakter!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi sandi baru tidak sesuai!");
      return;
    }

    try {
      await onSubmitPassword(newPassword);
      setSuccess("Sandi berhasil diperbarui!");
      setTimeout(() => {
        handleClose(); // Gunakan handleClose yang mereset form
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan pada server saat merubah sandi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-6 shadow-xl relative border border-gray-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-bold text-gray-800 dark:text-zinc-100">Ubah Keamanan Sandi</h3>
          <button 
            type="button"
            disabled={isLoading}
            // Gunakan handleClose
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifikasi Status */}
        {error && <div className="mb-3 text-[11px] p-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg">{error}</div>}
        {success && <div className="mb-3 text-[11px] p-2.5 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-lg">{success}</div>}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                // 🌟 PERBAIKAN: Menambahkan text warna & placeholder warna yang kontras
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 pr-10 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 disabled:opacity-50"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                // 🌟 PERBAIKAN: Menambahkan text warna & placeholder warna yang kontras
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 pr-10 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 disabled:opacity-50"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        
          {/* Form Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-medium py-2 rounded-xl text-xs transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={13} className="animate-spin" />}
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}