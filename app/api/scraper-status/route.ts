import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface SourceStatus {
  source: string;
  last_run?: string;
  signals_found?: number;
  status?: "success" | "error" | "partial";
  error?: string;
  freshness: "fresh" | "stale" | "old" | "never";
}

const SOURCES = ["sec", "news", "mls", "linkedin", "county"];

function getFreshness(lastRun?: string): SourceStatus["freshness"] {
  if (!lastRun) return "never";
  const daysSince = (Date.now() - new Date(lastRun).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 3) return "fresh";
  if (daysSince < 7) return "stale";
  return "old";
}

export async function GET() {
  const statuses: SourceStatus[] = [];

  try {
    // Try to read from Supabase scraper_runs table
    const { data, error } = await supabase
      .from("scraper_runs")
      .select("source, ran_at, signals_found, status, error")
      .order("ran_at", { ascending: false });

    if (!error && data) {
      const latestBySource = new Map<string, typeof data[0]>();
      for (const row of data) {
        if (!latestBySource.has(row.source)) latestBySource.set(row.source, row);
      }

      for (const source of SOURCES) {
        const row = latestBySource.get(source);
        statuses.push({
          source,
          last_run: row?.ran_at,
          signals_found: row?.signals_found,
          status: row?.status,
          error: row?.error,
          freshness: getFreshness(row?.ran_at),
        });
      }

      return NextResponse.json({ statuses, source: "supabase" });
    }
  } catch {
    // Supabase not configured — fall through to default
  }

  // Fallback: return never-run status for all sources
  for (const source of SOURCES) {
    statuses.push({ source, freshness: "never" });
  }

  return NextResponse.json({ statuses, source: "default" });
}
