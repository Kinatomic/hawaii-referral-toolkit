import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal, scoreSignal } from "@/lib/scrapers";

const RAPIDAPI_HOST = "zillow56.p.rapidapi.com";

const TARGET_MARKETS = [
  { city: "Beverly Hills", state: "CA" },
  { city: "New York",      state: "NY" },
  { city: "San Francisco", state: "CA" },
  { city: "Aspen",         state: "CO" },
  { city: "Miami",         state: "FL" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function extractListings(data: AnyObj): AnyObj[] {
  for (const key of ["results", "props", "searchResults", "listings", "homes", "data"]) {
    if (Array.isArray(data[key]) && data[key].length > 0) return data[key] as AnyObj[];
  }
  if (Array.isArray(data)) return data as AnyObj[];
  return [];
}

function extractPrice(p: AnyObj): number {
  return (
    p.soldPrice ?? p.lastSoldPrice ?? p.price ?? p.listPrice ??
    p.unformattedPrice ?? p.hdpData?.homeInfo?.price ??
    p.hdpData?.homeInfo?.soldPrice ?? 0
  );
}

function extractAddress(p: AnyObj, marketFallback: string): string {
  const a = p.address ?? p.streetAddress ?? p.hdpData?.homeInfo?.streetAddress;
  if (typeof a === "string" && a.trim()) return a.trim();
  if (a && typeof a === "object") {
    const parts = [a.streetAddress, a.city, a.state, a.zipcode].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  const street = p.streetAddress ?? p.street ?? "";
  const city   = p.city ?? "";
  const state  = p.state ?? "";
  if (street) return [street, city, state].filter(Boolean).join(", ");
  return marketFallback;
}

function extractDate(p: AnyObj): string {
  const raw = p.soldDate ?? p.dateSold ?? p.lastSoldDate ?? p.listedDate ?? p.listingDate;
  if (!raw) return new Date().toISOString().split("T")[0];
  if (typeof raw === "number") return new Date(raw).toISOString().split("T")[0];
  return String(raw).split("T")[0];
}

function extractAgentBrokerage(p: AnyObj): { agent?: string; brokerage?: string } {
  const agentName =
    p.listingAgent?.name ?? p.listingAgent?.displayName ??
    p.agentName ?? p.agent?.name ?? p.brokerName ??
    p.attribution?.agentName ?? p.hdpData?.homeInfo?.agentName ??
    p.buyerAgent?.name;
  const brokerageName =
    p.listingAgent?.company ?? p.listingAgent?.businessName ??
    p.brokerage ?? p.brokerageName ?? p.attribution?.brokerName ??
    p.hdpData?.homeInfo?.brokerName ?? p.buyerAgent?.company;
  return {
    ...(agentName     ? { agent:     String(agentName)     } : {}),
    ...(brokerageName ? { brokerage: String(brokerageName) } : {}),
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const apiKey: string | undefined = body.rapidApiKey ?? body.zillowApiKey ?? process.env.ZILLOW_RAPIDAPI_KEY;
  const minPrice: number = body.minPrice ?? 10_000_000;

  if (!apiKey) {
    return NextResponse.json({
      signals: [],
      run: {
        source: "mls",
        timestamp: new Date().toISOString(),
        signals_found: 0,
        status: "error",
        error: "No Zillow/RapidAPI key provided. Add it in Settings → API Keys.",
        duration_ms: 0,
      },
    } as ScraperResult);
  }

  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  for (const market of TARGET_MARKETS) {
    try {
      const location = `${market.city}, ${market.state}`;
      const res = await fetch(
        `https://${RAPIDAPI_HOST}/search?location=${encodeURIComponent(location)}&status_type=RecentlySold&sort=Newest&price_min=${minPrice}`,
        { headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": RAPIDAPI_HOST } }
      );

      if (!res.ok) {
        errors.push(`Zillow ${market.city}: HTTP ${res.status}`);
        continue;
      }

      const data: AnyObj = await res.json();
      const listings = extractListings(data);

      if (listings.length === 0) {
        errors.push(`Zillow ${market.city}: 0 listings — top-level keys: [${Object.keys(data).join(", ")}]`);
        continue;
      }

      for (const prop of listings.slice(0, 5)) {
        const priceRaw = extractPrice(prop);
        const priceStr = priceRaw >= 1_000_000
          ? `$${(priceRaw / 1_000_000).toFixed(1)}M`
          : priceRaw > 0 ? `$${priceRaw.toLocaleString()}` : "";
        const address = extractAddress(prop, location);
        const { agent, brokerage } = extractAgentBrokerage(prop);

        const signal: ScraperSignal = {
          date: extractDate(prop),
          signal: priceStr ? `${priceStr} sale — ${address}` : `Recent sale — ${address}`,
          property: address,
          price: priceStr || undefined,
          market: location,
          tab: "market",
          source_type: "mls",
          source_url: prop.url ?? prop.detailUrl ?? prop.hdpUrl,
          action: "Contact listing agent",
          priority: "warm",
          ...(agent     && { agent }),
          ...(brokerage && { brokerage }),
          raw_data: { ...prop }, // full object stored for field inspection
        };
        signal.priority = scoreSignal(signal);
        signals.push(signal);
      }
    } catch (e) {
      errors.push(`${market.city}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    signals,
    run: {
      source: "mls",
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
    name: "MLS / Zillow Scraper",
    description: "Pulls $10M+ recent property closings from target luxury markets via RapidAPI Zillow",
    auth_required: true,
    key_name: "zillowApiKey",
    key_env: "ZILLOW_RAPIDAPI_KEY",
    signup_url: "https://rapidapi.com/apimaker/api/zillow56",
    target_markets: TARGET_MARKETS.map(m => `${m.city}, ${m.state}`),
  });
}
