-- Hawaii Referral Toolkit — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.

-- ── Leads / Agent CRM ─────────────────────────────────────────────────────────
create table if not exists leads (
  id          bigint generated always as identity primary key,
  name        text not null,
  brokerage   text,
  market      text,
  phone       text,
  email       text,
  source      text,
  listings    integer default 0,
  avg_price   text,
  signal_match text check (signal_match in ('hot', 'warm', 'cool')),
  notes       text,
  last_activity date,
  created_at  timestamptz default now()
);

-- ── Signals ───────────────────────────────────────────────────────────────────
create table if not exists signals (
  id          bigint generated always as identity primary key,
  type        text not null check (type in ('liquidity', 'agent_activity', 'market_movement', 'privacy_seeker')),
  date        date,
  title       text not null,
  detail      text,
  person      text,
  location    text,
  priority    text check (priority in ('hot', 'warm', 'cool')),
  score       integer,
  agent       text,
  action      text,
  contacted   boolean default false,
  created_at  timestamptz default now()
);

-- ── Pipeline Deals ────────────────────────────────────────────────────────────
create table if not exists pipeline (
  id          bigint generated always as identity primary key,
  lead_name   text not null,
  brokerage   text,
  market      text,
  property    text,
  value_usd   bigint,
  stage       text check (stage in ('Initial Inquiry','Showing Scheduled','Property Tour','Negotiation','Under Contract','Closed')),
  days_in_stage integer default 0,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Outreach History ─────────────────────────────────────────────────────────
create table if not exists outreach (
  id          bigint generated always as identity primary key,
  lead_id     bigint references leads(id) on delete set null,
  recipient   text not null,
  subject     text,
  body        text,
  trigger_type text,
  tone        text,
  status      text check (status in ('Draft','Queued','Sent','Replied')) default 'Draft',
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

-- ── Activity Feed ─────────────────────────────────────────────────────────────
create table if not exists activity (
  id          bigint generated always as identity primary key,
  date        date not null,
  text        text not null,
  type        text,
  created_at  timestamptz default now()
);

-- ── RLS Policies (enable after configuring auth) ──────────────────────────────
-- alter table leads enable row level security;
-- alter table signals enable row level security;
-- alter table pipeline enable row level security;
-- alter table outreach enable row level security;
-- alter table activity enable row level security;
