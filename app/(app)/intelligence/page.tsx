"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BrainCircuit, RefreshCw, Zap, TrendingUp, AlertTriangle,
  Play, CheckCircle, Clock, Radio, Database, Newspaper,
  Building2, MapPin, ChevronRight, Sparkles,
} from "lucide-react";
import { useSignals } from "@/lib/useLocalData";
import { SOURCE_COLORS, SOURCE_LABELS, SourceType } from "@/lib/scrapers";

const GOLD = "#C9A96E";

interface SourceStatus {
  source: string;
  last_run?: string;
  signals_found?: number;
  status?: "success" | "error" | "partial";
  freshness: "fresh" | "stale" | "old" | "never";
}

const SOURCE_ICONS: Record<string, React.ElementType> = {
  sec: TrendingUp,
  news: Newspaper,
  mls: Building2,
  linkedin: Building2,
  county: MapPin,
};

const FRESHNESS_COLORS = {
  fresh: "text-emerald-600 bg-emerald-50 border-emerald-200",
  stale: "text-amber-600 bg-amber-50 border-amber-200",
  old:   "text-red-600 bg-red-50 border-red-200",
  never: "text-[#9B958F] bg-[#F5F3EF] border-[#E0D8CC]",
};

const FRESHNESS_LABELS = {
  fresh: "Fresh",
  stale: "> 3 days",
  old:   "> 7 days",
  never: "Never run",
};

function getSettings() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("pip_settings") ?? "null"); } catch { return null; }
}

const SOURCE_NEEDS_KEY: Record<string, "rapidApiKey" | "newsApiKey" | null> = {
  sec: null,
  news: "newsApiKey",
  mls: "rapidApiKey",
  linkedin: "rapidApiKey",
  county: null,
};

