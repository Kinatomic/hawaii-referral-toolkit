import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal, scoreSignal, todayISO, daysAgoISO } from "@/lib/scrapers";

// SEC EDGAR full-text search API (free, no auth required)
// Docs: https://efts.sec.gov/LATEST/search-index
const EDGAR_SEARCH = "https://efts.sec.gov/LATEST/search-index";
const EDGAR_ARCHIVES = "https://www.sec.gov/Archives/edgar/data";

interface EdgarHit {
  _id: string;
  _source: {
    file_date: string;
    entity_name: string;
    file_type: string;
    period_of_report?: string;
    biz_location?: string;
  };
}

interface EdgarResponse {
  hits: {
    hits: EdgarHit[];
    total: { value: number };
  };
}

async function fetchEdgar(params: Record<string, string>): Promise<EdgarHit[]> {
  const url = new URL(EDGAR_SEARCH);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "PacificIslandPartners research@islandsothebys.com" },
  });
  if (!res.ok) throw new Error(`EDGAR API ${res.status}: ${res.statusText}`);
  const data: EdgarResponse = await res.json();
  return data.hits?.hits ?? [];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const lookbackDays: number = body.lookbackDays ?? 7;
  const minAmount: number = body.minAmount ?? 10_000_000;

  const startDate = daysAgoISO(lookbackDays);
  const endDate = todayISO();
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  // ── 1. Recent S-1 IPO filings ─────────────────────────────────────────────
  try {
    const s1Hits = await fetchEdgar({
      q: "",
      forms: "S-1",
      dateRange: "custom",
      startdt: startDate,
      enddt: endDate,
      "_source": "file_date,entity_name,file_type,period_of_report",
    });

    for (const hit of s1Hits.slice(0, 20)) {
      const { entity_name, file_date } = hit._source;
      const signal: ScraperSignal = {
        date: file_date,
        signal: `IPO Filing (S-1) — ${entity_name}`,
        person: entity_name,
        location: "SEC Filing",
        tab: "liquidity",
        source_type: "sec",
        source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(entity_name)}&type=S-1&dateb=&owner=include&count=10`,
        action: "Research founders",
        priority: "warm",
        raw_data: { accession: hit._id, form_type: "S-1" },
      };
      signal.priority = scoreSignal(signal);
      signals.push(signal);
    }
  } catch (e) {
    errors.push(`S-1 fetch: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── 2. Form 4 insider sales with high amounts ──────────────────────────────
  try {
    const f4Hits = await fetchEdgar({
      q: "",
      forms: "4",
      dateRange: "custom",
      startdt: startDate,
      enddt: endDate,
      "_source": "file_date,entity_name,file_type",
    });

    // Only include a sample — Form 4s are voluminous; pick top filers
    const uniqueCompanies = new Map<string, EdgarHit>();
    for (const hit of f4Hits) {
      const name = hit._source.entity_name;
      if (!uniqueCompanies.has(name)) uniqueCompanies.set(name, hit);
    }

    for (const [company, hit] of Array.from(uniqueCompanies).slice(0, 10)) {
      const signal: ScraperSignal = {
        date: hit._source.file_date,
        signal: `Insider Sale (Form 4) — ${company}`,
        person: company,
        tab: "liquidity",
        source_type: "sec",
        source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(company)}&type=4&dateb=&owner=include&count=10`,
        action: "Identify insiders",
        priority: "cool",
        raw_data: { accession: hit._id, form_type: "4" },
      };
      signal.priority = scoreSignal(signal);
      signals.push(signal);
    }
  } catch (e) {
    errors.push(`Form 4 fetch: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── 3. 13F fund disclosures (major investment moves) ─────────────────────
  try {
    const f13Hits = await fetchEdgar({
      q: "Hawaii luxury real estate",
      forms: "13F-HR",
      dateRange: "custom",
      startdt: daysAgoISO(90), // 13Fs are quarterly
      enddt: endDate,
      "_source": "file_date,entity_name",
    });

    for (const hit of f13Hits.slice(0, 5)) {
      const signal: ScraperSignal = {
        date: hit._source.file_date,
        signal: `Fund Disclosure (13F) — ${hit._source.entity_name}`,
        person: hit._source.entity_name,
        tab: "liquidity",
        source_type: "sec",
        source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(hit._source.entity_name)}&type=13F&dateb=&owner=include&count=10`,
        action: "Research fund partners",
        priority: "warm",
        raw_data: { accession: hit._id, form_type: "13F-HR" },
      };
      signals.push(signal);
    }
  } catch (e) {
    errors.push(`13F fetch: ${e instanceof Error ? e.message : String(e)}`);
  }

  const run = {
    source: "sec",
    timestamp: new Date().toISOString(),
    signals_found: signals.length,
    status: (errors.length === 0 ? "success" : signals.length > 0 ? "partial" : "error") as "success" | "error" | "partial",
    error: errors.length > 0 ? errors.join("; ") : undefined,
    duration_ms: Date.now() - startTime,
  };

  const result: ScraperResult = { signals, run };
  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({
    name: "SEC EDGAR Scraper",
    description: "Queries EDGAR for S-1 IPO filings, Form 4 insider sales, and 13F disclosures",
    auth_required: false,
    endpoints_used: ["efts.sec.gov/LATEST/search-index"],
    forms: ["S-1", "4", "13F-HR"],
  });
}
