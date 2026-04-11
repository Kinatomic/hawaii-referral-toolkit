import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal, scoreSignal } from "@/lib/scrapers";

// Zillow / Bridge Interactive MLS API via RapidAPI
// Primary: RapidAPI Zillow56 (https://rapidapi.com/apimaker/api/zillow56)
// Alternative: Bridge Interactive MLS API (bridgeinteractive.com)

const RAPIDAPI_HOST = "zillow56.p.rapidapi.com";

const TARGET_MARKETS = [
  { city: "Beverly Hills", state: "CA", zip: "90210" },
  { city: "New York", state: "NY", zip: "10021" },
  { city: "San Francisco", state: "CA", zip: "94115" },
  { city: "Aspen", state: "CO", zip: "81611" },
  { city: "Miami", state: "FL", zip: "33139" },
];

interface ZillowProperty {
  zpid?: string;
  address?: string | { streetAddress?: string; city?: string; state?: string };
  price?: number;
  listPrice?: number;
  soldPrice?: number;
  soldDate?: string;
  listingAgent?: { name?: string; company?: string };
  buyerAgent?: { name?: string; company?: string };
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  url?: string;
}

function toSignal(prop: ZillowProperty, market: string): ScraperSignal {
  const price = prop.soldPrice ?? prop.listPrice ?? prop.price ?? 0;
  const priceStr = price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(1)}M` : `$${price.toLocaleString()}`;
  const address = typeof prop.address === "string"
    ? prop.address
    : `${prop.address?.streetAddress ?? ""}, ${prop.address?.city ?? market}`;
  const agentName = prop.listingAgent?.name ?? prop.buyerAgent?.name;
  const brokerage = prop.listingAgent?.company ?? prop.buyerAgent?.company;

  const signal: ScraperSignal = {
    date: prop.soldDate ?? new Date().toISOString().split("T")[0],
    signal: `${priceStr} sale — ${address}`,
    property: address,
    price: priceStr,
    market,
    tab: "market",
    source_type: "mls",
    source_url: prop.url,
    action: "Contact listing agent",
    priority: "warm",
    ...(agentName && { agent: agentName }),
    ...(brokerage && { brokerage }),
    raw_data: { zpid: prop.zpid, price, propertyType: prop.propertyType },
  };
  signal.priority = scoreSignal(signal);
  return signal;
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
      // Search recently sold luxury properties via RapidAPI Zillow
      const res = await fetch(
        `https://${RAPIDAPI_HOST}/search?location=${encodeURIComponent(`${market.city}, ${market.state}`)}&status_type=RecentlySold&sort=Newest&price_min=${minPrice}`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
          },
        }
      );

      if (!res.ok) {
        errors.push(`Zillow ${market.city}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const props: ZillowProperty[] = data.props ?? data.results ?? [];

      for (const prop of props.slice(0, 5)) {
        const price = prop.soldPrice ?? prop.listPrice ?? prop.price ?? 0;
        if (price < minPrice) continue;
        signals.push(toSignal(prop, `${market.city}, ${market.state}`));
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
