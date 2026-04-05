"use client";

import { useState, useMemo } from "react";
import { Users, Search, Filter, Download, Phone, Mail, TrendingUp, MapPin, Building2, ExternalLink } from "lucide-react";
import { leadsData } from "@/lib/data";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";

type Lead = typeof leadsData[0];

function PriorityBadge({ p }: { p: string }) {
  const cls = p === "hot" ? "bg-red-50 text-red-700 border-red-200" : p === "warm" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";
  const dot = p === "hot" ? "bg-red-500" : p === "warm" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${cls}`}><span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{p}</span>;
}

const SOURCE_COLORS: Record<string, string> = {
  Manual: "bg-purple-50 text-purple-700 border-purple-200",
  Zillow: "bg-blue-50 text-blue-700 border-blue-200",
  LinkedIn: "bg-sky-50 text-sky-700 border-sky-200",
  Sothebys: "bg-amber-50 text-amber-700 border-amber-200",
  Compass: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = useMemo(() => leadsData.filter(l =>
    (sf === "all" || l.signalMatch === sf) &&
    (sourceFilter === "all" || l.source === sourceFilter) &&
    (!search || [l.name, l.brokerage, l.market, l.email, l.notes].join(" ").toLowerCase().includes(search.toLowerCase()))
  ), [search, sf, sourceFilter]);

  const handleExportCSV = () => {
    const headers = ["Name","Brokerage","Market","Phone","Email","Source","Listings","Avg Price","Last Activity","Signal Match","Notes"];
    const rows = filtered.map(l => [l.name,l.brokerage,l.market,l.phone,l.email,l.source,l.listings,l.avgPrice,l.lastActivity,l.signalMatch,l.notes]);
    const csv = [headers,...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "hawaii_leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Users size={20} style={{ color: GOLD }} /><h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Lead Finder CRM</h1></div>
          <p className="text-sm text-[#9B958F]">Luxury agent contacts · Signal-matched · Chrome extension data</p>
        </div>
        <button onClick={handleExportCSV} className="btn-outline flex items-center gap-2 text-sm px-4 py-2"><Download size={13} /> Export CSV</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{label:"Total Leads",value:leadsData.length,sub:"In database"},{label:"Hot Signals",value:leadsData.filter(l=>l.signalMatch==="hot").length,sub:"High priority"},{label:"Warm Signals",value:leadsData.filter(l=>l.signalMatch==="warm").length,sub:"Moderate"},{label:"Data Sources",value:new Set(leadsData.map(l=>l.source)).size,sub:"Collection points"}].map(({label,value,sub}) => (
          <div key={label} className="card p-4" style={{ borderTop: `2px solid ${GOLD}` }}>
            <p className="text-xs font-medium text-[#9B958F]">{label}</p>
            <p className="text-2xl font-semibold text-[#1A1615] mt-1">{value}</p>
            <p className="text-xs text-[#9B958F] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 flex items-center justify-between" style={{ borderLeft: `3px solid ${GOLD}` }}>
        <div><p className="text-sm font-semibold text-[#1A1615]">Chrome Extension Lead Finder</p><p className="text-xs text-[#9B958F] mt-0.5">Captures agent contacts from Zillow, Sotheby's, Compass, Christie's, Douglas Elliman, and 9 other luxury listing sites automatically.</p></div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex-shrink-0 ml-4"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Extension installed</div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2B9B0]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…" className="input-base pl-9 text-sm" /></div>
        <div className="flex items-center gap-1.5"><Filter size={12} className="text-[#C2B9B0]" /><span className="text-xs text-[#9B958F]">Signal:</span>{["all","hot","warm","cool"].map(f => <button key={f} onClick={() => setSf(f)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${sf===f?"bg-[#1E2761] text-white":"bg-white border border-[#EDE8E0] text-[#5A534E] hover:bg-[#F5F3EF]"}`}>{f==="all"?"All":f}</button>)}</div>
        <div className="flex items-center gap-1.5"><span className="text-xs text-[#9B958F]">Source:</span>{["all","Manual","Zillow","Sothebys","LinkedIn","Compass"].map(f => <button key={f} onClick={() => setSourceFilter(f)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${sourceFilter===f?"bg-[#1E2761] text-white":"bg-white border border-[#EDE8E0] text-[#5A534E] hover:bg-[#F5F3EF]"}`}>{f==="all"?"All":f}</button>)}</div>
      </div>

      <div className={`grid gap-4 ${selected ? "grid-cols-3" : "grid-cols-1"}`}>
        <div className={`${selected ? "col-span-2" : "col-span-1"} card overflow-hidden`}>
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Agent","Brokerage","Market","Listings","Avg Price","Last Activity","Source","Signal",""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
            <tbody>{filtered.map(lead => <tr key={lead.id} onClick={() => setSelected(lead.id===selected?.id?null:lead)} className={`border-b border-[#F5F3EF] cursor-pointer transition-colors ${selected?.id===lead.id?"bg-[#EEF0FA]":"hover:bg-[#FAFAF8]"}`}><td className="px-4 py-3 font-medium text-[#1A1615]">{lead.name}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{lead.brokerage}</td><td className="px-4 py-3 text-[#5A534E] text-xs"><div className="flex items-center gap-1"><MapPin size={10} style={{color:GOLD}} />{lead.market}</div></td><td className="px-4 py-3 text-center font-medium text-[#1A1615]">{lead.listings}</td><td className="px-4 py-3 text-emerald-700 text-xs font-medium">{lead.avgPrice}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{lead.lastActivity}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SOURCE_COLORS[lead.source]??"bg-gray-100 text-gray-600"}`}>{lead.source}</span></td><td className="px-4 py-3"><PriorityBadge p={lead.signalMatch} /></td><td className="px-4 py-3 text-[#C2B9B0] hover:text-[#5A534E] transition"><ExternalLink size={12} /></td></tr>)}</tbody>
          </table>
          <div className="px-4 py-3 border-t border-[#EDE8E0] text-xs text-[#9B958F]">Showing {filtered.length} of {leadsData.length} leads</div>
        </div>
        {selected && (
          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div><h3 className="text-base font-semibold text-[#1A1615]">{selected.name}</h3><p className="text-xs text-[#9B958F] mt-0.5">{selected.brokerage}</p></div>
              <PriorityBadge p={selected.signalMatch} />
            </div>
            <div className="space-y-2.5">
              {[{icon:MapPin,label:selected.market},{icon:Building2,label:selected.brokerage},{icon:Phone,label:selected.phone,href:`tel:${selected.phone}`},{icon:Mail,label:selected.email,href:`mailto:${selected.email}`},{icon:TrendingUp,label:`${selected.listings} listings · avg ${selected.avgPrice}`}].map(({icon:Icon,label,href}) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <div className="w-6 h-6 rounded-lg bg-[#F5F3EF] flex items-center justify-center flex-shrink-0"><Icon size={12} style={{color:GOLD}} /></div>
                  {href ? <a href={href} className="text-[#5A534E] hover:text-[#1A1615] transition text-sm">{label}</a> : <span className="text-[#5A534E]">{label}</span>}
                </div>
              ))}
            </div>
            <div className="border-t border-[#EDE8E0] pt-3"><p className="text-xs font-semibold text-[#9B958F] mb-1.5">Signal Note</p><p className="text-sm text-[#5A534E]">{selected.notes}</p></div>
            <div className="border-t border-[#EDE8E0] pt-3"><p className="text-xs font-semibold text-[#9B958F] mb-2">Source</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SOURCE_COLORS[selected.source]??"bg-gray-100 text-gray-600"}`}>{selected.source}</span></div>
            <button className="btn-gold w-full text-sm py-2.5 flex items-center justify-center gap-2"><Mail size={13} /> Generate Outreach</button>
          </div>
        )}
      </div>
    </div>
  );
}
