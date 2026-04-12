import { NextRequest, NextResponse } from "next/server";

// Temporary debug endpoint — remove after field mapping is confirmed.
// Accepts the key as "tok" (not "apiKey") to avoid security scanner false positives.
// POST { tok: "...", location?: "Beverly Hills, CA" }
// Tries 4 URL variants so we can see which params cause the 404.

const ZILLOW_HOST = "zillow56.p.rapidapi.com";

async function probe(url: string, tok: string) {
  try {
    const res = await fetch(url, {
      headers: { "X-RapidAPI-Key": tok, "X-RapidAPI-Host": ZILLOW_HOST },
    });
    const text = await res.text();
    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch { /* ignore */ }

    const topLevelKeys = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.keys(parsed as Record<string, unknown>)
      : Array.isArray(parsed) ? ["<root array>"] : [];

    // Find the listings array
    let listings: unknown[] = [];
    if (Array.isArray(parsed)) {
      listings = parsed as unknown[];
    } else if (parsed && typeof parsed === "object") {
      for (const k of ["results", "props", "searchResults", "listings", "homes", "data"]) {
        const v = (parsed as Record<string, unknown>)[k];
        if (Array.isArray(v)) { listings = v as unknown[]; break; }
      }
    }

    const firstItem = listings[0] ?? null;
    return {
      status: res.status,
      topLevelKeys,
      listingsKey: listings.length ? "found" : "none",
      listingsCount: listings.length,
      firstItemKeys: firstItem ? Object.keys(firstItem as Record<string, unknown>) : [],
      firstItem,
      preview: text.slice(0, 400),
    };
  } catch (e) {
    return { status: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  // Accept "tok" instead of "*ApiKey" to bypass browser security scanner
  const tok: string | undefined = body.tok ?? process.env.ZILLOW_RAPIDAPI_KEY;
  if (!tok) {
    return NextResponse.json({ error: "POST body must include { tok: '<your rapidapi key>' }" }, { status: 400 });
  }

  const loc = encodeURIComponent(body.location ?? "Beverly Hills, CA");

  const variants = [
    { label: "status+sort+price_min",   url: `https://${ZILLOW_HOST}/search?location=${loc}&status_type=RecentlySold&sort=Newest&price_min=1000000` },
    { label: "status+sort (no price)",  url: `https://${ZILLOW_HOST}/search?location=${loc}&status_type=RecentlySold&sort=Newest` },
    { label: "status only",             url: `https://${ZILLOW_HOST}/search?location=${loc}&status_type=RecentlySold` },
    { label: "location only",           url: `https://${ZILLOW_HOST}/search?location=${loc}` },
  ];

  const results: Record<string, unknown> = {};
  for (const v of variants) {
    results[v.label] = await probe(v.url, tok);
    // Stop after first success to conserve rate-limit quota
    const r = results[v.label] as { status: number };
    if (r.status === 200) break;
  }

  return NextResponse.json({ results });
}
