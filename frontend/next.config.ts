import type { NextConfig } from "next";
import os from "os"; // 1. Import modul os bawaan Node.js

// 2. Tulis fungsi getLocalIp dengan tipe data TypeScript (: string)
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    
    // Validasi tambahan untuk TypeScript agar tidak memicu error 'object is possibly undefined'
    if (networkInterface) {
      for (const iface of networkInterface) {
        // Cari IPv4 yang aktif dan bukan loopback
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return "127.0.0.1"; // Fallback jika laptop sedang offline
}

// 3. Pasang fungsi ke dalam konfigurasi Next.js
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: getLocalIp(), // Sekarang fungsi sudah terbaca dengan aman
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;