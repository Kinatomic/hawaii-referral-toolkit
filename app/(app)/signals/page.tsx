"use client";

import { useState } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Flame, Eye, TrendingUp, Lock, Send, Search, CheckCircle, Radio,
  Plus, RefreshCw, X, Info, AlertTriangle, Microscope, ExternalLink,
} from "lucide-react";
import { outreachQueue, velocityData } from "@/lib/data";
import { useSignals, Signal } from "@/lib/useLocalData";
import { SOURCE_COLORS, SOURCE_LABELS, SourceType } from "@/lib/scrapers";
import type { ResearchReport } from "@/lib/scrapers";

const GOLD = "#C9A96E";
const PIE_DATA = [
  { name: "Hot (90+)", value: 3, color: "#EF4444" },
  { name: "Warm (70–89)", value: 5, color: "#F97316" },
  { name: "Cool (<70)", value: 4, color: "#3B82F6" },
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

function DemoBadge() {
  return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-500 border border-amber-200 ml-1.5">DEMO</span>;
}

function SourceBadge({ sourceType }: { sourceType?: SourceType }) {
  if (!sourceType || sourceType === "manual") return null;
  const cls = SOURCE_COLORS[sourceType] ?? SOURCE_COLORS.manual;
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ml-1.5 ${cls}`}>
      {SOURCE_LABELS[sourceType]}
    </span>
  );
}

function ResearchModal({ report, onClose }: { report: ResearchReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-[#EDE8E0] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] sticky top-0 bg-white">
          <div>
            <h2 className="text-sm font-semibold text-[#1A1615]">AI Research Report</h2>
            <p className="text-xs text-[#9B958F] mt-0.5">{report.subject}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9B958F]">Lead Score</span>
              <span className={`text-lg font-bold ${report.lead_score >= 70 ? "text-red-600" : report.lead_score >= 50 ? "text-amber-600" : "text-blue-600"}`}>
                {report.lead_score}
              </span>
              <span className="text-xs text-[#9B958F]">/ 100</span>
            </div>
            <button onClick={onClose} className="text-[#9B958F] hover:text-[#1A1615] transition"><X size={16} /></button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {report.lead_score_rationale && (
            <p className="text-xs text-[#5A534E] italic border-l-2 border-[#C9A96E] pl-3">{report.lead_score_rationale}</p>
          )}
          {report.net_worth_estimate && (
            <div>
              <p className="text-xs font-semibold text-[#5A534E] mb-1">Net Worth Estimate</p>
              <p className="text-sm text-[#1A1615]">{report.net_worth_estimate}</p>
            </div>
          )}
          {report.liquidity_events.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5A534E] mb-2">Liquidity Events</p>
              <ul className="space-y-1">{report.liquidity_events.map((e, i) => (
                <li key={i} className="text-sm text-[#5A534E] flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{e}</li>
              ))}</ul>
            </div>
          )}
          {report.hawaii_connections.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5A534E] mb-2">Hawaii Connection Signals</p>
              <ul className="space-y-1">{report.hawaii_connections.map((c, i) => (
                <li key={i} className="text-sm text-[#5A534E] flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />{c}</li>
              ))}</ul>
            </div>
          )}
          {report.recommended_approach && (
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#EDE8E0]">
              <p className="text-xs font-semibold text-[#5A534E] mb-1.5">Recommended Approach</p>
              <p className="text-sm text-[#1A1615]">{report.recommended_approach}</p>
            </div>
          )}
          {report.key_talking_points.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5A534E] mb-2">Key Talking Points</p>
              <ul className="space-y-1.5">{report.key_talking_points.map((p, i) => (
                <li key={i} className="text-sm text-[#5A534E] flex items-start gap-2"><span className="text-[#C9A96E] font-bold">{i + 1}.</span>{p}</li>
              ))}</ul>
            </div>
          )}
          {report.raw_narrative && (
            <div>
              <p className="text-xs font-semibold text-[#5A534E] mb-2">Intelligence Brief</p>
              <p className="text-sm text-[#5A534E] leading-relaxed whitespace-pre-wrap">{report.raw_narrative}</p>
            </div>
          )}
          <p className="text-[10px] text-[#C2B9B0] text-right">Generated {new Date(report.generated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

const SIGNAL_TABS = [
  { id: "liquidity", label: "Liquidity Events", icon: TrendingUp },
  { id: "agents",   label: "Agent Activity",   icon: Eye },
  { id: "market",   label: "$10M+ Closings",   icon: Radio },
  { id: "privacy",  label: "Privacy Seekers",  icon: Lock },
  { id: "queue",    label: "Outreach Queue",   icon: Send },
];

const ADD_SIGNAL_TABS = ["liquidity","agents","market","privacy"] as const;
type AddTab = typeof ADD_SIGNAL_TABS[number];

const BLANK_SIGNAL = { date: "", signal: "", person: "", location: "", agent: "", liquidity: "", brokerage: "", relevance: "", score: 75, fitScore: 75, property: "", price: "", market: "", source: "", detail: "", type: "", priority: "warm", action: "Contact" };

function AddSignalModal({ onSave, onClose }: { onSave: (s: Omit<Signal, "id" | "isDemo">) => void; onClose: () => void }) {
  const [tab, setTab] = useState<AddTab>("liquidity");
  const [f, setF] = useState(BLANK_SIGNAL);
  const set = (k: string, v: string | number) => setF(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.signal.trim()) return;
    onSave({ ...f, tab, score: Number(f.score), fitScore: Number(f.fitScore) });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#EDE8E0] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] sticky top-0 bg-white">
          <h2 className="text-sm font-semibold text-[#1A1615]">Add Signal</h2>
          <button onClick={onClose} className="text-[#9B958F] hover:text-[#1A1615] transition"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A534E] mb-2">Signal Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {ADD_SIGNAL_TABS.map(t => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${tab === t ? "bg-[#1E2761] text-white border-[#1E2761]" : "bg-white border-[#E0D8CC] text-[#5A534E] hover:border-[#C9A96E]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Date</label>
              <input type="date" value={f.date} onChange={e => set("date", e.target.value)} className="input-base text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Priority</label>
              <select value={f.priority} onChange={e => set("priority", e.target.value)} className="input-base text-sm">
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Signal Description *</label>
              <input value={f.signal} onChange={e => set("signal", e.target.value)} placeholder="e.g. IPO filing detected — $450M raise" className="input-base text-sm" required />
            </div>
            {(tab === "liquidity" || tab === "agents") && (
              <div>
                <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">{tab === "liquidity" ? "Person / Entity" : "Agent Name"}</label>
                <input value={f.person} onChange={e => set("person", e.target.value)} className="input-base text-sm" />
              </div>
            )}
            {tab === "liquidity" && (
              <div>
                <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Liquidity Amount</label>
                <input value={f.liquidity} onChange={e => set("liquidity", e.target.value)} placeholder="$450M" className="input-base text-sm" />
              </div>
            )}
            {tab === "agents" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Brokerage</label>
                  <input value={f.brokerage} onChange={e => set("brokerage", e.target.value)} className="input-base text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Relevance Note</label>
                  <input value={f.relevance} onChange={e => set("relevance", e.target.value)} className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Score (0–100)</label>
                  <input type="number" min="0" max="100" value={f.score} onChange={e => set("score", Number(e.target.value))} className="input-base text-sm" />
                </div>
              </>
            )}
            {tab === "market" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Property</label>
                  <input value={f.property} onChange={e => set("property", e.target.value)} className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Price</label>
                  <input value={f.price} onChange={e => set("price", e.target.value)} placeholder="$12.5M" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Market</label>
                  <input value={f.market} onChange={e => set("market", e.target.value)} placeholder="Molokai" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Agent</label>
                  <input value={f.agent} onChange={e => set("agent", e.target.value)} className="input-base text-sm" />
                </div>
              </>
            )}
            {tab === "privacy" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Type</label>
                  <input value={f.type} onChange={e => set("type", e.target.value)} placeholder="Off-market inquiry" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Source</label>
                  <input value={f.source} onChange={e => set("source", e.target.value)} placeholder="MLS, referral, social…" className="input-base text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Detail</label>
                  <input value={f.detail} onChange={e => set("detail", e.target.value)} className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Fit Score (0–100)</label>
                  <input type="number" min="0" max="100" value={f.fitScore} onChange={e => set("fitScore", Number(e.target.value))} className="input-base text-sm" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Location</label>
              <input value={f.location} onChange={e => set("location", e.target.value)} placeholder="San Francisco, CA" className="input-base text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Suggested Action</label>
              <input value={f.action} onChange={e => set("action", e.target.value)} placeholder="Contact agent" className="input-base text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
            <button type="submit" className="btn-primary flex-1 text-sm py-2.5">Add Signal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignalsPage() {
  const { signals, addSignal, clearDemo, mergeScraperSignals } = useSignals();
  const [activeTab, setActiveTab] = useState("liquidity");
  const [search, setSearch] = useState("");
  const [pf, setPf] = useState("all");
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const [researching, setResearching] = useState<number | null>(null);
  const [researchReport, setResearchReport] = useState<ResearchReport | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);

  const hasDemoSignals = signals.some(s => s.isDemo);

  const tabSignals = (tab: Signal["tab"]) =>
    signals.filter(s => s.tab === tab &&
      (pf === "all" || s.priority === pf) &&
      (!search || [s.signal, s.person, s.location, s.agent, s.property, s.brokerage, s.type, s.detail].join(" ").toLowerCase().includes(search.toLowerCase()))
    );

  const TABS = SIGNAL_TABS.map(t => ({
    ...t,
    count: t.id === "queue" ? outreachQueue.length : signals.filter(s => s.tab === t.id as Signal["tab"]).length,
  }));

  const handleRefresh = async () => {
    setRefreshPulse(true);
    try {
      const settings = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("pip_settings") ?? "null")
        : null;
      const res = await fetch("/api/cron/scrub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: ["sec", "county"],
          newsApiKey: settings?.newsApiKey,
          minPrice: settings?.minTransactionThreshold ?? 10_000_000,
          lookbackDays: 7,
        }),
      });
      const data = await res.json();
      if (data.signals?.length) mergeScraperSignals(data.signals);
    } catch {}
    finally { setRefreshPulse(false); }
  };

  const handleDeepResearch = async (signal: Signal) => {
    const settings = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("pip_settings") ?? "null")
      : null;
    if (!settings?.anthropicKey) {
      setResearchError("Add an Anthropic API key in Settings → API Keys to use Deep Research.");
      setResearchReport({ subject: signal.person ?? signal.signal ?? "Signal", liquidity_events: [], hawaii_connections: [], key_talking_points: [], recommended_approach: "", lead_score: 50, lead_score_rationale: "", raw_narrative: "", generated_at: new Date().toISOString() });
      return;
    }
    setResearching(signal.id);
    setResearchError(null);
    try {
      const res = await fetch("/api/research-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicKey: settings.anthropicKey, signal, mode: "signal" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Research failed");
      setResearchReport(data as ResearchReport);
    } catch (e) {
      setResearchError(e instanceof Error ? e.message : "Research failed");
    } finally {
      setResearching(null);
    }
  };

  const liqRows = tabSignals("liquidity");
  const agentRows = tabSignals("agents");
  const mktRows = tabSignals("market");
  const privRows = tabSignals("privacy");

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Demo banner */}
      {hasDemoSignals && (
        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle size={15} />
            <span className="font-medium">Sample signals</span>
            <span className="text-amber-600">— these are demo signals. Add your own or clear the samples.</span>
          </div>
          <button
            onClick={() => { if (window.confirm("Remove all sample signals?")) clearDemo(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <X size={12} /> Clear samples
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Flame size={20} className="text-red-500" /><h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Signal Intelligence Engine</h1></div>
          <p className="text-sm text-[#9B958F]">UHNW buying signal monitor · Live feed</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${showInfo ? "bg-[#EEF0FA] text-[#1E2761] border-[#1E2761]" : "bg-white border-[#E0D8CC] text-[#5A534E] hover:border-[#C9A96E]"}`}
          >
            <Info size={13} /> How this works
          </button>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-white border-[#E0D8CC] text-[#5A534E] hover:border-[#C9A96E] transition-all ${refreshPulse ? "opacity-50" : ""}`}
          >
            <RefreshCw size={13} className={refreshPulse ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Plus size={13} /> Add Signal
          </button>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live monitoring
          </div>
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="card p-5 border-l-4 border-l-[#C9A96E]">
          <h3 className="text-sm font-semibold text-[#1A1615] mb-3">How Signal Intelligence Works</h3>
          <div className="grid grid-cols-2 gap-5 text-xs text-[#5A534E]">
            <div>
              <p className="font-semibold text-[#1A1615] mb-1.5">Data Sources</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />SEC EDGAR — IPO filings, S-1 registrations, insider sales</li>
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />LinkedIn activity — agent promotions, brokerage moves, luxury deal announcements</li>
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />Hawaii MLS — $10M+ closings, off-market activity, listing price changes</li>
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-[#C9A96E] mt-1.5 flex-shrink-0" />News & press — executive moves, venture rounds, family office signals</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#1A1615] mb-1.5">Scoring Methodology</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" /><strong className="text-red-600">Hot (90+)</strong> — recent liquidity event + verified UHNW profile + known Hawaii interest</li>
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" /><strong className="text-amber-600">Warm (70–89)</strong> — indirect signal: agent moves, luxury market activity, privacy-seeking behavior</li>
                <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-blue-600">Cool (&lt;70)</strong> — early indicator, demographic match only, no confirmed intent</li>
              </ul>
              <p className="font-semibold text-[#1A1615] mt-3 mb-1">Refresh Frequency</p>
              <p>Liquidity events: real-time via SEC EDGAR API. Agent activity: 6-hour sweep. MLS closings: daily at 6am HST. Privacy seekers: weekly manual review.</p>
            </div>
          </div>
        </div>
      )}

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
        {activeTab === "liquidity" && (
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Signal","Person / Entity","Liquidity","Location","Known Agent","Priority","Action",""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
            <tbody>
              {liqRows.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-[#9B958F]">No liquidity signals found</td></tr>}
              {liqRows.map(row => { const key = `liq-${row.id}`; const done = contacted.has(key); return (
                <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td>
                  <td className="px-4 py-3 text-xs font-medium" style={{color:GOLD}}>{row.signal}{row.isDemo && <DemoBadge />}<SourceBadge sourceType={row.source_type} /></td>
                  <td className="px-4 py-3 font-medium text-[#1A1615]">{row.person}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{row.liquidity}</td>
                  <td className="px-4 py-3 text-[#5A534E]">{row.location}</td>
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.agent}</td>
                  <td className="px-4 py-3"><PriorityBadge p={row.priority} /></td>
                  <td className="px-4 py-3">{done ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={11} /> Done</span> : <button onClick={() => setContacted(p => new Set([...p, key]))} className="text-xs font-medium hover:underline" style={{color:GOLD}}>{row.action}</button>}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeepResearch(row)}
                      disabled={researching === row.id}
                      className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1E2761] transition disabled:opacity-50"
                      title="Deep Research"
                    >
                      {researching === row.id ? <RefreshCw size={11} className="animate-spin" /> : <Microscope size={11} />}
                    </button>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        )}
        {activeTab === "agents" && (
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Agent","Brokerage","Signal","Relevance","Score","Priority",""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
            <tbody>
              {agentRows.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-xs text-[#9B958F]">No agent signals found</td></tr>}
              {agentRows.map(row => (
                <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td>
                  <td className="px-4 py-3 font-medium text-[#1A1615]">{row.agent}{row.isDemo && <DemoBadge />}<SourceBadge sourceType={row.source_type} /></td>
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td>
                  <td className="px-4 py-3 text-[#5A534E] text-xs max-w-xs">{row.signal}</td>
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.relevance}</td>
                  <td className="px-4 py-3"><ScoreBar score={row.score ?? 0} /></td>
                  <td className="px-4 py-3"><PriorityBadge p={row.priority} /></td>
                  <td className="px-4 py-3"><button onClick={() => handleDeepResearch(row)} disabled={researching === row.id} className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1E2761] transition disabled:opacity-50" title="Deep Research">{researching === row.id ? <RefreshCw size={11} className="animate-spin" /> : <Microscope size={11} />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === "market" && (
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Property","Price","Market","Agent","Brokerage","Network","Priority","Action",""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
            <tbody>
              {mktRows.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-xs text-[#9B958F]">No market signals found</td></tr>}
              {mktRows.map(row => (
                <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td>
                  <td className="px-4 py-3 font-medium text-[#1A1615]">{row.property}{row.isDemo && <DemoBadge />}<SourceBadge sourceType={row.source_type} /></td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{row.price}</td>
                  <td className="px-4 py-3 text-[#5A534E]">{row.market}</td>
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.agent}</td>
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td>
                  <td className="px-4 py-3">{row.inNetwork ? <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11} /> In network</span> : <span className="text-xs text-[#C2B9B0]">Unknown</span>}</td>
                  <td className="px-4 py-3"><PriorityBadge p={row.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium cursor-pointer hover:underline" style={{color:GOLD}}>{row.action}</span>
                      {row.source_url && <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-[#C2B9B0] hover:text-[#1E2761]"><ExternalLink size={11} /></a>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><button onClick={() => handleDeepResearch(row)} disabled={researching === row.id} className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1E2761] transition disabled:opacity-50" title="Deep Research">{researching === row.id ? <RefreshCw size={11} className="animate-spin" /> : <Microscope size={11} />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === "privacy" && (
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["Date","Type","Detail","Source","Fit Score","Priority","Action",""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
            <tbody>
              {privRows.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-xs text-[#9B958F]">No privacy seeker signals found</td></tr>}
              {privRows.map(row => (
                <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.date}</td>
                  <td className="px-4 py-3 text-xs font-medium" style={{color:GOLD}}>{row.type}{row.isDemo && <DemoBadge />}<SourceBadge sourceType={row.source_type} /></td>
                  <td className="px-4 py-3 text-[#5A534E] text-xs max-w-xs">{row.detail}</td>
                  <td className="px-4 py-3 text-[#9B958F] text-xs">{row.source}</td>
                  <td className="px-4 py-3"><ScoreBar score={row.fitScore ?? 0} /></td>
                  <td className="px-4 py-3"><PriorityBadge p={row.priority} /></td>
                  <td className="px-4 py-3 text-xs font-medium cursor-pointer hover:underline" style={{color:GOLD}}>{row.action}</td>
                  <td className="px-4 py-3"><button onClick={() => handleDeepResearch(row)} disabled={researching === row.id} className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1E2761] transition disabled:opacity-50" title="Deep Research">{researching === row.id ? <RefreshCw size={11} className="animate-spin" /> : <Microscope size={11} />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === "queue" && (
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">{["#","Contact","Brokerage","Signal Trigger","Approach","Days Since","Status","Priority"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>)}</tr></thead>
            <tbody>{outreachQueue.filter(d => pf === "all" || d.priorityLevel === pf).map(row => { const sc = row.status === "Contacted" ? "bg-green-50 text-green-700 border-green-200" : row.status === "Draft Ready" ? "bg-amber-50 text-amber-700 border-amber-200" : row.status === "Scheduled" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"; return <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors"><td className="px-4 py-3 font-bold text-sm" style={{color:GOLD}}>{row.priority}</td><td className="px-4 py-3 font-medium text-[#1A1615]">{row.contact}</td><td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td><td className="px-4 py-3 text-[#5A534E] text-xs">{row.signal}</td><td className="px-4 py-3 text-[#5A534E] text-xs">{row.approach}</td><td className="px-4 py-3 text-xs font-medium"><span className={row.daysSince <= 3 ? "text-emerald-600" : row.daysSince <= 10 ? "text-amber-600" : "text-red-600"}>{row.daysSince}d ago</span></td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc}`}>{row.status}</span></td><td className="px-4 py-3"><PriorityBadge p={row.priorityLevel} /></td></tr>; })}</tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <AddSignalModal
          onSave={sig => { addSignal(sig); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {researchReport && (
        <ResearchModal
          report={researchReport}
          onClose={() => { setResearchReport(null); setResearchError(null); }}
        />
      )}

      {researchError && !researchReport && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg text-xs text-red-700 max-w-sm">
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Deep Research Error</p>
            {researchError}
          </div>
          <button onClick={() => setResearchError(null)} className="ml-2 text-red-400 hover:text-red-600"><X size={12} /></button>
        </div>
      )}
    </div>
  );
}
