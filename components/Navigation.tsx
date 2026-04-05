"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Zap, Mail, Users, Settings, LogOut, MapPin, BrainCircuit } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/dashboard",    label: "Pipeline",     icon: LayoutDashboard },
  { href: "/signals",      label: "Signals",      icon: Zap },
  { href: "/intelligence", label: "Intelligence", icon: BrainCircuit },
  { href: "/outreach",     label: "Outreach",     icon: Mail },
  { href: "/leads",        label: "Leads",        icon: Users },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user, demoMode } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-[#EDE8E0] bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#EDE8E0]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1E2761, #2D3A8C)" }}
          >
            <span className="text-[10px] font-bold text-white">PIP</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1A1615] leading-none">Pacific Island</p>
            <p className="text-[10px] text-[#9B958F] mt-0.5 leading-none">Partners</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-[#9B958F] uppercase tracking-widest px-3 mb-2">Tools</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#EEF0FA] text-[#1E2761]"
                  : "text-[#5A534E] hover:text-[#1A1615] hover:bg-[#F5F3EF]"
              }`}
            >
              <Icon
                size={16}
                className={active ? "text-[#1E2761]" : "text-[#9B958F]"}
                style={active ? { color: "#C9A96E" } : {}}
              />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-[#EDE8E0]">
          <p className="text-[10px] font-semibold text-[#9B958F] uppercase tracking-widest px-3 mb-2">Account</p>
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/settings")
                ? "bg-[#EEF0FA] text-[#1E2761]"
                : "text-[#5A534E] hover:text-[#1A1615] hover:bg-[#F5F3EF]"
            }`}
          >
            <Settings
              size={16}
              className={pathname.startsWith("/settings") ? "" : "text-[#9B958F]"}
              style={pathname.startsWith("/settings") ? { color: "#C9A96E" } : {}}
            />
            Settings
            {pathname.startsWith("/settings") && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />}
          </Link>
        </div>
      </nav>

      {/* User + Sign Out */}
      <div className="px-4 py-4 border-t border-[#EDE8E0]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#F5F3EF] flex items-center justify-center flex-shrink-0">
            <MapPin size={12} style={{ color: "#C9A96E" }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1A1615] truncate">
              {demoMode ? "Demo Mode" : (user?.email?.split("@")[0] ?? "Agent")}
            </p>
            <p className="text-[10px] text-[#9B958F] truncate">Island Sotheby's</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#9B958F] hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  );
}
