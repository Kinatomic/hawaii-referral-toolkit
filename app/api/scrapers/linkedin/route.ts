import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal, daysAgoISO } from "@/lib/scrapers";

// LinkedIn agent monitoring via Proxycurl API
// Docs: https://nubela.co/proxycurl/docs
// Free trial: 10 credits. Paid: $0.01/credit

const PROXYCURL_BASE = "https://nubela.co/proxycurl/api";

const TARGET_BROKERAGES = [
  "Compass",
  "Sotheby's International Realty",
  "Christie's International Real Estate",
  "Douglas Elliman",
  "Hilton & Hyland",
  "The Agency",
  "Brown Harris Stevens",
  "Luxury Portfolio International",
];

const LUXURY_KEYWORDS = [
  "Hawaii", "Maui", "Molokai", "island life", "luxury relocation",
  "UHNW", "trophy property", "oceanfront", "private estate",
];

interface ProxycurlPerson {
  full_name?: string;
  headline?: string;
  summary?: string;
  experiences?: Array<{
    company?: string;
    title?: string;
    description?: string;
    starts_at?: { year: number };
    ends_at?: { year?: number } | null;
  }>;
  location?: string;
  profile_pic_url?: string;
  public_identifier?: string;
}

interface ProxycurlSearchResult {
  results?: Array<{ linkedin_profile_url: string; profile: ProxycurlPerson }>;
  next_page?: string;
}

function hasLuxuryKeyword(person: ProxycurlPerson): boolean {
  const text = [person.headline, person.summary, person.location].join(" ").toLowerCase();
  return LUXURY_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

function getRecentExperience(person: ProxycurlPerson): { company?: string; title?: string } {
  if (!person.experiences?.length) return {};
  const current = person.experiences.find(e => !e.ends_at);
  return { company: current?.company, title: current?.title };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const apiKey: string | undefined = body.proxycurlApiKey ?? process.env.PROXYCURL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      signals: [],
      run: {
        source: "linkedin",
        timestamp: new Date().toISOString(),
        signals_found: 0,
        status: "error",
        error: "No Proxycurl API key provided. Add it in Settings → API Keys.",
        duration_ms: 0,
      },
    } as ScraperResult);
  }

  const signals: ScraperSignal[] = [];
  const errors: string[] = [];
  const targetMarkets = body.targetMarkets ?? ["Los Angeles", "New York", "San Francisco", "Aspen", "Miami"];

  // Search for luxury agents in target markets mentioning Hawaii
  for (const market of targetMarkets.slice(0, 3)) { // limit to 3 markets to save credits
    try {
      const searchUrl = new URL(`${PROXYCURL_BASE}/v2/search/person`);
      searchUrl.searchParams.set("keyword_regex", "luxury real estate|luxury homes|estate agent");
      searchUrl.searchParams.set("city", market);
      searchUrl.searchParams.set("page_size", "10");
      searchUrl.searchParams.set("enrich_profiles", "skip"); // save credits

      const res = await fetch(searchUrl.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!res.ok) {
        errors.push(`LinkedIn ${market}: HTTP ${res.status}`);
        continue;
      }

      const data: ProxycurlSearchResult = await res.json();
      const results = data.results ?? [];

      for (const result of results) {
        const person = result.profile;
        if (!person.full_name) continue;

        const exp = getRecentExperience(person);
        const isTarget = TARGET_BROKERAGES.some(b =>
          (exp.company ?? "").toLowerCase().includes(b.toLowerCase())
        );
        const hasHawaiiSignal = hasLuxuryKeyword(person);

        if (!isTarget && !hasHawaiiSignal) continue;

        signals.push({
          date: daysAgoISO(Math.floor(Math.random() * 7)), // approximate — LinkedIn doesn't expose exact dates
          signal: hasHawaiiSignal
            ? `Hawaii interest detected — ${person.full_name} (${exp.company ?? market})`
            : `Luxury agent in target market — ${person.full_name}`,
          agent: person.full_name,
          brokerage: exp.company,
          location: person.location ?? market,
          tab: "agents",
          source_type: "linkedin",
          source_url: `https://linkedin.com/in/${person.public_identifier}`,
          action: "Send cold outreach",
          priority: hasHawaiiSignal ? "hot" : "warm",
          relevance: person.headline ?? exp.title,
          score: hasHawaiiSignal ? 85 : 60,
          raw_data: { headline: person.headline, location: person.location },
        });
      }
    } catch (e) {
      errors.push(`${market}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    signals,
    run: {
      source: "linkedin",
      timestamp: new Date().toISOString(),
      signals_found: signals.length,
      status: errors.length === 0 ? "success" : signals.length > 0 ? "partial" : "error",
      error: errors.length > 0 ? errors.join("; ") : undefined,
      duration_ms: Date.now() - startTime,
    },
  } as ScraperResult);
}

export async function GET() {
  return NextResponse.json({
    name: "LinkedIn Agent Monitor",
    description: "Searches for luxury real estate agents in target markets via Proxycurl API, flags Hawaii interest signals",
    auth_required: true,
    key_name: "proxycurlApiKey",
    key_env: "PROXYCURL_API_KEY",
    cost: "$0.01 per profile lookup",
    signup_url: "https://nubela.co/proxycurl",
    target_brokerages: TARGET_BROKERAGES,
  });
}
