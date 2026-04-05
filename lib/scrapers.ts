// ── Shared types for all intelligence scrapers ─────────────────────────────

export type SourceType = "sec" | "news" | "mls" | "linkedin" | "county" | "manual" | "ai";
export type SignalTab = "liquidity" | "agents" | "market" | "privacy";

export const SOURCE_LABELS: Record<SourceType, string> = {
  sec: "SEC",
  news: "News",
  mls: "MLS",
  linkedin: "LinkedIn",
  county: "County",
  manual: "Manual",
  ai: "AI",
};

export const SOURCE_COLORS: Record<SourceType, string> = {
  sec:      "bg-blue-50 text-blue-700 border-blue-200",
  news:     "bg-green-50 text-green-700 border-green-200",
  mls:      "bg-purple-50 text-purple-700 border-purple-200",
  linkedin: "bg-indigo-50 text-indigo-700 border-indigo-200",
  county:   "bg-orange-50 text-orange-700 border-orange-200",
  manual:   "bg-gray-50 text-gray-600 border-gray-200",
  ai:       "bg-amber-50 text-amber-700 border-amber-200",
};

export interface ScraperSignal {
  date: string;
  signal: string;
  priority: "hot" | "warm" | "cool";
  source_type: SourceType;
  source_url?: string;
  tab: SignalTab;
  person?: string;
  location?: string;
  liquidity?: string;
  agent?: string;
  brokerage?: string;
  property?: string;
  price?: string;
  market?: string;
  detail?: string;
  type?: string;
  action?: string;
  relevance?: string;
  score?: number;
  fitScore?: number;
  ai_score?: number;
  inNetwork?: boolean;
  raw_data?: Record<string, unknown>;
}

export interface ScraperRun {
  source: string;
  timestamp: string;
  signals_found: number;
  status: "success" | "error" | "partial";
  error?: string;
  duration_ms?: number;
}

export interface ScraperResult {
  signals: ScraperSignal[];
  run: ScraperRun;
}

export interface ResearchReport {
  signal_id?: number;
  subject: string;
  net_worth_estimate?: string;
  liquidity_events: string[];
  hawaii_connections: string[];
  recommended_approach: string;
  key_talking_points: string[];
  lead_score: number;
  lead_score_rationale: string;
  generated_at: string;
  raw_narrative: string;
}

// ── Scoring helpers ────────────────────────────────────────────────────────

export function scoreSignal(signal: Partial<ScraperSignal>): "hot" | "warm" | "cool" {
  let score = 0;
  if (signal.source_type === "sec") score += 40;
  if (signal.source_type === "county") score += 35;
  if (signal.source_type === "mls") score += 25;
  if (signal.source_type === "news") score += 20;
  if (signal.source_type === "linkedin") score += 20;
  if (signal.liquidity && parseDollarAmount(signal.liquidity) > 50_000_000) score += 30;
  else if (signal.liquidity && parseDollarAmount(signal.liquidity) > 10_000_000) score += 20;
  if (signal.price && parseDollarAmount(signal.price) > 15_000_000) score += 25;
  else if (signal.price && parseDollarAmount(signal.price) > 10_000_000) score += 15;

  if (score >= 60) return "hot";
  if (score >= 30) return "warm";
  return "cool";
}

function parseDollarAmount(s: string): number {
  const cleaned = s.replace(/[$,\s]/g, "").toUpperCase();
  const match = cleaned.match(/^([\d.]+)([MBK]?)$/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  if (match[2] === "B") return n * 1_000_000_000;
  if (match[2] === "M") return n * 1_000_000;
  if (match[2] === "K") return n * 1_000;
  return n;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
