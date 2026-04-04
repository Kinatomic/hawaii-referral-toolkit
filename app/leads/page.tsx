"use client";

import { useState, useMemo } from "react";
import {
  Users, Search, Filter, Download, Phone, Mail,
  TrendingUp, MapPin, Building2, Star, ExternalLink,
} from "lucide-react";
import { leadsData } from "@/lib/data";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";

function priorityBadge(p: string) {
  if (p === "hot") return "bg-red-900/40 text-red-300 border border-red-700/40";
  if (p === "warm") return "bg-orange-900/40 text-orange-300 border border-orange-700/40";
  return "bg-blue-900/40 text-blue-300 border border-blue-700/40";
}

const SOURCE_COLORS: Record<string, string> = {
  Manual: "bg-purple-900/40 text-purple-300 border-purple-700/40",
  Zillow: "bg-blue-900/40 text-blue-300 border-blue-700/40",
  LinkedIn: "bg-sky-900/40 text-sky-300 border-sky-700/40",
  Sothebys: "bg-amber-900/40 text-amber-300 border-amber-700/40",
  Compass: "bg-green-900/40 text-green-300 border-green-700/40",
};

type Lead = typeof leadsData[0];

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [signalFilter, setSignalFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [sortBy, setSortBy] = useState<"lastActivity" | "listings" | "avgPrice">("lastActivity");

  const filtered = useMemo(() => {
    return leadsData.filter(l =>
      (signalFilter === "all" || l.signalMatch === signalFilter) &&
      (sourceFilter === "all" || l.source === sourceFilter) &&
      (!search || [l.name, l.brokerage, l.market, l.email, l.notes].join(" ").toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, signalFilter, sourceFilter]);

  const stats = {
    total: leadsData.length,
    hot: leadsData.filter(l => l.signalMatch === "hot").length,
    warm: leadsData.filter(l => l.signalMatch === "warm").length,
    sources: new Set(leadsData.map(l => l.source)).size,
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Brokerage", "Market", "Phone", "Email", "Source", "Listings", "Avg Price", "Last Activity", "Signal Match", "Notes"];
    const rows = filtered.map(l => [l.name, l.brokerage, l.market, l.phone, l.email, l.source, l.listings, l.avgPrice, l.lastActivity, l.signalMatch, l.notes]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hawaii_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={22} style={{ color: GOLD }} />
            <h1 className="text-2xl font-bold text-white">Lead Finder CRM</h1>
          </div>
          <p className="text-[#8b95b0] text-sm">Luxury agent contacts · Signal-matched leads · Chrome extension data</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#2a3050] text-[#8b95b0] hover:text-white hover:border-[#3a4570] transition"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: stats.total, sub: "In database" },
          { label: "Hot Signals", value: stats.hot, sub: "High priority" },
          { label: "Warm Signals", value: stats.warm, sub: "Moderate priority" },
          { label: "Data Sources", value: stats.sources, sub: "Collection points" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-4" style={{ borderLeft: `3px solid ${GOLD}` }}>
            <p className="text-[#8b95b0] text-xs font-medium">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-[#8b95b0] text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Chrome Extension Banner */}
      <div className="card p-4 flex items-center justify-between" style={{ borderLeft: `3px solid ${GOLD}` }}>
        <div>
          <p className="text-sm font-semibold text-white">Chrome Extension Lead Finder</p>
          <p className="text-xs text-[#8b95b0] mt-0.5">Captures agent contacts from Zillow, Sotheby's, Compass, Christie's, Douglas Elliman, and 9 other luxury listing sites automatically.</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-900/20 border border-green-800/40 text-green-400 px-3 py-1.5 rounded-full flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Extension installed
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b95b0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full bg-[#1a1f2e] border border-[#2a3050] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#8b95b0] focus:outline-none focus:border-[#3a4570]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-[#8b95b0]" />
          <span className="text-xs text-[#8b95b0]">Signal:</span>
          {["all", "hot", "warm", "cool"].map(f => (
            <button
              key={f}
              onClick={() => setSignalFilter(f)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium capitalize transition-all ${
                signalFilter === f ? "text-white bg-[#1E2761] border border-[#3a4570]" : "text-[#8b95b0] bg-[#1a1f2e] border border-[#2a3050] hover:text-white"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#8b95b0]">Source:</span>
          {["all", "Manual", "Zillow", "Sothebys", "LinkedIn", "Compass"].map(f => (
            <button
              key={f}
              onClick={() => setSourceFilter(f)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                sourceFilter === f ? "text-white bg-[#1E2761] border border-[#3a4570]" : "text-[#8b95b0] bg-[#1a1f2e] border border-[#2a3050] hover:text-white"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table + Detail */}
      <div className="grid grid-cols-3 gap-4">
        {/* Table */}
        <div className={`${selected ? "col-span-2" : "col-span-3"} card overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: NAVY }} className="text-white text-xs">
                {["Agent", "Brokerage", "Market", "Listings", "Avg Price", "Last Activity", "Source", "Signal", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead.id === selected?.id ? null : lead)}
                  className={`border-b border-[#2a3050] cursor-pointer transition-colors ${
                    selected?.id === lead.id ? "bg-[#1E2761]/40" : "hover:bg-[#212840]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{lead.name}</div>
                  </td>
                  <td className="px-4 py-3 text-[#8b95b0] text-xs">{lead.brokerage}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-[#8b95b0] text-xs">
                      <MapPin size={10} />
                      {lead.market}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-center font-medium">{lead.listings}</td>
                  <td className="px-4 py-3 text-green-400 text-xs font-medium">{lead.avgPrice}</td>
                  <td className="px-4 py-3 text-[#8b95b0] text-xs">{lead.lastActivity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SOURCE_COLORS[lead.source] ?? "bg-gray-800 text-gray-300"}`}>
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(lead.signalMatch)}`}>
                      {lead.signalMatch}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b95b0] hover:text-white transition">
                    <ExternalLink size={13} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-[#2a3050] text-xs text-[#8b95b0]">
            Showing {filtered.length} of {leadsData.length} leads
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{selected.name}</h3>
                <p className="text-xs text-[#8b95b0] mt-0.5">{selected.brokerage}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(selected.signalMatch)}`}>
                {selected.signalMatch}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin size={14} style={{ color: GOLD }} />
                <span className="text-[#c8d0e4]">{selected.market}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Building2 size={14} style={{ color: GOLD }} />
                <span className="text-[#c8d0e4]">{selected.brokerage}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone size={14} style={{ color: GOLD }} />
                <a href={`tel:${selected.phone}`} className="text-[#c8d0e4] hover:text-white transition">{selected.phone}</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Mail size={14} style={{ color: GOLD }} />
                <a href={`mailto:${selected.email}`} className="text-[#c8d0e4] hover:text-white transition">{selected.email}</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <TrendingUp size={14} style={{ color: GOLD }} />
                <span className="text-[#c8d0e4]">{selected.listings} listings · avg {selected.avgPrice}</span>
              </div>
            </div>

            <div className="border-t border-[#2a3050] pt-3">
              <p className="text-xs font-semibold text-[#8b95b0] mb-1.5">Signal Note</p>
              <p className="text-sm text-[#c8d0e4]">{selected.notes}</p>
            </div>

            <div className="border-t border-[#2a3050] pt-3">
              <p className="text-xs font-semibold text-[#8b95b0] mb-1.5">Source</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SOURCE_COLORS[selected.source] ?? "bg-gray-800 text-gray-300"}`}>
                {selected.source}
              </span>
            </div>

            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition hover:opacity-90"
              style={{ backgroundColor: GOLD, color: NAVY }}
              onClick={() => {
                window.location.href = `/outreach`;
              }}
            >
              <Mail size={14} /> Generate Outreach
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
