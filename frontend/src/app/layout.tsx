import type { Metadata } from "next";
import { Raleway, Nunito } from "next/font/google"
import "./globals.css";
import AuthSync from "@/components/AuthSync";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
})

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Dokter Jaga St. Carolus",
  description: "Dokter Jaga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${raleway.variable} ${nunito.variable}`}>
          <AuthSync />
        {children}
      </body>
    </html>
  );
}
