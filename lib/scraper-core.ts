// ── Scraper logic as importable functions ─────────────────────────────────
// The orchestrator imports these directly (no internal HTTP calls).
// Each route handler also calls these so they remain individually testable.

import { ScraperResult, ScraperSignal, scoreSignal, todayISO, daysAgoISO } from "./scrapers";

// ─────────────────────────────────────────────────────────────────────────────
// SEC EDGAR  (free, no auth)
// ─────────────────────────────────────────────────────────────────────────────
interface EdgarHit {
  _id: string;
  _source: {
    file_date: string;
    entity_name: string;
    file_type?: string;
    period_of_report?: string;
  };
}

async function fetchEdgar(params: Record<string, string>): Promise<EdgarHit[]> {
  const url = new URL("https://efts.sec.gov/LATEST/search-index");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "PacificIslandPartners research@islandsothebys.com" },
  });
  if (!res.ok) throw new Error(`EDGAR ${res.status}`);
  const json = await res.json();
  return (json as { hits?: { hits?: EdgarHit[] } }).hits?.hits ?? [];
}

export interface SecOptions { lookbackDays?: number }
export async function scrapeSec(opts: SecOptions = {}): Promise<ScraperResult> {
  const startTime = Date.now();
  const start = daysAgoISO(opts.lookbackDays ?? 7);
  const end = todayISO();
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  // S-1 IPO filings
  try {
    const hits = await fetchEdgar({ q: "", forms: "S-1", dateRange: "custom", startdt: start, enddt: end });
    for (const h of hits.slice(0, 15)) {
      const sig: ScraperSignal = {
        date: h._source.file_date,
        signal: `IPO Filing (S-1) — ${h._source.entity_name}`,
        person: h._source.entity_name,
        tab: "liquidity",
        source_type: "sec",
        source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(h._source.entity_name)}&type=S-1&dateb=&owner=include&count=10`,
        action: "Research founders",
        priority: "warm",
        raw_data: { accession: h._id, form: "S-1" },
      };
      sig.priority = scoreSignal(sig);
      signals.push(sig);
    }
  } catch (e) { errors.push(`S-1: ${e instanceof Error ? e.message : String(e)}`); }

  // Form 4 insider sales
  try {
    const hits = await fetchEdgar({ q: "", forms: "4", dateRange: "custom", startdt: start, enddt: end });
    const seen = new Set<string>();
    for (const h of hits) {
      if (seen.has(h._source.entity_name)) continue;
      seen.add(h._source.entity_name);
      if (seen.size > 10) break;
      signals.push({
        date: h._source.file_date,
        signal: `Insider Sale (Form 4) — ${h._source.entity_name}`,
        person: h._source.entity_name,
        tab: "liquidity",
        source_type: "sec",
        source_url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(h._source.entity_name)}&type=4&dateb=&owner=include&count=10`,
        action: "Identify insiders",
        priority: "cool",
        raw_data: { accession: h._id, form: "4" },
      });
    }
  } catch (e) { errors.push(`Form4: ${e instanceof Error ? e.message : String(e)}`); }

  return makeResult("sec", signals, errors, startTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// NEWS  (NewsAPI.org)
// ─────────────────────────────────────────────────────────────────────────────
const NEWS_QUERIES = [
  { q: '"tech IPO" OR "PE exit" OR "venture exit" OR "liquidity event"', tab: "liquidity" as const, prefix: "Liquidity Event", action: "Research principals" },
  { q: '"luxury real estate" Hawaii OR Maui OR Molokai "$10M" OR "$15M"', tab: "market" as const, prefix: "Luxury Market News", action: "Follow up with listing agent" },
  { q: 'Hawaii relocation luxury celebrity executive OR entrepreneur', tab: "privacy" as const, prefix: "Relocation Signal", action: "Identify buyer profile" },
  { q: '"luxury brokerage" OR "top agent" Sotheby OR Compass OR Elliman hired OR joined', tab: "agents" as const, prefix: "Agent Move", action: "Introduce Hawaii referral program" },
];

export interface NewsOptions { apiKey: string; lookbackDays?: number }
export async function scrapeNews(opts: NewsOptions): Promise<ScraperResult> {
  const startTime = Date.now();
  const from = daysAgoISO(opts.lookbackDays ?? 3);
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  for (const g of NEWS_QUERIES) {
    try {
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.set("q", g.q);
      url.searchParams.set("from", from);
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("language", "en");
      url.searchParams.set("pageSize", "8");
      const res = await fetch(url.toString(), { headers: { "X-Api-Key": opts.apiKey } });
      const data = await res.json() as { status: string; articles?: Array<{ title: string; description?: string | null; url: string; publishedAt: string; source: { name: string } }>; message?: string };
      if (data.status !== "ok") { errors.push(`${g.tab}: ${data.message ?? "API error"}`); continue; }
      for (const a of (data.articles ?? [])) {
        const text = `${a.title} ${a.description ?? ""}`;
        const amountMatch = text.match(/\$(\d+(?:\.\d+)?)\s*[Bb]illion|\$(\d+(?:\.\d+)?)\s*[Mm]/i);
        const liquidity = amountMatch ? (amountMatch[1] ? `$${amountMatch[1]}B` : `$${amountMatch[2]}M`) : undefined;
        const sig: ScraperSignal = {
          date: a.publishedAt.split("T")[0],
          signal: `${g.prefix} — ${a.title.slice(0, 90)}${a.title.length > 90 ? "…" : ""}`,
          tab: g.tab,
          source_type: "news",
          source_url: a.url,
          priority: "cool",
          action: g.action,
          detail: a.description ?? undefined,
          ...(liquidity && { liquidity }),
          raw_data: { title: a.title, source: a.source.name },
        };
        sig.priority = scoreSignal({ ...sig, liquidity });
        signals.push(sig);
      }
    } catch (e) { errors.push(`${g.tab}: ${e instanceof Error ? e.message : String(e)}`); }
  }

  return makeResult("news", signals, errors, startTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// MLS / ZILLOW  (RapidAPI Zillow56)
// ─────────────────────────────────────────────────────────────────────────────
const ZILLOW_HOST = "zillow56.p.rapidapi.com";
const LUXURY_MARKETS = ["Beverly Hills, CA", "New York, NY", "San Francisco, CA", "Aspen, CO", "Miami, FL"];

export interface ZillowOptions { apiKey: string; minPrice?: number }
export async function scrapeZillow(opts: ZillowOptions): Promise<ScraperResult> {
  const startTime = Date.now();
  const minPrice = opts.minPrice ?? 10_000_000;
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  for (const market of LUXURY_MARKETS) {
    try {
      const res = await fetch(
        `https://${ZILLOW_HOST}/search?location=${encodeURIComponent(market)}&status_type=RecentlySold&sort=Newest&price_min=${minPrice}`,
        { headers: { "X-RapidAPI-Key": opts.apiKey, "X-RapidAPI-Host": ZILLOW_HOST } }
      );
      if (!res.ok) { errors.push(`Zillow ${market}: ${res.status}`); continue; }
      const data = await res.json() as { props?: Array<{ zpid?: string; address?: string | { streetAddress?: string; city?: string }; soldPrice?: number; listPrice?: number; price?: number; soldDate?: string; listingAgent?: { name?: string; company?: string }; propertyType?: string }> };
      const props = data.props ?? [];
      for (const p of props.slice(0, 5)) {
        const price = p.soldPrice ?? p.listPrice ?? p.price ?? 0;
        if (price < minPrice) continue;
        const priceStr = price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(1)}M` : `$${price.toLocaleString()}`;
        const addr = typeof p.address === "string" ? p.address : `${(p.address as {streetAddress?: string})?.streetAddress ?? ""}, ${market}`;
        const sig: ScraperSignal = {
          date: p.soldDate?.split("T")[0] ?? todayISO(),
          signal: `${priceStr} sale — ${addr}`,
          property: addr,
          price: priceStr,
          market,
          tab: "market",
          source_type: "mls",
          action: "Contact listing agent",
          priority: "warm",
          ...(p.listingAgent?.name && { agent: p.listingAgent.name }),
          ...(p.listingAgent?.company && { brokerage: p.listingAgent.company }),
          raw_data: { zpid: p.zpid, price, propertyType: p.propertyType },
        };
        sig.priority = scoreSignal(sig);
        signals.push(sig);
      }
    } catch (e) { errors.push(`${market}: ${e instanceof Error ? e.message : String(e)}`); }
  }

  return makeResult("mls", signals, errors, startTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// LINKEDIN  (RapidAPI Real-Time LinkedIn Scraper)
// ─────────────────────────────────────────────────────────────────────────────
// Supports multiple RapidAPI LinkedIn products — tries in order until one works.
const LINKEDIN_HOSTS = [
  "real-time-linkedin-scraper.p.rapidapi.com",
  "linkedin-data-api.p.rapidapi.com",
  "fresh-linkedin-profile-data.p.rapidapi.com",
];

const LUXURY_KEYWORDS = ["hawaii", "maui", "molokai", "island", "oceanfront", "luxury relocation", "uhnw"];
const TARGET_TITLES = ["luxury real estate", "luxury homes", "estate agent", "luxury broker", "private client"];

export interface LinkedInOptions { apiKey: string; targetMarkets?: string[] }
export async function scrapeLinkedIn(opts: LinkedInOptions): Promise<ScraperResult> {
  const startTime = Date.now();
  const markets = opts.targetMarkets ?? ["Los Angeles", "New York", "San Francisco", "Miami", "Aspen"];
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  // Try each host until one works (user may be subscribed to a different LinkedIn API)
  for (const market of markets.slice(0, 3)) {
    let fetched = false;
    for (const host of LINKEDIN_HOSTS) {
      try {
        const searchUrl = `https://${host}/search/people?keywords=luxury+real+estate+agent&location=${encodeURIComponent(market)}&count=10`;
        const res = await fetch(searchUrl, {
          headers: { "X-RapidAPI-Key": opts.apiKey, "X-RapidAPI-Host": host },
        });
        if (res.status === 403 || res.status === 401) continue; // not subscribed to this host
        if (!res.ok) { errors.push(`LinkedIn ${host} ${market}: ${res.status}`); continue; }
        const raw = await res.json() as { results?: Array<{ fullName?: string; headline?: string; summary?: string; location?: string; company?: string; linkedinUrl?: string }> | { items?: Array<{ full_name?: string; headline?: string; location?: string; company?: string; profile_url?: string }> } };

        // Normalize different response shapes
        type RawResult = { fullName?: string; full_name?: string; headline?: string; summary?: string; location?: string; company?: string; linkedinUrl?: string; profile_url?: string };
        const items: RawResult[] = Array.isArray(raw.results) ? raw.results as RawResult[] : (raw.results as { items?: RawResult[] })?.items ?? [];

        for (const person of items) {
          const name = person.fullName ?? person.full_name ?? "";
          if (!name) continue;
          const bio = [person.headline, person.summary, person.location].join(" ").toLowerCase();
          const hasHawaii = LUXURY_KEYWORDS.some(kw => bio.includes(kw));
          const isLuxury = TARGET_TITLES.some(t => bio.includes(t));
          if (!isLuxury && !hasHawaii) continue;

          signals.push({
            date: daysAgoISO(Math.floor(Math.random() * 5)),
            signal: hasHawaii
              ? `Hawaii interest — ${name} (${person.company ?? market})`
              : `Luxury agent in target market — ${name}`,
            agent: name,
            brokerage: person.company,
            location: person.location ?? market,
            tab: "agents",
            source_type: "linkedin",
            source_url: person.linkedinUrl ?? person.profile_url,
            action: "Send cold outreach",
            priority: hasHawaii ? "hot" : "warm",
            relevance: person.headline,
            score: hasHawaii ? 85 : 60,
            raw_data: { host, headline: person.headline },
          });
        }
        fetched = true;
        break;
      } catch (e) { errors.push(`${host} ${market}: ${e instanceof Error ? e.message : String(e)}`); }
    }
    if (!fetched) errors.push(`LinkedIn ${market}: no working API host found`);
  }

  return makeResult("linkedin", signals, errors, startTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTY RECORDS  (Honolulu open data — free)
// ─────────────────────────────────────────────────────────────────────────────
const HONOLULU_DATA = "https://data.honolulu.gov/resource/7g4u-vp5r.json";

export interface CountyOptions { minPrice?: number; lookbackDays?: number }
export async function scrapeCounty(opts: CountyOptions = {}): Promise<ScraperResult> {
  const startTime = Date.now();
  const minPrice = opts.minPrice ?? 5_000_000;
  const startDate = daysAgoISO(opts.lookbackDays ?? 30);
  const signals: ScraperSignal[] = [];
  const errors: string[] = [];

  try {
    const url = new URL(HONOLULU_DATA);
    url.searchParams.set("$where", `sale_date >= '${startDate}' AND sale_price >= '${minPrice}'`);
    url.searchParams.set("$order", "sale_price DESC");
    url.searchParams.set("$limit", "15");
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Honolulu open data: ${res.status}`);
    const records = await res.json() as Array<{ tmk?: string; sale_date?: string; sale_price?: string; buyer_name?: string; seller_name?: string; address?: string }>;

    for (const rec of records) {
      const price = parseFloat(rec.sale_price ?? "0");
      if (price < minPrice) continue;
      const priceStr = price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(1)}M` : `$${price.toLocaleString()}`;
      const buyer = rec.buyer_name ?? "";
      const isAnon = /LLC|TRUST|LP\b|INC\b|CORP|FUND/i.test(buyer);
      const addr = rec.address ?? "Honolulu property";
      const sig: ScraperSignal = {
        date: rec.sale_date?.split("T")[0] ?? todayISO(),
        signal: `County Transfer — ${priceStr} · ${addr}`,
        property: addr,
        price: priceStr,
        market: "Honolulu",
        tab: isAnon ? "privacy" : "market",
        source_type: "county",
        source_url: `https://www.qpublic.net/hi/honolulu/search.html?q=${encodeURIComponent(rec.tmk ?? addr)}`,
        action: isAnon ? "Research buyer entity" : "Contact seller agent",
        priority: "warm",
        detail: isAnon
          ? `Buyer: ${buyer || "LLC/Trust"} — possible privacy-seeking UHNW acquisition`
          : `Buyer: ${buyer} · Seller: ${rec.seller_name ?? "—"}`,
        ...(isAnon && { type: "Anonymous County Transfer", fitScore: 80 }),
        inNetwork: false,
        raw_data: { tmk: rec.tmk, buyer, seller: rec.seller_name },
      };
      sig.priority = scoreSignal(sig);
      signals.push(sig);
    }
  } catch (e) { errors.push(e instanceof Error ? e.message : String(e)); }

  return makeResult("county", signals, errors, startTime);
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────
function makeResult(source: string, signals: ScraperSignal[], errors: string[], startTime: number): ScraperResult {
  return {
    signals,
    run: {
      source,
      timestamp: new Date().toISOString(),
      signals_found: signals.length,
      status: errors.length === 0 ? "success" : signals.length > 0 ? "partial" : "error",
      error: errors.length > 0 ? errors.join("; ") : undefined,
      duration_ms: Date.now() - startTime,
    },
  };
}