function SourceCard({ status, running, settings }: { status: SourceStatus; running: boolean; settings: Record<string, string> | null }) {
  const Icon = SOURCE_ICONS[status.source] ?? Database;
  const freshnessClass = FRESHNESS_COLORS[status.freshness];
  const daysAgo = status.last_run
    ? Math.round((Date.now() - new Date(status.last_run).getTime()) / 86400000)
    : null;
  const requiredKey = SOURCE_NEEDS_KEY[status.source];
  const keyConfigured = requiredKey === null || !!(settings?.[requiredKey]);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center">
          <Icon size={16} style={{ color: GOLD }} />
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${freshnessClass}`}>
          {running ? "Running…" : FRESHNESS_LABELS[status.freshness]}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1A1615] capitalize">{status.source === "mls" ? "MLS/Zillow" : status.source}</p>
      <p className="text-xs text-[#9B958F] mt-0.5">
        {daysAgo !== null ? `${daysAgo}d ago · ${status.signals_found ?? 0} signals` : "No runs recorded"}
      </p>
      <p className={`text-[10px] mt-1.5 font-medium ${keyConfigured ? "text-emerald-600" : "text-[#C2B9B0]"}`}>
        {requiredKey === null ? "Free — no key needed" : keyConfigured ? "API key configured" : "No API key set"}
      </p>
    </div>
  );
}

export default function IntelligencePage() {
  const { signals, mergeScraperSignals } = useSignals();
  const [statuses, setStatuses] = useState<SourceStatus[]>([]);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubbingSource, setScrubbingSource] = useState<string | null>(null);
  const [scrubResult, setScrubResult] = useState<{ total: number; hot: number; new: number } | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [lastScrubAt, setLastScrubAt] = useState<string | null>(null);
  const [pageSettings, setPageSettings] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch("/api/scraper-status")
      .then(r => r.json())
      .then(d => setStatuses(d.statuses ?? []))
      .catch(() => {});
    setPageSettings(getSettings());
  }, []);

  // ── Signal stats ──────────────────────────────────────────────────────────
  const realSignals = signals.filter(s => !s.isDemo);
  const allSignals = signals;

  const bySource = Object.fromEntries(
    (["sec", "news", "mls", "linkedin", "county", "manual", "ai"] as SourceType[]).map(src => [
      src,
      allSignals.filter(s => s.source_type === src).length,
    ])
  );

  const chartData = Object.entries(bySource)
    .filter(([, v]) => v > 0)
    .map(([src, count]) => ({ source: SOURCE_LABELS[src as SourceType] ?? src, count }));

  // Last 8 weeks of signal velocity (approximate from dates)
  const weeklyVelocity = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i) * 7);
    const weekStart = d.toISOString().split("T")[0];
    const weekEnd = new Date(d.getTime() + 7 * 86400000).toISOString().split("T")[0];
    return {
      week: `W${8 - i}`,
      signals: allSignals.filter(s => s.date >= weekStart && s.date < weekEnd).length,
    };
  });

  const hotCount = allSignals.filter(s => s.priority === "hot").length;
  const warmCount = allSignals.filter(s => s.priority === "warm").length;

  // ── Run full scrub ────────────────────────────────────────────────────────
  const handleRunScrub = async (sourcesOverride?: string[]) => {
    setScrubbing(true);
    setScrubResult(null);
    const settings = getSettings();
    const hasRapidKey = !!(settings?.rapidApiKey);
    // Default: run all sources that have keys configured
    const defaultSources = hasRapidKey
      ? ["sec", "news", "zillow", "linkedin", "county"]
      : ["sec", "news", "county"];
    const sources = sourcesOverride ?? defaultSources;

    try {
      const res = await fetch("/api/cron/scrub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources,
          newsApiKey: settings?.newsApiKey,
          rapidApiKey: settings?.rapidApiKey,
          minPrice: settings?.minTransactionThreshold ?? 10_000_000,
          lookbackDays: 7,
        }),
      });

      const data = await res.json();
      const incoming = data.signals ?? [];
      const added = mergeScraperSignals(incoming);
      const now = new Date().toISOString();
      setLastScrubAt(now);
      setScrubResult({
        total: incoming.length,
        hot: incoming.filter((s: { priority: string }) => s.priority === "hot").length,
        new: added,
      });

      // Update source statuses from scrub response (works without Supabase)
      if (data.summary?.runs) {
        const updatedStatuses: SourceStatus[] = (data.summary.runs as Array<{ source: string; status: string; signals: number; timestamp?: string; error?: string }>).map(r => ({
          source: r.source,
          last_run: r.timestamp ?? now,
          signals_found: r.signals,
          status: r.status as "success" | "error" | "partial",
          freshness: "fresh" as const,
        }));
        setStatuses(prev => {
          const map = new Map(prev.map(s => [s.source, s]));
          updatedStatuses.forEach(s => map.set(s.source, s));
          return Array.from(map.values());
        });
      }
    } catch {
      setScrubResult({ total: 0, hot: 0, new: 0 });
    } finally {
      setScrubbing(false);
    }
  };

  // ── Generate AI report ────────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    const settings = getSettings();
    if (!settings?.anthropicKey) {
      setReportError("Add an Anthropic API key in Settings → API Keys to generate AI reports.");
      return;
    }
    setGeneratingReport(true);
    setReportError(null);

    const top10 = allSignals
      .sort((a, b) => (a.priority === "hot" ? -1 : b.priority === "hot" ? 1 : 0))
      .slice(0, 10)
      .map(s => ({ signal: s.signal, priority: s.priority, date: s.date, source_type: s.source_type }));

    const bySourceForReport = Object.fromEntries(
      (["sec", "news", "mls", "linkedin", "county", "manual"] as SourceType[])
        .filter(src => bySource[src] > 0)
        .map(src => [SOURCE_LABELS[src], bySource[src]])
    );

    try {
      const res = await fetch("/api/research-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anthropicKey: settings.anthropicKey,
          mode: "weekly_report",
          weeklyData: {
            totalSignals: allSignals.length,
            hotSignals: hotCount,
            signalsBySource: bySourceForReport,
            topSignals: top10,
            dateRange: `Last 7 days (through ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Report generation failed");
      setNarrative(data.narrative);
    } catch (e) {
      setReportError(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const topSignals = allSignals
    .filter(s => s.priority === "hot" || s.priority === "warm")
    .slice(0, 8);

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit size={20} style={{ color: GOLD }} />
            <h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Intelligence Center</h1>
          </div>
          <p className="text-sm text-[#9B958F]">
            Signal scraping · AI research · Weekly briefings
            {lastScrubAt && (
              <span className="ml-3 text-emerald-600 font-medium">
                · Last scrub: {new Date(lastScrubAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunScrub(["sec", "county"])}
            disabled={scrubbing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#E0D8CC] text-[#5A534E] rounded-lg hover:border-[#C9A96E] transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={scrubbing ? "animate-spin" : ""} />
            Free sources only
          </button>
          <button
            onClick={() => handleRunScrub()}
            disabled={scrubbing}
            className="btn-gold flex items-center gap-1.5 text-sm px-4 py-2 disabled:opacity-50"
          >
            <Play size={13} />
            {scrubbing ? "Running scrub…" : "Run Full Scrub"}
          </button>
        </div>
      </div>

      {/* Scrub result banner */}
      {scrubResult && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <span className="text-emerald-700">
            Scrub complete — <strong>{scrubResult.total}</strong> signals detected
            {scrubResult.hot > 0 && <>, <strong className="text-red-600">{scrubResult.hot} hot</strong></>}
            {scrubResult.new > 0
              ? <>, <strong>{scrubResult.new} new</strong> added to your feed</>
              : ", all already in your feed"}
          </span>
        </div>
      )}

      {/* Source status grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A1615]">Data Source Status</h2>
          <p className="text-xs text-[#9B958F]">
            <span className="inline-flex items-center gap-1 mr-3"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Fresh (&lt;3 days)</span>
            <span className="inline-flex items-center gap-1 mr-3"><span className="w-2 h-2 rounded-full bg-amber-400" /> Stale (&gt;3 days)</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Old (&gt;7 days)</span>
          </p>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {(["sec", "news", "mls", "linkedin", "county"] as const).map(src => {
            const status = statuses.find(s => s.source === src) ?? { source: src, freshness: "never" as const };
            return <SourceCard key={src} status={status} running={scrubbing && scrubbingSource === src} settings={pageSettings} />;
          })}
        </div>
      </div>

      {/* Stats + Charts */}
      <div className="grid grid-cols-12 gap-4">
        {/* KPIs */}
        <div className="col-span-4 grid grid-cols-2 gap-3">
          {[
            { label: "Total Signals", value: allSignals.length, color: GOLD },
            { label: "Hot Signals", value: hotCount, color: "#EF4444" },
            { label: "Warm Signals", value: warmCount, color: "#F97316" },
            { label: "Real (non-demo)", value: realSignals.length, color: "#1E2761" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4" style={{ borderTop: `2px solid ${color}` }}>
              <p className="text-xs text-[#9B958F] mb-1">{label}</p>
              <p className="text-3xl font-semibold text-[#1A1615]">{value}</p>
            </div>
          ))}
        </div>

        {/* Signal velocity */}
        <div className="col-span-5 card p-5">
          <h3 className="text-sm font-semibold text-[#1A1615] mb-4">Signal Velocity (8 weeks)</h3>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={weeklyVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9B958F" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9B958F" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="signals" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Signals by source */}
        <div className="col-span-3 card p-5">
          <h3 className="text-sm font-semibold text-[#1A1615] mb-4">Signals by Source</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9B958F" }} allowDecimals={false} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 10, fill: "#9B958F" }} width={55} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-xs text-[#9B958F]">Run a scrub to populate</div>
          )}
        </div>
      </div>

      {/* Top signals + AI report */}
      <div className="grid grid-cols-2 gap-5">
        {/* Top signals */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EDE8E0] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1A1615]">Top Signals</h3>
            <a href="/signals" className="text-xs text-[#C9A96E] hover:underline flex items-center gap-1">
              View all <ChevronRight size={11} />
            </a>
          </div>
          {topSignals.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9B958F]">No signals yet — run a scrub</div>
          ) : (
            <div className="divide-y divide-[#F5F3EF]">
              {topSignals.map(s => {
                const srcType = s.source_type ?? "manual";
                const srcClass = SOURCE_COLORS[srcType as SourceType] ?? SOURCE_COLORS.manual;
                const priColor = s.priority === "hot" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200";
                return (
                  <div key={s.id} className="px-5 py-3 flex items-start justify-between gap-3 hover:bg-[#FAFAF8] transition">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#1A1615] truncate">{s.signal ?? s.property ?? "Signal"}</p>
                      <p className="text-[10px] text-[#9B958F] mt-0.5">{s.date} {s.person ? `· ${s.person}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${srcClass}`}>
                        {SOURCE_LABELS[srcType as SourceType] ?? srcType.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${priColor}`}>
                        {s.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Intelligence Report */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1A1615]">AI Intelligence Report</h3>
              <p className="text-xs text-[#9B958F] mt-0.5">Weekly briefing generated by Claude</p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2 disabled:opacity-50"
            >
              <Sparkles size={12} className={generatingReport ? "animate-pulse" : ""} />
              {generatingReport ? "Generating…" : "Generate Report"}
            </button>
          </div>

          {reportError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />{reportError}
            </div>
          )}

          {narrative ? (
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-[#5A534E] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
                {narrative}
              </div>
            </div>
          ) : !reportError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAFAF8] rounded-xl border border-[#F0EBE3]">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F3EF] flex items-center justify-center mb-3">
                <BrainCircuit size={20} className="text-[#C2B9B0]" />
              </div>
              <p className="text-sm text-[#9B958F]">Click "Generate Report" to create</p>
              <p className="text-xs text-[#C2B9B0] mt-1">Requires Anthropic API key in Settings</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Cron schedule info */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} style={{ color: GOLD }} />
          <h3 className="text-sm font-semibold text-[#1A1615]">Automated Schedule</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">Active on Vercel</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          {[
            { icon: Newspaper, label: "News Intelligence", schedule: "Weekdays 6am UTC", sources: "NewsAPI — free tier", key: "NEWS_API_KEY" },
            { icon: TrendingUp, label: "SEC EDGAR + County", schedule: "Sundays 6am UTC", sources: "Free (no key needed)", key: "None required" },
            { icon: Zap, label: "Full Scrub (all sources)", schedule: "Manual via UI", sources: "Zillow + LinkedIn + all", key: "Multiple keys needed" },
          ].map(({ icon: Icon, label, schedule, sources, key }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-[#FAFAF8] rounded-xl border border-[#F0EBE3]">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#EDE8E0] flex items-center justify-center flex-shrink-0">
                <Icon size={13} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="font-semibold text-[#1A1615]">{label}</p>
                <p className="text-[#9B958F] mt-0.5">{schedule}</p>
                <p className="text-[#C2B9B0] mt-0.5">{sources}</p>
                <p className="text-[#C2B9B0] font-mono">{key}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
