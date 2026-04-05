"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useIsAuthenticated();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/");
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <Loader2 size={24} className="animate-spin text-[#C9A96E]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8]">
      <Navigation />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
