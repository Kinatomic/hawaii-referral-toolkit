"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Mail,
  Users,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Pipeline", icon: LayoutDashboard },
  { href: "/signals", label: "Signals", icon: Zap },
  { href: "/outreach", label: "Outreach", icon: Mail },
  { href: "/leads", label: "Leads", icon: Users },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-[#2a3050] bg-[#1a1f2e]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2a3050]">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={20} className="text-[#C9A96E]" />
          <span className="font-bold text-white text-sm tracking-wide">Pacific Island</span>
        </div>
        <p className="text-[10px] text-[#8b95b0] uppercase tracking-widest ml-7">Partners</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#1E2761] text-white border border-[#3a4570]"
                  : "text-[#8b95b0] hover:text-white hover:bg-[#212840]"
              }`}
            >
              <Icon size={17} className={active ? "text-[#C9A96E]" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#2a3050]">
        <p className="text-[10px] text-[#8b95b0]">Hawaii Referral Toolkit</p>
        <p className="text-[10px] text-[#8b95b0]">v1.0 · 2026</p>
      </div>
    </aside>
  );
}
