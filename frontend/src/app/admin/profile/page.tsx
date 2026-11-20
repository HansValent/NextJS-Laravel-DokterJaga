import ProfileClient from "./ProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Admin - RS St. Carolus",
  description: "Manajemen akun dan keamanan profil pengguna",
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md pb-24">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Profil Saya
      </h1>
      <ProfileClient />
    </div>
  );
}