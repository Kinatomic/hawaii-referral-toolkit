import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal, scoreSignal, daysAgoISO } from "@/lib/scrapers";

// NewsAPI.org — free tier: 100 req/day, 30 days history
// Docs: https://newsapi.org/docs/endpoints/everything

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  author?: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
  message?: string;
  code?: string;
}

const QUERY_GROUPS = [
  {
    q: '"tech IPO" OR "PE exit" OR "venture exit" OR "liquidity event" UHNW wealthy',
    tab: "liquidity" as const,
    signalPrefix: "Liquidity Event",
    action: "Research principals",
  },
  {
    q: '"luxury real estate" Hawaii OR Maui OR Molokai "$10M" OR "$15M" OR "$20M"',
    tab: "market" as const,
    signalPrefix: "Luxury Market News",
    action: "Follow up with listing agent",
  },
  {
    q: '"relocation" Hawaii OR "moving to Hawaii" luxury celebrity executive',
    tab: "privacy" as const,
    signalPrefix: "Relocation Signal",
    action: "Identify buyer profile",
  },
  {
    q: '"luxury brokerage" OR "top real estate agent" Sotheby OR Compass OR "Douglas Elliman" hired OR joined',
    tab: "agents" as const,
    signalPrefix: "Agent Move",
    action: "Introduce Hawaii referral program",
  },
];

function extractPersonName(title: string, description: string): string | undefined {
  // Heuristic: capitalized name followed by company verb
  const match = title.match(/^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  return match?.[1];
}

function classifyAmount(text: string): string | undefined {
  const match = text.match(/\$(\d+(?:\.\d+)?)\s*[Bb]illion|\$(\d+(?:\.\d+)?)\s*[Mm](?:illion)?/i);
  if (!match) return undefined;
  if (match[1]) return `$${match[1]}B`;
  if (match[2]) return `$${match[2]}M`;
  return undefined;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const apiKey: string | undefined = body.newsApiKey ?? process.env.NEWS_API_KEY;
  const lookbackDays: number = body.lookbackDays ?? 3;

  if (!apiKey) {
    return NextResponse.json({
      signals: [],
      run: {
        source: "news",
        timestamp: new Date().toISOString(),
        signals_found: 0,
        status: "error",
        error: "No NewsAPI key provided. Add it in Settings → API Keys.",
        duration_ms: 0,
      },
    } as ScraperResult);
  }

  const from = daysAgoISO(lookbackDays);
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  for (const group of QUERY_GROUPS) {
    try {
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.set("q", group.q);
      url.searchParams.set("from", from);
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("language", "en");
      url.searchParams.set("pageSize", "10");

      const res = await fetch(url.toString(), {
        headers: { "X-Api-Key": apiKey },
      });
      const data: NewsApiResponse = await res.json();

      if (data.status !== "ok") {
        errors.push(`News API (${group.tab}): ${data.message ?? data.code ?? "Unknown error"}`);
        continue;
      }

      for (const article of data.articles) {
        const text = `${article.title} ${article.description ?? ""}`;
        const person = extractPersonName(article.title, article.description ?? "");
        const liquidity = group.tab === "liquidity" ? classifyAmount(text) : undefined;

        const signal: ScraperSignal = {
          date: article.publishedAt.split("T")[0],
          signal: `${group.signalPrefix} — ${article.title.slice(0, 80)}${article.title.length > 80 ? "…" : ""}`,
          tab: group.tab,
          source_type: "news",
          source_url: article.url,
          priority: "cool",
          action: group.action,
          detail: article.description ?? undefined,
          ...(person && { person }),
          ...(liquidity && { liquidity }),
          raw_data: {
            title: article.title,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
          },
        };
        signal.priority = scoreSignal({ ...signal, liquidity });
        signals.push(signal);
      }
    } catch (e) {
      errors.push(`${group.tab}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const run = {
    source: "news",
    timestamp: new Date().toISOString(),
    signals_found: signals.length,
    status: (errors.length === 0 ? "success" : signals.length > 0 ? "partial" : "error") as "success" | "error" | "partial",
    error: errors.length > 0 ? errors.join("; ") : undefined,
    duration_ms: Date.now() - startTime,
  };

  return NextResponse.json({ signals, run } as ScraperResult);
}

export async function GET() {
  return NextResponse.json({
    name: "News Intelligence Scraper",
    description: "Searches NewsAPI.org for UHNW liquidity events, luxury real estate news, and agent activity",
    auth_required: true,
    key_name: "newsApiKey",
    key_env: "NEWS_API_KEY",
    free_tier: "100 requests/day, 30-day history",
    signup_url: "https://newsapi.org/register",
  });
}
