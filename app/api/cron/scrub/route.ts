import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal } from "@/lib/scrapers";
import { scrapeSec, scrapeNews, scrapeZillow, scrapeLinkedIn, scrapeCounty } from "@/lib/scraper-core";
import { supabase } from "@/lib/supabase";

// ── Cron Orchestrator ──────────────────────────────────────────────────────
// GET  — called by Vercel cron (requires CRON_SECRET header)
// POST — called manually from the UI (includes API keys in body)

interface ScrubBody {
  sources?: string[];
  newsApiKey?: string;
  rapidApiKey?: string;
  anthropicKey?: string;
  minPrice?: number;
  lookbackDays?: number;
  autoResearchHot?: boolean;
}

function deduplicateSignals(incoming: ScraperSignal[], existing: ScraperSignal[]): ScraperSignal[] {
  const existingKeys = new Set(
    existing.map(s => `${s.date}|${(s.signal ?? "").slice(0, 50)}|${s.source_type}`)
  );
  return incoming.filter(s => {
    const key = `${s.date}|${(s.signal ?? "").slice(0, 50)}|${s.source_type}`;
    return !existingKeys.has(key);
  });
}

async function persistToSupabase(signals: ScraperSignal[], runs: ScraperResult["run"][]) {
  try {
    if (signals.length > 0) {
      await supabase.from("signals").insert(
        signals.map(s => ({
          date: s.date,
          title: s.signal ?? s.property ?? "",
          detail: s.detail,
          person: s.person,
          location: s.location,
          agent: s.agent,
          priority: s.priority,
          score: s.score ?? s.ai_score ?? null,
          source_type: s.source_type,
          source_url: s.source_url,
          raw_data: s.raw_data ?? null,
          type: s.tab,
          action: s.action,
        }))
      );
    }
    for (const run of runs) {
      await supabase.from("scraper_runs").insert({
        source: run.source,
        ran_at: run.timestamp,
        signals_found: run.signals_found,
        status: run.status,
        error: run.error ?? null,
        duration_ms: run.duration_ms ?? null,
      });
    }
  } catch {
    // Supabase may not be configured — fail silently
  }
}

export async function POST(request: NextRequest) {
  const body: ScrubBody = await request.json().catch(() => ({}));
  const sources = body.sources ?? ["sec", "news", "zillow", "linkedin", "county"];
  const minPrice = body.minPrice ?? 10_000_000;
  const lookbackDays = body.lookbackDays ?? 7;

  const results: Record<string, ScraperResult> = {};

  // Run scrapers concurrently using direct function imports (no internal HTTP)
  await Promise.all([
    sources.includes("sec") &&
      scrapeSec({ lookbackDays })
        .then(r => { results.sec = r; })
        .catch(e => { results.sec = errorResult("sec", e); }),

    sources.includes("news") && body.newsApiKey &&
      scrapeNews({ apiKey: body.newsApiKey, lookbackDays })
        .then(r => { results.news = r; })
        .catch(e => { results.news = errorResult("news", e); }),

    sources.includes("zillow") && body.rapidApiKey &&
      scrapeZillow({ apiKey: body.rapidApiKey, minPrice })
        .then(r => { results.zillow = r; })
        .catch(e => { results.zillow = errorResult("mls", e); }),

    sources.includes("linkedin") && body.rapidApiKey &&
      scrapeLinkedIn({ apiKey: body.rapidApiKey })
        .then(r => { results.linkedin = r; })
        .catch(e => { results.linkedin = errorResult("linkedin", e); }),

    sources.includes("county") &&
      scrapeCounty({ minPrice: Math.min(minPrice, 5_000_000), lookbackDays: 30 })
        .then(r => { results.county = r; })
        .catch(e => { results.county = errorResult("county", e); }),
  ]);

  const allSignals: ScraperSignal[] = Object.values(results).flatMap(r => r.signals);
  const runs = Object.values(results).map(r => r.run);

  // Deduplicate
  const unique = deduplicateSignals(allSignals, []);

  // Persist to Supabase if configured
  await persistToSupabase(unique, runs);

  const summary = {
    total_signals: unique.length,
    hot: unique.filter(s => s.priority === "hot").length,
    warm: unique.filter(s => s.priority === "warm").length,
    cool: unique.filter(s => s.priority === "cool").length,
    by_source: Object.fromEntries(
      Object.entries(results).map(([src, r]) => [src, r.run.signals_found])
    ),
    runs: runs.map(r => ({
      source: r.source,
      status: r.status,
      signals: r.signals_found,
      error: r.error,
      timestamp: r.timestamp,
    })),
    ran_at: new Date().toISOString(),
  };

  return NextResponse.json({ summary, signals: unique });
}

function errorResult(source: string, e: unknown): ScraperResult {
  return {
    signals: [],
    run: {
      source,
      timestamp: new Date().toISOString(),
      signals_found: 0,
      status: "error",
      error: e instanceof Error ? e.message : String(e),
    },
  };
}

// GET is called by Vercel cron job
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Run free sources only for automated cron
  const body: ScrubBody = {
    sources: ["sec", "news", "county"],
    newsApiKey: process.env.NEWS_API_KEY,
    minPrice: 10_000_000,
    lookbackDays: 7,
  };

  const mockRequest = new NextRequest("http://localhost/api/cron/scrub", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return POST(mockRequest);
}
