import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pacific Island Partners — Hawaii Referral Toolkit",
  description: "UHNW luxury real estate referral intelligence for Hawaii",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className}>
      <body className="flex h-screen overflow-hidden bg-[#0f1117]">
        <Navigation />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
