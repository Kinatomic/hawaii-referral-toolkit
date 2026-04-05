"use client";

import { useState } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Flame, Eye, TrendingUp, Lock, Send, Search, CheckCircle, Radio } from "lucide-react";
import { liquidityEvents, agentActivity, marketMovements, privacySeekers, outreachQueue, velocityData } from "@/lib/data";

const GOLD = "#C9A96E";
const PIE_DATA = [
  { name: "Hot (90+)", value: 3, color: "#EF4444" },
  { name: "Warm (70–89)", value: 5, color: "#F97316" },
  { name: "Cool (<70)", value: 4, color: "#3B82F6" },
];
const TABS = [
  { id: "liquidity", label: "Liquidity Events", icon: TrendingUp, count: liquidityEvents.length },
  { id: "agents",   label: "Agent Activity",   icon: Eye,         count: agentActivity.length },
  { id: "market",   label: "$10M+ Closings",   icon: Radio,       count: marketMovements.length },
  { id: "privacy",  label: "Privacy Seekers",  icon: Lock,        count: privacySeekers.length },
  { id: "queue",    label: "Outreach Queue",   icon: Send,        count: outreachQueue.length },
];
function PriorityBadge({ p }: { p: string }) {
  const cls = p === "hot" ? "bg-red-50 text-red-700 border-red-200" : p === "warm" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";
  const dot = p === "hot" ? "bg-red-500" : p === "warm" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${cls}`}><span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{p}</span>;
}
function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "#EF4444" : score >= 70 ? "#F97316" : "#3B82F6";
  return <div className="flex items-center gap-2"><div className="w-16 bg-[#F5F3EF] rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} /></div><span className="text-xs font-semibold text-[#1A1615]">{score}</span></div>;
}
export default function SignalsPage() {
  const [activeTab, setActiveTab] = useState("liquidity");
  const [search, setSearch] = useState("");
  const [pf, setPf] = useState("all");
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  return (
    <div className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Flame size={20} className="text-red-500" /><h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Signal Intelligence Engine</h1></div>
          <p className="text-sm text-[#9B958F]">UHNW buying signal monitor · Live feed</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live monitoring
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 card p-5">
          <h3 className="text-sm font-semibold text-[#1A1615] mb-4">Signal Velocity (8 weeks)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
              <XAxis dataKey="week" stroke="#C2B9B0" tick={{ fontSize: 10, fill: "#9B958F" }} />
              <YAxis stroke="#C2B9B0" tick={{ fontSize: 10, fill: "#9B958F" }} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="signals" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-4 card p-5">
          <h3 className="text-sm font-semibold text-[#1A1615] mb-3">Distribution</h3>
          <ResponsiveContainer width="100%" height={110}><PieChart><Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={45} dataKey="value" labelLine={false}>{PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} /></PieChart></ResponsiveContainer>
          <div className="space-y-1.5 mt-1">{PIE_DATA.map(d => <div key={d.name} className="flex justify-between text-xs"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-[#5A534E]">{d.name}</span></div><span className="font-semibold text-[#1A1615]">{d.value}</span></div>)}</div>
        </div>
      </div>
      <div className="flex gap-0.5 border-b border-[#EDE8E0]">
        {TABS.map(t => { const Icon = t.icon; const active = activeTab === t.id; return (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${active ? "text-[#1E2761] border-[#C9A96E] bg-[#FAFAF8]" : "text-[#9B958F] border-transparent hover:text-[#5A534E] hover:bg-[#F5F3EF]"}`}>
            <Icon size={13} />{t.label}<span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${active ? "bg-[#EEF0FA] text-[#1E2761]" : "bg-[#F5F3EF] text-[#9B958F]"}`}>{t.count}</span>
          </button>
        );})}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2B9B0]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search signals…" className="input-base pl-9 text-sm" /></div>
        <div className="flex gap-1.5">{["all","hot","warm","cool"].map(p => <button key={p} onClick={() => setPf(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${pf === p ? "bg-[#1E2761] text-white" : "bg-white border border-[#EDE8E0] text-[#5A534E] hover:bg-[#F5F3EF]"}`}>{p === "all" ? "All" : p}</button>)}</div>
      </div>
      <div className="card overflow-hidden">
        {activeTab === "liquidity" && <table className="w-full text-sm">
          <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Signal","Person / Entity","Liquidity","Location","Known Agent","Priority","Action"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
          <tbody>{liquidityEvents.filter(d => (pf === "all" || d.priority === pf) && (!search || [d.person,d.signal,d.location,d.agent].join(" ").toLowerCase().includes(search.toLowerCase()))).map(row => { const key = `liq-${row.id}`; const done = contacted.has(key); return <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors"><td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td><td className="px-4 py-3 text-xs font-medium" style={{color:GOLD}}>{row.signal}</td><td className="px-4 py-3 font-medium text-[#1A1615]">{row.person}</td><td className="px-4 py-3 font-bold text-emerald-700">{row.liquidity}</td><td className="px-4 py-3 text-[#5A534E]">{row.location}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.agent}</td><td className="px-4 py-3"><PriorityBadge p={row.priority} /></td><td className="px-4 py-3">{done ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={11} /> Done</span> : <button onClick={() => setContacted(p => new Set([...p, key]))} className="text-xs font-medium hover:underline" style={{color:GOLD}}>{row.action}</button>}</td></tr>;})}</tbody>
        </table>}
        {activeTab === "agents" && <table className="w-full text-sm">
          <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Agent","Brokerage","Signal","Relevance","Score","Priority"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
          <tbody>{agentActivity.filter(d => (pf === "all" || d.priority === pf) && (!search || [d.agent,d.brokerage,d.signal].join(" ").toLowerCase().includes(search.toLowerCase()))).map(row => <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors"><td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td><td className="px-4 py-3 font-medium text-[#1A1615]">{row.agent}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td><td className="px-4 py-3 text-[#5A534E] text-xs max-w-xs">{row.signal}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.relevance}</td><td className="px-4 py-3"><ScoreBar score={row.score} /></td><td className="px-4 py-3"><PriorityBadge p={row.priority} /></td></tr>)}</tbody>
        </table>}
        {activeTab === "market" && <table className="w-full text-sm">
          <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Property","Price","Market","Agent","Brokerage","Network","Priority","Action"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
          <tbody>{marketMovements.filter(d => (pf === "all" || d.priority === pf) && (!search || [d.property,d.market,d.agent,d.brokerage].join(" ").toLowerCase().includes(search.toLowerCase()))).map(row => <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors"><td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td><td className="px-4 py-3 font-medium text-[#1A1615]">{row.property}</td><td className="px-4 py-3 font-bold text-emerald-700">{row.price}</td><td className="px-4 py-3 text-[#5A534E]">{row.market}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.agent}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td><td className="px-4 py-3">{row.inNetwork ? <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11} /> In network</span> : <span className="text-xs text-[#C2B9B0]">Unknown</span>}</td><td className="px-4 py-3"><PriorityBadge p={row.priority} /></td><td className="px-4 py-3 text-xs font-medium cursor-pointer hover:underline" style={{color:GOLD}}>{row.action}</td></tr>)}</tbody>
        </table>}
        {activeTab === "privacy" && <table className="w-full text-sm">
          <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Type","Detail","Source","Fit Score","Priority","Action"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
          <tbody>{privacySeekers.filter(d => (pf === "all" || d.priority === pf) && (!search || [d.type,d.detail,d.source].join(" ").toLowerCase().includes(search.toLowerCase()))).map(row => <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors"><td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td><td className="px-4 py-3 text-xs font-medium" style={{color:GOLD}}>{row.type}</td><td className="px-4 py-3 text-[#5A534E] text-xs max-w-xs">{row.detail}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.source}</td><td className="px-4 py-3"><ScoreBar score={row.fitScore} /></td><td className="px-4 py-3"><PriorityBadge p={row.priority} /></td><td className="px-4 py-3 text-xs font-medium cursor-pointer hover:underline" style={{color:GOLD}}>{row.action}</td></tr>)}</tbody>
        </table>}
        {activeTab === "queue" && <table className="w-full text-sm">
          <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["#","Contact","Brokerage","Signal Trigger","Approach","Days Since","Status","Priority"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
          <tbody>{outreachQueue.filter(d => pf === "all" || d.priorityLevel === pf).map(row => { const sc = row.status === "Contacted" ? "bg-green-50 text-green-700 border-green-200" : row.status === "Draft Ready" ? "bg-amber-50 text-amber-700 border-amber-200" : row.status === "Scheduled" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"; return <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors"><td className="px-4 py-3 font-bold text-sm" style={{color:GOLD}}>{row.priority}</td><td className="px-4 py-3 font-medium text-[#1A1615]">{row.contact}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td><td className="px-4 py-3 text-[#5A534E] text-xs">{row.signal}</td><td className="px-4 py-3 text-[#5A534E] text-xs">{row.approach}</td><td className="px-4 py-3 text-xs font-medium"><span className={row.daysSince <= 3 ? "text-emerald-600" : row.daysSince <= 10 ? "text-amber-600" : "text-red-600"}>{row.daysSince}d ago</span></td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc}`}>{row.status}</span></td><td className="px-4 py-3"><PriorityBadge p={row.priorityLevel} /></td></tr>; })}</tbody>
        </table>}
      </div>
    </div>
  );
}
