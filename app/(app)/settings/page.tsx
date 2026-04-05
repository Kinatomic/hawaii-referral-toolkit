"use client";

import { useState, useEffect } from "react";
import {
  Mail, Key, Bell, User, Database, Save, Eye, EyeOff,
  Check, Upload, Trash2, Download, ChevronRight, Settings,
} from "lucide-react";
import { leadsData } from "@/lib/data";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";

const SETTINGS_KEY = "pip_settings";

interface AppSettings {
  // Email
  emailProvider: string;
  resendApiKey: string;
  fromName: string;
  fromEmail: string;
  emailSignature: string;
  sendMode: "direct" | "client";
  bccSelf: boolean;
  // API
  anthropicKey: string;
  zillowKey: string;
  mlsKey: string;
  // Notifications
  hotSignalAlert: "email" | "inapp" | "off";
  weeklyDigest: boolean;
  newLeadNotif: boolean;
  // Profile
  agentName: string;
  brokerage: string;
  licenseNumber: string;
  specialties: string[];
  referralFeePercent: string;
}

const DEFAULTS: AppSettings = {
  emailProvider: "resend",
  resendApiKey: "",
  fromName: "Mark Janes",
  fromEmail: "mark@islandsothebys.com",
  emailSignature: "Mark Janes & Heidi Dollinger\nIsland Sotheby's International Realty\nMolokai & Maui, Hawaii",
  sendMode: "client",
  bccSelf: true,
  anthropicKey: "",
  zillowKey: "",
  mlsKey: "",
  hotSignalAlert: "inapp",
  weeklyDigest: true,
  newLeadNotif: true,
  agentName: "Mark Janes",
  brokerage: "Island Sotheby's International Realty",
  licenseNumber: "",
  specialties: ["Molokai Estates", "Maui Oceanfront"],
  referralFeePercent: "25",
};

const SPECIALTIES = [
  "Molokai Estates", "Maui Oceanfront", "West Maui Villas",
  "Luxury Condos", "Oceanfront", "Privacy Estates", "Investment Property",
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-root">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" />
      <span className="toggle-thumb" />
    </label>
  );
}

function MaskedInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••••••••••"}
        className="input-base pr-10 text-sm font-mono"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B958F] hover:text-[#5A534E] transition"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

const TABS = [
  { id: "email",  label: "Email",         icon: Mail },
  { id: "api",    label: "API Keys",       icon: Key },
  { id: "notifs", label: "Notifications",  icon: Bell },
  { id: "profile",label: "Profile",        icon: User },
  { id: "data",   label: "Data",           icon: Database },
];

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-[#1A1615]">{title}</h3>
      <p className="text-xs text-[#9B958F] mt-0.5">{desc}</p>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-[#F5F3EF] last:border-0">
      <div className="min-w-0 mr-6">
        <p className="text-sm font-medium text-[#1A1615]">{label}</p>
        {hint && <p className="text-xs text-[#9B958F] mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0 min-w-[220px]">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [activeTab, setActiveTab] = useState("email");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        try { setSettings({ ...DEFAULTS, ...JSON.parse(stored) }); } catch {}
      }
    }
  }, []);

  const set = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) =>
    setSettings(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportLeads = () => {
    const headers = ["Name","Brokerage","Market","Phone","Email","Source","Signal Match"];
    const rows = leadsData.map(l => [l.name,l.brokerage,l.market,l.phone,l.email,l.source,l.signalMatch]);
    const csv = [headers,...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSignals = () => {
    if (window.confirm("Clear all signal history? This cannot be undone.")) {
      alert("Signal queue cleared. (Connected to Supabase when configured.)");
    }
  };

  const toggleSpecialty = (s: string) => {
    set("specialties", settings.specialties.includes(s)
      ? settings.specialties.filter(x => x !== s)
      : [...settings.specialties, s]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1"><Settings size={20} style={{ color: GOLD }} /><h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Settings</h1></div>
            <p className="text-sm text-[#9B958F]">Configure your Pacific Island Partners toolkit</p>
          </div>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
            {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save changes</>}
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0.5 border-b border-[#EDE8E0]">
          {TABS.map(t => { const Icon = t.icon; const active = activeTab === t.id; return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${active ? "text-[#1E2761] border-[#C9A96E] bg-[#FAFAF8]" : "text-[#9B958F] border-transparent hover:text-[#5A534E] hover:bg-[#F5F3EF]"}`}>
              <Icon size={13} />{t.label}
            </button>
          );})}
        </div>

        {/* ── Email Config ─────────────────────────────────────────── */}
        {activeTab === "email" && (
          <div className="card p-6">
            <SectionHeader title="Email Configuration" desc="Configure how outreach emails are sent from the platform." />
            <FieldRow label="Email provider" hint="API-based sending via Resend (recommended) or SMTP">
              <select value={settings.emailProvider} onChange={e => set("emailProvider", e.target.value)} className="input-base text-sm">
                <option value="resend">Resend</option>
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </FieldRow>
            <FieldRow label="Resend API key" hint="Get your key at resend.com/api-keys">
              <MaskedInput value={settings.resendApiKey} onChange={v => set("resendApiKey", v)} placeholder="re_••••••••••••••••" />
            </FieldRow>
            <FieldRow label="From name" hint="Display name for outbound emails">
              <input value={settings.fromName} onChange={e => set("fromName", e.target.value)} className="input-base text-sm" />
            </FieldRow>
            <FieldRow label="From email">
              <input type="email" value={settings.fromEmail} onChange={e => set("fromEmail", e.target.value)} className="input-base text-sm" />
            </FieldRow>
            <FieldRow label="Email signature" hint="Appended to all outreach emails">
              <textarea
                value={settings.emailSignature}
                onChange={e => set("emailSignature", e.target.value)}
                rows={4}
                className="input-base text-sm resize-none"
              />
            </FieldRow>
            <FieldRow label="Send mode" hint="Direct sends immediately; client opens your email app">
              <div className="flex gap-2">
                {["direct","client"].map(m => (
                  <button key={m} onClick={() => set("sendMode", m as "direct" | "client")} className={`flex-1 py-2 text-xs rounded-lg border font-medium capitalize transition-all ${settings.sendMode===m?"bg-[#1E2761] text-white border-[#1E2761]":"bg-white border-[#E0D8CC] text-[#5A534E] hover:border-[#C9A96E]"}`}>
                    {m === "direct" ? "Send directly" : "Open in client"}
                  </button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="BCC self" hint="Receive a copy of every outreach email">
              <Toggle checked={settings.bccSelf} onChange={v => set("bccSelf", v)} />
            </FieldRow>
          </div>
        )}

        {/* ── API Keys ─────────────────────────────────────────────── */}
        {activeTab === "api" && (
          <div className="card p-6">
            <SectionHeader title="API Keys" desc="Connect external services to power AI personalization and data enrichment." />
            <FieldRow label="Anthropic API key" hint="Powers AI-assisted outreach personalization">
              <MaskedInput value={settings.anthropicKey} onChange={v => set("anthropicKey", v)} placeholder="sk-ant-••••••••••••" />
            </FieldRow>
            <FieldRow label="Zillow API key" hint="Enriches lead data with current listing activity">
              <MaskedInput value={settings.zillowKey} onChange={v => set("zillowKey", v)} />
            </FieldRow>
            <FieldRow label="MLS / Paragon key" hint="Direct access to Hawaii MLS listing data">
              <MaskedInput value={settings.mlsKey} onChange={v => set("mlsKey", v)} />
            </FieldRow>
            <div className="mt-5 p-4 bg-[#FAFAF8] border border-[#EDE8E0] rounded-xl">
              <p className="text-xs font-semibold text-[#5A534E] mb-1">Key security</p>
              <p className="text-xs text-[#9B958F]">
                All API keys are stored locally in your browser and never transmitted to any server. When Supabase is configured, keys can be stored encrypted in your account.
              </p>
            </div>
          </div>
        )}

        {/* ── Notifications ─────────────────────────────────────────── */}
        {activeTab === "notifs" && (
          <div className="card p-6">
            <SectionHeader title="Notification Preferences" desc="Control when and how you're alerted about new signals and activity." />
            <FieldRow label="Hot signal alerts" hint="Triggered when a signal scores 90+">
              <div className="flex gap-2">
                {(["email","inapp","off"] as const).map(m => (
                  <button key={m} onClick={() => set("hotSignalAlert", m)} className={`flex-1 py-2 text-xs rounded-lg border font-medium capitalize transition-all ${settings.hotSignalAlert===m?"bg-[#1E2761] text-white border-[#1E2761]":"bg-white border-[#E0D8CC] text-[#5A534E] hover:border-[#C9A96E]"}`}>
                    {m === "inapp" ? "In-app" : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Weekly digest" hint="Monday morning summary of signals and pipeline">
              <Toggle checked={settings.weeklyDigest} onChange={v => set("weeklyDigest", v)} />
            </FieldRow>
            <FieldRow label="New lead notifications" hint="Alert when a new lead is added to the CRM">
              <Toggle checked={settings.newLeadNotif} onChange={v => set("newLeadNotif", v)} />
            </FieldRow>
          </div>
        )}

        {/* ── Profile ──────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="card p-6">
            <SectionHeader title="Agent Profile" desc="Your details appear in outreach emails and partnership materials." />
            <FieldRow label="Agent name">
              <input value={settings.agentName} onChange={e => set("agentName", e.target.value)} className="input-base text-sm" />
            </FieldRow>
            <FieldRow label="Brokerage">
              <input value={settings.brokerage} onChange={e => set("brokerage", e.target.value)} className="input-base text-sm" />
            </FieldRow>
            <FieldRow label="License number">
              <input value={settings.licenseNumber} onChange={e => set("licenseNumber", e.target.value)} placeholder="HI-RB-XXXXXX" className="input-base text-sm" />
            </FieldRow>
            <FieldRow label="Referral fee %" hint="Default percentage for inbound referral agreements">
              <div className="relative">
                <input
                  type="number" min="0" max="50" step="0.5"
                  value={settings.referralFeePercent}
                  onChange={e => set("referralFeePercent", e.target.value)}
                  className="input-base text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B958F] text-sm">%</span>
              </div>
            </FieldRow>
            <FieldRow label="Market specialties" hint="Select all that apply">
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => {
                  const selected = settings.specialties.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selected ? "bg-[#1E2761] text-white border-[#1E2761]" : "bg-white border-[#E0D8CC] text-[#5A534E] hover:border-[#C9A96E]"}`}
                    >
                      {selected && <Check size={9} className="inline mr-1" />}{s}
                    </button>
                  );
                })}
              </div>
            </FieldRow>
            <FieldRow label="Profile photo" hint="Used in email signature and shared materials">
              <button className="btn-outline flex items-center gap-2 text-sm px-4 py-2 w-full justify-center">
                <Upload size={13} /> Upload photo
              </button>
            </FieldRow>
          </div>
        )}

        {/* ── Data Management ──────────────────────────────────────── */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="card p-6">
              <SectionHeader title="Export Data" desc="Download your data for backup or external use." />
              <div className="space-y-3">
                {[
                  { label: "Export all leads", sub: `${leadsData.length} agents as CSV`, action: handleExportLeads, icon: Download },
                  { label: "Export outreach history", sub: "All generated and sent emails", action: () => alert("Outreach export ready when Supabase is configured."), icon: Mail },
                  { label: "Export pipeline data", sub: "Full referral pipeline as CSV", action: () => alert("Pipeline export ready when Supabase is configured."), icon: Download },
                ].map(({ label, sub, action, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full card card-hover p-4 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F3EF] flex items-center justify-center">
                        <Icon size={14} style={{ color: GOLD }} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#1A1615]">{label}</p>
                        <p className="text-xs text-[#9B958F]">{sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#C2B9B0] group-hover:text-[#5A534E] transition" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <SectionHeader title="Data Management" desc="Clear or reset app data." />
              <div className="space-y-3">
                <button
                  onClick={handleClearSignals}
                  className="w-full card card-hover p-4 flex items-center justify-between group border-red-100 hover:border-red-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <Trash2 size={14} className="text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-700">Clear signal queue</p>
                      <p className="text-xs text-red-400">Remove all cached signal history</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-red-300 group-hover:text-red-500 transition" />
                </button>
                <button
                  onClick={() => { if (window.confirm("Reset all settings to defaults?")) { setSettings(DEFAULTS); localStorage.removeItem(SETTINGS_KEY); } }}
                  className="w-full card card-hover p-4 flex items-center justify-between group border-red-100 hover:border-red-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <Trash2 size={14} className="text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-700">Reset all settings</p>
                      <p className="text-xs text-red-400">Restore all settings to defaults</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-red-300 group-hover:text-red-500 transition" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save button (bottom) */}
        <div className="flex justify-end pb-8">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5">
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
