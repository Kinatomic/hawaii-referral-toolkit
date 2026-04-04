"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Flame, Eye, TrendingUp, Lock, Send, Search, Filter,
  ChevronDown, ChevronUp, Clock, Users, MessageSquare, CheckCircle,
} from "lucide-react";
import {
  liquidityEvents, agentActivity, marketMovements,
  privacySeekers, outreachQueue, velocityData,
} from "@/lib/data";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";

const PIE_DATA = [
  { name: "Hot (90+)", value: 3, color: "#ef4444" },
  { name: "Warm (70–89)", value: 5, color: "#f97316" },
  { name: "Cool (<70)", value: 4, color: "#38bdf8" },
];

const TABS = [
  { id: "liquidity", label: "Liquidity Events", icon: TrendingUp, count: liquidityEvents.length },
  { id: "agents", label: "Agent Activity", icon: Eye, count: agentActivity.length },
  { id: "market", label: "$10M+ Closings", icon: Users, count: marketMovements.length },
  { id: "privacy", label: "Privacy Seekers", icon: Lock, count: privacySeekers.length },
  { id: "queue", label: "Outreach Queue", icon: Send, count: outreachQueue.length },
];

function priorityBadge(p: string) {
  if (p === "hot") return "bg-red-900/40 text-red-300 border border-red-700/40";
  if (p === "warm") return "bg-orange-900/40 text-orange-300 border border-orange-700/40";
  return "bg-blue-900/40 text-blue-300 border border-blue-700/40";
}

function PriorityDot({ p }: { p: string }) {
  const colors: Record<string, string> = { hot: "#ef4444", warm: "#f97316", cool: "#38bdf8" };
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[p] ?? "#8b95b0" }} />;
}

