# Hawaii Referral Toolkit

Pacific Island Partners — UHNW luxury real estate referral intelligence platform for Molokai, Maui & Hawaii.

## Features

- **Pipeline** — Lead CRM with deal stages, editable rows, and commission tracking
- **Signal Intelligence** — UHNW buying signal monitor (liquidity events, agent activity, market closings, privacy seekers)
- **Intelligence Center** — Automated scraping, AI research agent, weekly briefings
- **Outreach** — Hyper-personalized email generator with Resend API integration and history
- **Leads** — Brokerage contact database with CSV export
- **Settings** — Full configuration for email, API keys, scraper config, and profile

## API Keys Required

### Free (no key needed)
| Source | Data | Notes |
|--------|------|-------|
| SEC EDGAR | IPO filings (S-1), insider sales (Form 4), 13F disclosures | Fully free, runs automatically |
| Hawaii County Records | Honolulu property transfers | Open data portal |

### Paid / Free Tier
| Key | Purpose | Where to get | Cost |
|-----|---------|--------------|------|
| `RESEND_API_KEY` / Settings → Email | Send outreach emails | [resend.com](https://resend.com) | Free tier: 3k/mo |
| `NEWS_API_KEY` / Settings → Scrapers | Daily news monitoring (IPO, luxury RE, relocation signals) | [newsapi.org](https://newsapi.org/register) | Free: 100 req/day |
| `ZILLOW_RAPIDAPI_KEY` / Settings → Scrapers | $10M+ MLS closing data | [RapidAPI Zillow56](https://rapidapi.com/apimaker/api/zillow56) | Paid |
| `PROXYCURL_API_KEY` / Settings → Scrapers | LinkedIn agent monitoring | [nubela.co/proxycurl](https://nubela.co/proxycurl) | $0.01/profile |
| `ANTHROPIC_API_KEY` / Settings → API Keys | AI Research Agent, weekly reports | [console.anthropic.com](https://console.anthropic.com) | Pay per token |

### Environment Variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=       # Optional — localStorage fallback if not set
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Optional
CRON_SECRET=                    # Secret to authenticate Vercel cron requests
NEWS_API_KEY=                   # NewsAPI key for automated daily news scrub
ANTHROPIC_API_KEY=              # Used by cron for auto-scoring hot signals
```

> **Note:** Keys set in Settings UI are stored in browser localStorage only. For production with multiple team members, set them as Vercel environment variables.

## Automated Scraping (Vercel Cron)

Configured in `vercel.json`:
- **Weekdays 6am UTC** — News intelligence scrub (NewsAPI)
- **Sundays 6am UTC** — Full free scrub (SEC EDGAR + Honolulu county records)
- **Manual** — Trigger from Intelligence Center UI (all sources, including paid)

## Database (Supabase)

Run `supabase/schema.sql` then `supabase/schema_v2.sql` to set up all tables:
- `leads` — agent CRM
- `signals` — intelligence signals (with `source_type`, `source_url`, `raw_data`, `ai_score`)
- `pipeline` — deal pipeline
- `outreach` — email history
- `scraper_runs` — logs of each automated scrub
- `research_reports` — AI research agent outputs

## Stack

- **Next.js 16.2.2** — App Router, Turbopack
- **Tailwind CSS 4** — Utility-first styling
- **Supabase** — Auth + database (optional; localStorage fallback included)
- **Resend** — Transactional email via `/api/send-email`
- **Recharts** — Pipeline and intelligence charts
- **Claude API (claude-opus-4-6)** — AI research agent and weekly intelligence reports

## Intelligence Architecture

```
Vercel Cron
    └─ GET /api/cron/scrub  (verified via CRON_SECRET)
           ├─ /api/scrapers/sec-edgar       (free — EDGAR full-text search)
           ├─ /api/scrapers/news            (NewsAPI key)
           ├─ /api/scrapers/zillow          (RapidAPI key)
           ├─ /api/scrapers/linkedin        (Proxycurl key)
           └─ /api/scrapers/county-records  (free — Honolulu open data)
                    └─ Deduplicates + writes to Supabase signals table

Manual Trigger (UI)
    └─ POST /api/cron/scrub (with keys from localStorage settings)
           └─ Results merged into localStorage via useSignals().mergeScraperSignals()

Deep Research (Signals page)
    └─ POST /api/research-agent → Claude claude-opus-4-6 → structured lead profile

Weekly Report (Intelligence Center)
    └─ POST /api/research-agent?mode=weekly_report → Claude → narrative briefing
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use "Continue in demo mode" to skip auth.
