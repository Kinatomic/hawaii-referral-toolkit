import { NextRequest, NextResponse } from "next/server";
import { ResearchReport } from "@/lib/scrapers";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";

interface ResearchRequest {
  anthropicKey?: string;
  signal?: {
    id?: number;
    signal?: string;
    person?: string;
    date?: string;
    location?: string;
    liquidity?: string;
    agent?: string;
    brokerage?: string;
    property?: string;
    price?: string;
    market?: string;
    detail?: string;
    type?: string;
    source_type?: string;
    tab?: string;
  };
  // For intelligence report generation
  mode?: "signal" | "weekly_report";
  weeklyData?: {
    totalSignals: number;
    hotSignals: number;
    signalsBySource: Record<string, number>;
    topSignals: Array<{ signal?: string; priority: string; date: string; source_type?: string }>;
    dateRange: string;
  };
}

function buildSignalPrompt(signal: NonNullable<ResearchRequest["signal"]>): string {
  const lines = [
    `Signal Date: ${signal.date ?? "Unknown"}`,
    `Signal Type: ${signal.tab ?? "Unknown"}`,
    `Signal: ${signal.signal ?? "(no description)"}`,
    signal.person ? `Person/Entity: ${signal.person}` : null,
    signal.location ? `Location: ${signal.location}` : null,
    signal.liquidity ? `Liquidity Amount: ${signal.liquidity}` : null,
    signal.agent ? `Agent: ${signal.agent}` : null,
    signal.brokerage ? `Brokerage: ${signal.brokerage}` : null,
    signal.property ? `Property: ${signal.property}` : null,
    signal.price ? `Price: ${signal.price}` : null,
    signal.market ? `Market: ${signal.market}` : null,
    signal.detail ? `Detail: ${signal.detail}` : null,
    signal.source_type ? `Data Source: ${signal.source_type.toUpperCase()}` : null,
  ].filter(Boolean).join("\n");

  return `You are a luxury real estate intelligence analyst for Pacific Island Partners, a top boutique brokerage specializing in ultra-high-end Hawaii properties (Molokai, Maui, Oahu — typically $5M–$50M+).

Your task: analyze the following buying signal and produce a structured research brief to help the brokerage decide whether and how to pursue this lead.

SIGNAL DETAILS:
${lines}

Produce a JSON response with this exact structure:
{
  "net_worth_estimate": "string — estimated range based on signal, or 'Insufficient data'",
  "liquidity_events": ["array of known or inferred recent liquidity events"],
  "hawaii_connections": ["array of indicators suggesting Hawaii interest or fit"],
  "recommended_approach": "string — specific, tactical outreach recommendation (2-3 sentences)",
  "key_talking_points": ["array of 3-5 specific talking points for this contact"],
  "lead_score": number between 1-100,
  "lead_score_rationale": "string — 1-2 sentences explaining the score",
  "raw_narrative": "string — 2-3 paragraph intelligence brief suitable for the brokerage team"
}

Be specific, tactical, and grounded in what you know. If you lack data, say so clearly rather than fabricating. Focus on actionable insights for luxury Hawaii real estate outreach.`;
}

function buildWeeklyReportPrompt(data: NonNullable<ResearchRequest["weeklyData"]>): string {
  const sourceSummary = Object.entries(data.signalsBySource)
    .map(([src, count]) => `  - ${src.toUpperCase()}: ${count} signals`)
    .join("\n");

  const topSignalLines = data.topSignals
    .map((s, i) => `  ${i + 1}. [${s.priority.toUpperCase()}] ${s.signal ?? "(no description)"} (${s.date})`)
    .join("\n");

  return `You are the intelligence analyst for Pacific Island Partners, a luxury Hawaii real estate brokerage specializing in Molokai, Maui, and Oahu properties ($5M–$50M+).

Generate a professional weekly intelligence briefing based on the following signal data.

PERIOD: ${data.dateRange}
TOTAL SIGNALS DETECTED: ${data.totalSignals}
HOT SIGNALS (90+ score): ${data.hotSignals}

SIGNALS BY SOURCE:
${sourceSummary}

TOP SIGNALS THIS WEEK:
${topSignalLines}

Write a professional intelligence briefing (4-6 paragraphs) that:
1. Opens with a sharp executive summary of the week's most important signals
2. Identifies the highest-priority opportunities and why they matter
3. Notes any patterns or trends in the data
4. Recommends 3-5 specific actions for the team this week
5. Closes with a market temperature assessment (cold/warming/hot)

Write in a confident, analytical tone — like a Bloomberg Intelligence brief, not a newsletter. Be specific about which signals are most actionable and why. Do not pad with filler.`;
}

export async function POST(request: NextRequest) {
  const body: ResearchRequest = await request.json().catch(() => ({}));
  const apiKey = body.anthropicKey ?? process.env.ANTHROPIC_API_KEY;
  const mode = body.mode ?? "signal";

  if (!apiKey) {
    return NextResponse.json(
      { error: "No Anthropic API key configured. Add it in Settings → API Keys." },
      { status: 400 }
    );
  }

  const prompt = mode === "weekly_report" && body.weeklyData
    ? buildWeeklyReportPrompt(body.weeklyData)
    : body.signal
    ? buildSignalPrompt(body.signal)
    : null;

  if (!prompt) {
    return NextResponse.json({ error: "Missing signal or weeklyData for the requested mode." }, { status: 400 });
  }

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "Anthropic API error" },
      { status: res.status }
    );
  }

  const text: string = data.content?.[0]?.text ?? "";

  if (mode === "weekly_report") {
    return NextResponse.json({ narrative: text, generated_at: new Date().toISOString() });
  }

  // Parse JSON response for signal research
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);
    const report: ResearchReport = {
      signal_id: body.signal?.id,
      subject: body.signal?.person ?? body.signal?.signal ?? "Unknown subject",
      net_worth_estimate: parsed.net_worth_estimate,
      liquidity_events: parsed.liquidity_events ?? [],
      hawaii_connections: parsed.hawaii_connections ?? [],
      recommended_approach: parsed.recommended_approach ?? "",
      key_talking_points: parsed.key_talking_points ?? [],
      lead_score: parsed.lead_score ?? 50,
      lead_score_rationale: parsed.lead_score_rationale ?? "",
      raw_narrative: parsed.raw_narrative ?? text,
      generated_at: new Date().toISOString(),
    };
    return NextResponse.json(report);
  } catch {
    // Return raw text if JSON parsing fails
    return NextResponse.json({
      signal_id: body.signal?.id,
      subject: body.signal?.person ?? "Unknown",
      raw_narrative: text,
      lead_score_rationale: "",
      generated_at: new Date().toISOString(),
      lead_score: 50,
      liquidity_events: [],
      hawaii_connections: [],
      key_talking_points: [],
      recommended_approach: "",
    } as ResearchReport);
  }
}

export async function GET() {
  return NextResponse.json({
    name: "AI Research Agent",
    description: "Uses Claude to generate deep research profiles for signals and weekly intelligence reports",
    model: MODEL,
    modes: ["signal", "weekly_report"],
    auth_required: true,
    key_name: "anthropicKey",
    key_env: "ANTHROPIC_API_KEY",
  });
}
