import { NextRequest, NextResponse } from "next/server";
import { ScraperResult, ScraperSignal, scoreSignal, daysAgoISO, todayISO } from "@/lib/scrapers";

// Hawaii County Property Records
// Source: Hawaii Bureau of Conveyances & individual county property tax databases
//
// Honolulu:  https://www.qpublic.net/hi/honolulu/
// Maui:      https://www.mauicounty.gov/2072/Real-Property-Tax-Division
// Hawaii:    https://www.hawaiipropertytax.com/
// Kauai:     https://kauai.gov/real-property
//
// For production, use a data provider like DataTree (First American),
// Attom Data Solutions, or CoreLogic for clean API access to deed recordings.
// This implementation queries the Honolulu County open data portal.

const HONOLULU_OPEN_DATA = "https://data.honolulu.gov/resource/7g4u-vp5r.json";
// Dataset: Residential Sales — Real Property Assessment Division

interface HonoluluSaleRecord {
  tmk?: string;
  sale_date?: string;
  sale_price?: string;
  buyer_name?: string;
  seller_name?: string;
  address?: string;
  zone_land_use?: string;
  land_area?: string;
  building_value?: string;
}

function isTrustOrLlc(name: string): boolean {
  const upper = name.toUpperCase();
  return upper.includes("LLC") || upper.includes("TRUST") || upper.includes("LP") ||
    upper.includes("INC") || upper.includes("CORP") || upper.includes("FUND");
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));
  const minPrice: number = body.minPrice ?? 5_000_000;
  const lookbackDays: number = body.lookbackDays ?? 30;

  const startDate = daysAgoISO(lookbackDays);
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  // ── Honolulu County (open data) ──────────────────────────────────────────
  try {
    const url = new URL(HONOLULU_OPEN_DATA);
    url.searchParams.set("$where", `sale_date >= '${startDate}' AND sale_price >= '${minPrice}'`);
    url.searchParams.set("$order", "sale_price DESC");
    url.searchParams.set("$limit", "20");

    const res = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      errors.push(`Honolulu open data: HTTP ${res.status}`);
    } else {
      const records: HonoluluSaleRecord[] = await res.json();

      for (const rec of records) {
        const price = parseFloat(rec.sale_price ?? "0");
        if (price < minPrice) continue;

        const priceStr = price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(1)}M` : `$${price.toLocaleString()}`;
        const buyerAnon = rec.buyer_name ? isTrustOrLlc(rec.buyer_name) : true;
        const address = rec.address ?? "Hawaii property";

        const signal: ScraperSignal = {
          date: rec.sale_date?.split("T")[0] ?? todayISO(),
          signal: `County Transfer — ${priceStr} · ${address}`,
          property: address,
          price: priceStr,
          market: "Honolulu",
          tab: "market",
          source_type: "county",
          source_url: `https://www.qpublic.net/hi/honolulu/search.html?q=${encodeURIComponent(rec.tmk ?? address)}`,
          action: "Research buyer entity",
          priority: "warm",
          detail: buyerAnon
            ? `Buyer: ${rec.buyer_name ?? "LLC/Trust (anonymous)"} — possible privacy-seeking UHNW acquisition`
            : `Buyer: ${rec.buyer_name} · Seller: ${rec.seller_name ?? "—"}`,
          inNetwork: false,
          raw_data: { tmk: rec.tmk, buyer: rec.buyer_name, seller: rec.seller_name, land_area: rec.land_area },
        };

        // Bump priority if buyer is anonymous (trust/LLC) — privacy seeker signal
        if (buyerAnon) {
          signal.tab = "privacy";
          signal.type = "Anonymous County Transfer";
          signal.detail = `${priceStr} purchase via ${rec.buyer_name ?? "LLC/Trust"} — identity research needed`;
          signal.action = "Research buyer entity via county records";
          signal.fitScore = 80;
        }

        signal.priority = scoreSignal(signal);
        signals.push(signal);
      }
    }
  } catch (e) {
    errors.push(`Honolulu open data: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── Note: Maui, Hawaii, Kauai county records require individual scraping ──
  // Production integration: use CoreLogic or ATTOM Data API for all counties
  // ATTOM: https://api.gateway.attomdata.com/propertyapi/v1.0.0/sale/snapshot

  return NextResponse.json({
    signals,
    run: {
      source: "county",
      timestamp: new Date().toISOString(),
      signals_found: signals.length,
      status: errors.length === 0 ? "success" : signals.length > 0 ? "partial" : "error",
      error: errors.length > 0 ? errors.join("; ") : undefined,
      duration_ms: Date.now() - startTime,
      notes: "Currently covers Honolulu County via open data. Maui/Kauai/Hawaii County require ATTOM API or manual entry.",
    },
  } as ScraperResult);
}

export async function GET() {
  return NextResponse.json({
    name: "Hawaii County Recorder Scraper",
    description: "Pulls high-value property transfers from Hawaii county deed records",
    auth_required: false,
    counties_covered: ["Honolulu (open data)"],
    counties_pending: ["Maui", "Hawaii County", "Kauai"],
    note: "For full multi-county coverage, integrate ATTOM Data Solutions API",
    attom_signup: "https://api.gateway.attomdata.com",
  });
}
