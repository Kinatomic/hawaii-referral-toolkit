import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pacific Island Partners — Hawaii Referral Toolkit",
  description: "The private real estate intelligence network for Hawaii's most exclusive market.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen bg-[#FAFAF8]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