export default function SignalsPage() {
  const [activeTab, setActiveTab] = useState("liquidity");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [contacted, setContacted] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setExpanded(p => ({ ...p, [key]: !p[key] }));
  }

  function markContacted(key: string) {
    setContacted(p => new Set([...p, key]));
  }

  const currentDate = new Date().toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={22} className="text-red-400" />
            <h1 className="text-2xl font-bold text-white">Signal Intelligence Engine</h1>
          </div>
          <p className="text-[#8b95b0] text-sm">UHNW buying signals · Live feed · {currentDate}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-800/40 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live monitoring
        </div>
      </div>

      {/* Signal summary + velocity chart */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Signal Velocity (8 weeks)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3050" />
              <XAxis dataKey="week" stroke="#8b95b0" tick={{ fontSize: 10 }} />
              <YAxis stroke="#8b95b0" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3050", borderRadius: 8 }} labelStyle={{ color: "#e8ecf4" }} />
              <Line type="monotone" dataKey="signals" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 card p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-white mb-3">Signal Distribution</h3>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={50} dataKey="value" labelLine={false}>
                {PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3050", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[#8b95b0]">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#2a3050] pb-px">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t transition-all ${
                active ? "text-white border-b-2" : "text-[#8b95b0] hover:text-white"
              }`}
              style={active ? { borderBottomColor: GOLD, backgroundColor: "rgba(30,39,97,0.3)" } : {}}
            >
              <Icon size={13} />
              {t.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${active ? "bg-[#1E2761] text-white" : "bg-[#2a3050] text-[#8b95b0]"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + filter toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b95b0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search signals…"
            className="w-full bg-[#1a1f2e] border border-[#2a3050] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#8b95b0] focus:outline-none focus:border-[#3a4570]"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "hot", "warm", "cool"].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-all ${
                priorityFilter === p ? "text-white bg-[#1E2761] border border-[#3a4570]" : "text-[#8b95b0] hover:text-white bg-[#1a1f2e] border border-[#2a3050]"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="card overflow-hidden">
        {activeTab === "liquidity" && <LiquidityTab data={liquidityEvents} search={search} filter={priorityFilter} expanded={expanded} toggle={toggle} contacted={contacted} markContacted={markContacted} />}
        {activeTab === "agents" && <AgentActivityTab data={agentActivity} search={search} filter={priorityFilter} />}
        {activeTab === "market" && <MarketMovementsTab data={marketMovements} search={search} filter={priorityFilter} />}
        {activeTab === "privacy" && <PrivacyTab data={privacySeekers} search={search} filter={priorityFilter} />}
        {activeTab === "queue" && <OutreachQueueTab data={outreachQueue} filter={priorityFilter} />}
      </div>
    </div>
  );
}

// ── Tab Components ────────────────────────────────────────────────────────────

function LiquidityTab({ data, search, filter, expanded, toggle, contacted, markContacted }: {
  data: typeof liquidityEvents; search: string; filter: string;
  expanded: Record<string, boolean>; toggle: (k: string) => void;
  contacted: Set<string>; markContacted: (k: string) => void;
}) {
  const rows = data.filter(d =>
    (filter === "all" || d.priority === filter) &&
    (!search || [d.person, d.signal, d.location, d.agent].join(" ").toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#1E2761] text-white text-xs">
          {["Date", "Signal", "Person / Entity", "Liquidity", "Location", "Known Agent", "Priority", "Action"].map(h => (
            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          const key = `liq-${row.id}`;
          const done = contacted.has(key);
          return (
            <tr key={row.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
              <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.date}</td>
              <td className="px-4 py-3 text-[#C9A96E] font-medium text-xs">{row.signal}</td>
              <td className="px-4 py-3 text-white">{row.person}</td>
              <td className="px-4 py-3 font-bold text-green-400">{row.liquidity}</td>
              <td className="px-4 py-3 text-[#8b95b0]">{row.location}</td>
              <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.agent}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <PriorityDot p={row.priority} />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(row.priority)}`}>{row.priority}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {done
                  ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12} /> Done</span>
                  : <button onClick={() => markContacted(key)} className="text-xs text-[#C9A96E] hover:underline">{row.action}</button>
                }
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AgentActivityTab({ data, search, filter }: { data: typeof agentActivity; search: string; filter: string }) {
  const rows = data.filter(d =>
    (filter === "all" || d.priority === filter) &&
    (!search || [d.agent, d.brokerage, d.signal, d.relevance].join(" ").toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#1E2761] text-white text-xs">
          {["Date", "Agent", "Brokerage", "Signal", "Relevance", "Score", "Priority"].map(h => (
            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.date}</td>
            <td className="px-4 py-3 text-white font-medium">{row.agent}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.brokerage}</td>
            <td className="px-4 py-3 text-[#c8d0e4] text-xs max-w-xs">{row.signal}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.relevance}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-[#2a3050] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${row.score}%`, backgroundColor: row.score >= 90 ? "#ef4444" : row.score >= 70 ? "#f97316" : "#38bdf8" }} />
                </div>
                <span className="text-xs font-bold text-white">{row.score}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(row.priority)}`}>{row.priority}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MarketMovementsTab({ data, search, filter }: { data: typeof marketMovements; search: string; filter: string }) {
  const rows = data.filter(d =>
    (filter === "all" || d.priority === filter) &&
    (!search || [d.property, d.market, d.agent, d.brokerage].join(" ").toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#1E2761] text-white text-xs">
          {["Date", "Property", "Price", "Market", "Agent", "Brokerage", "Network", "Priority", "Action"].map(h => (
            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.date}</td>
            <td className="px-4 py-3 text-white font-medium">{row.property}</td>
            <td className="px-4 py-3 font-bold text-green-400">{row.price}</td>
            <td className="px-4 py-3 text-[#8b95b0]">{row.market}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.agent}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.brokerage}</td>
            <td className="px-4 py-3">
              {row.inNetwork
                ? <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={11} /> In network</span>
                : <span className="text-xs text-[#8b95b0]">Unknown</span>}
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(row.priority)}`}>{row.priority}</span>
            </td>
            <td className="px-4 py-3 text-xs text-[#C9A96E] hover:underline cursor-pointer">{row.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrivacyTab({ data, search, filter }: { data: typeof privacySeekers; search: string; filter: string }) {
  const rows = data.filter(d =>
    (filter === "all" || d.priority === filter) &&
    (!search || [d.type, d.detail, d.source].join(" ").toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#1E2761] text-white text-xs">
          {["Date", "Type", "Detail", "Source", "Fit Score", "Priority", "Action"].map(h => (
            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.date}</td>
            <td className="px-4 py-3 text-[#C9A96E] font-medium text-xs">{row.type}</td>
            <td className="px-4 py-3 text-[#c8d0e4] text-xs max-w-xs">{row.detail}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.source}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-[#2a3050] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${row.fitScore}%`, backgroundColor: row.fitScore >= 90 ? "#ef4444" : "#f97316" }} />
                </div>
                <span className="text-xs font-bold text-white">{row.fitScore}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(row.priority)}`}>{row.priority}</span>
            </td>
            <td className="px-4 py-3 text-xs text-[#C9A96E] hover:underline cursor-pointer">{row.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OutreachQueueTab({ data, filter }: { data: typeof outreachQueue; filter: string }) {
  const rows = data.filter(d => filter === "all" || d.priorityLevel === filter);
  const statusColors: Record<string, string> = {
    "New": "bg-blue-900/40 text-blue-300 border-blue-700/40",
    "Draft Ready": "bg-amber-900/40 text-amber-300 border-amber-700/40",
    "Contacted": "bg-green-900/40 text-green-300 border-green-700/40",
    "Scheduled": "bg-purple-900/40 text-purple-300 border-purple-700/40",
  };
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#1E2761] text-white text-xs">
          {["#", "Contact", "Brokerage", "Signal Trigger", "Approach", "Days Since", "Status", "Priority"].map(h => (
            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
            <td className="px-4 py-3 text-[#C9A96E] font-bold">{row.priority}</td>
            <td className="px-4 py-3 text-white font-medium">{row.contact}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.brokerage}</td>
            <td className="px-4 py-3 text-[#c8d0e4] text-xs">{row.signal}</td>
            <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.approach}</td>
            <td className="px-4 py-3">
              <span className={`text-xs font-medium ${row.daysSince <= 3 ? "text-green-400" : row.daysSince <= 10 ? "text-amber-400" : "text-red-400"}`}>
                {row.daysSince}d ago
              </span>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[row.status] ?? "bg-gray-800 text-gray-300"}`}>{row.status}</span>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${priorityBadge(row.priorityLevel)}`}>{row.priorityLevel}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
