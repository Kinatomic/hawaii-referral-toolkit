import { NextRequest, NextResponse } from "next/server";

// Temporary debug endpoint — remove after field mapping is confirmed.
// POST { rapidApiKey: "...", location?: "Beverly Hills, CA", minPrice?: 10000000 }
// Returns the raw Zillow56 API response so we can see the actual field names.

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiKey: string | undefined = body.rapidApiKey ?? process.env.ZILLOW_RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No rapidApiKey provided" }, { status: 400 });
  }

  const location = body.location ?? "Beverly Hills, CA";
  const minPrice = body.minPrice ?? 10_000_000;
  const ZILLOW_HOST = "zillow56.p.rapidapi.com";

  const url = `https://${ZILLOW_HOST}/search?location=${encodeURIComponent(location)}&status_type=RecentlySold&sort=Newest&price_min=${minPrice}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": ZILLOW_HOST,
      },
    });

    const statusCode = res.status;
    const rawText = await res.text();

    let parsed: unknown = null;
    try { parsed = JSON.parse(rawText); } catch { /* keep null */ }

    // Extract the top-level keys and the first property object so we can
    // see the exact field names without flooding the response.
    let topLevelKeys: string[] = [];
    let firstProperty: unknown = null;
    let firstPropertyKeys: string[] = [];
    let totalCount: number | null = null;

    if (parsed && typeof parsed === "object") {
      topLevelKeys = Object.keys(parsed as Record<string, unknown>);
      // Try to find the array of listings under any common key name
      const candidates = ["props", "results", "searchResults", "listings", "data", "homes"];
      for (const key of candidates) {
        const val = (parsed as Record<string, unknown>)[key];
        if (Array.isArray(val) && val.length > 0) {
          firstProperty = val[0];
          firstPropertyKeys = Object.keys(val[0] as Record<string, unknown>);
          totalCount = val.length;
          break;
        }
      }
      // Also check if the root is an array
      if (!firstProperty && Array.isArray(parsed) && (parsed as unknown[]).length > 0) {
        firstProperty = (parsed as unknown[])[0];
        firstPropertyKeys = Object.keys(firstProperty as Record<string, unknown>);
        totalCount = (parsed as unknown[]).length;
      }
    }

    return NextResponse.json({
      requestUrl: url,
      httpStatus: statusCode,
      topLevelKeys,
      totalListingsFound: totalCount,
      firstPropertyKeys,
      firstProperty,       // Full first property object — the field map we need
      rawResponsePreview: rawText.slice(0, 2000),
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : String(e),
      requestUrl: url,
    }, { status: 500 });
  }
}
