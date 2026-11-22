import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login | Sistem Informasi Jadwal Dokter Jaga",
  description: "Halaman masuk Sistem Manajemen Jadwal Dokter Jaga",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-sm font-medium text-emerald-800">
              Memuat halaman login...
            </p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}