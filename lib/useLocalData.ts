"use client";

import { useState, useEffect } from "react";
import { pipelineData as SAMPLE_PIPELINE, leadsData as SAMPLE_LEADS, liquidityEvents as SAMPLE_LIQ, agentActivity as SAMPLE_AGENTS, marketMovements as SAMPLE_MKT, privacySeekers as SAMPLE_PRIV, outreachQueue as SAMPLE_QUEUE } from "./data";
import type { SourceType } from "./scrapers";

export type PipelineRow = typeof SAMPLE_PIPELINE[0];
export type Lead = typeof SAMPLE_LEADS[0];

export function usePipeline() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [isDemoData, setIsDemoData] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("pip_pipeline");
    if (stored) {
      const parsed = JSON.parse(stored);
      setRows(parsed.rows);
      setIsDemoData(parsed.isDemo ?? false);
    } else {
      setRows(SAMPLE_PIPELINE as PipelineRow[]);
      setIsDemoData(true);
    }
  }, []);

  const save = (newRows: PipelineRow[], isDemo = false) => {
    setRows(newRows);
    setIsDemoData(isDemo);
    localStorage.setItem("pip_pipeline", JSON.stringify({ rows: newRows, isDemo }));
  };

  const addRow = (row: Omit<PipelineRow, "id">) => {
    const next = [...rows, { ...row, id: Date.now() } as PipelineRow];
    save(next, false);
  };

  const updateRow = (id: number, updates: Partial<PipelineRow>) => {
    save(rows.map(r => r.id === id ? { ...r, ...updates } : r), false);
  };

  const deleteRow = (id: number) => {
    save(rows.filter(r => r.id !== id), isDemoData && rows.length > 1);
  };

  const clearDemo = () => save([], false);

  return { rows, isDemoData, addRow, updateRow, deleteRow, clearDemo };
}

// ── Signals ───────────────────────────────────────────────────────────────────
export interface Signal {
  id: number;
  date: string;
  signal?: string;
  person?: string;
  location?: string;
  agent?: string;
  liquidity?: string;
  brokerage?: string;
  relevance?: string;
  score?: number;
  fitScore?: number;
  ai_score?: number;
  property?: string;
  price?: string;
  market?: string;
  inNetwork?: boolean;
  source?: string;
  source_type?: SourceType;
  source_url?: string;
  detail?: string;
  type?: string;
  priority: string;
  action?: string;
  isDemo: boolean;
  tab: "liquidity" | "agents" | "market" | "privacy";
}

const DEMO_SIGNALS: Signal[] = [
  ...SAMPLE_LIQ.map(s => ({ ...s, tab: "liquidity" as const, isDemo: true })),
  ...SAMPLE_AGENTS.map(s => ({ ...s, tab: "agents" as const, isDemo: true })),
  ...SAMPLE_MKT.map(s => ({ ...s, tab: "market" as const, isDemo: true })),
  ...SAMPLE_PRIV.map(s => ({ ...s, tab: "privacy" as const, isDemo: true })),
];

export function useSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("pip_signals");
    if (stored) setSignals(JSON.parse(stored));
    else { setSignals(DEMO_SIGNALS); localStorage.setItem("pip_signals", JSON.stringify(DEMO_SIGNALS)); }
  }, []);

  const save = (s: Signal[]) => { setSignals(s); localStorage.setItem("pip_signals", JSON.stringify(s)); };

  const addSignal = (sig: Omit<Signal, "id" | "isDemo">) => save([{ ...sig, id: Date.now(), isDemo: false }, ...signals]);
  const clearDemo = () => save(signals.filter(s => !s.isDemo));
  const clearAll = () => save([]);

  const mergeScraperSignals = (incoming: Omit<Signal, "id" | "isDemo">[]) => {
    const existingKeys = new Set(signals.map(s => `${s.date}|${(s.signal ?? "").slice(0, 40)}|${s.source_type ?? ""}`));
    const deduped = incoming.filter(s => !existingKeys.has(`${s.date}|${(s.signal ?? "").slice(0, 40)}|${s.source_type ?? ""}`));
    if (deduped.length === 0) return 0;
    save([...deduped.map(s => ({ ...s, id: Date.now() + Math.random(), isDemo: false })), ...signals]);
    return deduped.length;
  };

  return { signals, addSignal, clearDemo, clearAll, mergeScraperSignals };
}

// ── Outreach History ──────────────────────────────────────────────────────────
export interface OutreachRecord {
  id: number;
  recipient: string;
  recipientEmail: string;
  subject: string;
  body: string;
  trigger: string;
  sentAt: string;
  status: "draft" | "sent" | "replied";
  resendId?: string;
}

export function useOutreachHistory() {
  const [history, setHistory] = useState<OutreachRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("pip_outreach_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const addRecord = (r: Omit<OutreachRecord, "id">) => {
    const next = [{ ...r, id: Date.now() }, ...history];
    setHistory(next);
    localStorage.setItem("pip_outreach_history", JSON.stringify(next));
  };

  const updateStatus = (id: number, status: OutreachRecord["status"]) => {
    const next = history.map(r => r.id === id ? { ...r, status } : r);
    setHistory(next);
    localStorage.setItem("pip_outreach_history", JSON.stringify(next));
  };

  const clearHistory = () => { setHistory([]); localStorage.removeItem("pip_outreach_history"); };

  return { history, addRecord, updateStatus, clearHistory };
}
