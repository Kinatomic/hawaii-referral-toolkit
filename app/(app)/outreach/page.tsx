"use client";

import { useState, useCallback } from "react";
import { Mail, Send, Copy, RefreshCw, Save, Zap, Clock, TrendingUp, ChevronDown, Check, AlertCircle, Trash2, History, MessageSquare } from "lucide-react";
import { BROKERAGE_CONTACTS, TRIGGER_TYPES, TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/data";
import { useOutreachHistory } from "@/lib/useLocalData";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";

interface Contact { id: number; name: string; brokerage: string; market: string; }
interface Params { personName: string; company: string; amount: string; activity: string; property: string; price: string; event: string; discussion: string; referrerName: string; }
interface Stats { generated: number; sent: number; responses: number; }

function generateEmail(contact: Contact, trigger: string, params: Params) {
  const templates: Record<string, { subject: (c: Contact, p: Params) => string; body: (c: Contact, p: Params) => string }> = {
    cold: {
      subject: (c) => c.market === "LA" ? "Your LA Clients' Next Trophy Property" : `Hawaii's Most Exclusive Market — For Your ${c.market} Clientele`,
      body: (c) => {
        const openings: Record<string, string> = {
          LA: `Josh — Your $9B+ track record speaks for itself. The buyers at that level increasingly tell us the same thing: "I have LA, I have Aspen... what's next?" That answer is increasingly Hawaii.`,
          NYC: `Ryan — Your reputation in NYC's most competitive trophy market is legendary. We work with a similar tier of buyer discovering something most Manhattan agents don't: the most exclusive address in America isn't in NYC anymore.`,
          Aspen: `Steven — You've dominated Aspen's luxury market for years. But even your biggest clients tell us: "I need another place that feels as private and exclusive as Aspen." Enter Molokai.`,
          "Beverly Hills": `Jade — Your Beverly Hills book is extraordinary. The $15M+ clients you work with are increasingly asking about Hawaii — not as a vacation rental, but as a genuine sanctuary.`,
        };
        const opening = openings[c.market] ?? `${c.name.split(" ")[0]} — Your reputation in ${c.market} luxury is exactly why we're reaching out.`;
        return `${opening}\n\nWe're Mark Janes and Heidi Dollinger at Island Sotheby's International Realty, and we specialize in a segment of Hawaii most mainland agents don't even know exists: Molokai — 6,000-acre beachfront estates with zero paparazzi, zero resorts, zero traffic lights. Think "private island" without leaving Hawaii.\n\nYour buyers at the $15M+ level have a specific need we solve better than anyone: a place where they can be truly unreachable. No Instagram problem. No surprise neighbors. Just uncompromised privacy and some of the most dramatic coastline on Earth.\n\nWe send you referrals with context (not a blind lead), we handle the full transaction, and we know how to work with mainland brokerages — we've built our entire practice on it.\n\nWould you be open to a brief call this week to discuss the market and see if there's a fit for your book?\n\nBest,\nMark Janes & Heidi Dollinger\nIsland Sotheby's International Realty`;
      },
    },
    liquidity: {
      subject: (c, p) => `Congratulations on ${p.personName || "the recent close"} — Hawaii Opportunity`,
      body: (c, p) => `${c.name.split(" ")[0]} — Congratulations on the ${p.personName || "recent exit"} close${p.amount ? ` of $${p.amount}M` : ""}. That's an exceptional outcome.\n\nWe see a pattern in our practice: exits in that range create a specific kind of buyer — someone who's just spent 5–10 years building something extraordinary and now wants a place that feels as far from a boardroom as possible.\n\nMolokai is that place. Not Maui (too social), not Oahu (too developed). Molokai is where your post-exit clients go to remember why they built their empire in the first place.\n\nDo you have 15 minutes this week to talk about how we work with mainland brokerages?\n\nBest,\nMark & Heidi`,
    },
    activity: {
      subject: (c, p) => `Re: ${p.activity || "Expanding Referral Network"} — Hawaii's Most Exclusive Market`,
      body: (c, p) => `${c.name.split(" ")[0]} — Saw your recent post about ${p.activity || "expanding referral partnerships"} in luxury markets. Perfect timing.\n\nWe're the team that luxury agents across the mainland trust when their UHNW clients discover Hawaii. Not because we're aggressive, but because we're selective.\n\nYour ${c.market} clientele is exactly the demographic moving to Hawaii: established wealth, privacy priorities, looking for something genuinely different.\n\nInterested in a brief call to explore the opportunity?\n\nBest,\nMark & Heidi`,
    },
    sale: {
      subject: (c, p) => `Referral Opportunity — Your Recent ${p.property || "Property"} Close`,
      body: (c, p) => `${c.name.split(" ")[0]} — Saw the news on your recent close of ${p.property || "the luxury property"}${p.price ? ` at $${p.price}M` : ""}. Exceptional transaction.\n\nAgents with your trajectory often have clients who, after 1–2 major closings, start asking about Hawaii. Not as a vacation rental — as a serious second/primary residence.\n\nWe're not trying to steal your client — we're trying to extend your relationship. You stay the hero; we handle Hawaii complexity.\n\nWould you be open to a conversation?\n\nBest,\nMark & Heidi`,
    },
    conference: {
      subject: (c, p) => `Great Meeting You at ${p.event || "the Conference"} — Hawaii Opportunity`,
      body: (c, p) => `${c.name.split(" ")[0]} — Great meeting you at ${p.event || "the event"}. I enjoyed our conversation about ${p.discussion || "the luxury market"}.\n\nWe're seeing top agents in your market (${c.market}) being asked about Hawaii by their UHNW clients — and most don't have a trusted partner on the ground.\n\nWe've spent years building that ground game. Would love to explore this as an ongoing partnership. Does next Tuesday work for a brief call?\n\nBest,\nMark & Heidi\nIsland Sotheby's International Realty`,
    },
    referral: {
      subject: (c, p) => `${p.referrerName || "A Colleague"} Recommended You — Hawaii Partnership`,
      body: (c, p) => `${c.name.split(" ")[0]} — ${p.referrerName || "A mutual contact"} recently recommended we connect.\n\nYour reputation in ${c.market}, your client caliber, and your network are exactly what we look for in partnership opportunities.\n\nYour clients want a second home that's genuinely private, genuinely unique, and genuinely remote. Molokai delivers all three — and we're the team that makes that transaction effortless.\n\nWould you have time this week for a quick introductory call?\n\nBest,\nMark & Heidi`,
    },
    molokai: {
      subject: () => "Molokai's Most Exclusive Properties — For Your Privacy-Seeking Clients",
      body: (c) => `${c.name.split(" ")[0]} — You likely have clients who fit a specific profile: UHNW, privacy-obsessed, and tired of every major market feeling exposed.\n\nMolokai is the antidote.\n\nNot a resort. Not a development. Actual 6,000-acre private estates with direct coastline, zero paparazzi, zero social media presence. This is where your clients go when they need to truly disappear.\n\nIf you have clients asking "Is there anywhere genuinely private left in Hawaii?" — the answer is yes, and we're the experts.\n\nLet's talk.\n\nBest,\nMark & Heidi`,
    },
    market: {
      subject: () => "Hawaii Luxury Market Insights — Q2 2026 Update",
      body: (c) => `${c.name.split(" ")[0]} — We're sharing market intelligence with select agents we respect, and you came to mind.\n\nQ2 2026 Hawaii luxury is revealing fascinating patterns in Molokai: down from headline-grabbing development talk, but UP in quiet acquisition by serious UHNW buyers. The narrative has shifted from "trophy property" to "genuine sanctuary."\n\nThis matters for your book because when your post-liquidity clients ask about Hawaii, you can give them real, current data — not speculation.\n\nQuick call this week?\n\nBest,\nMark & Heidi`,
    },
  };
  const t = templates[trigger];
  if (!t) return { subject: "Hawaii Opportunity", body: "Error generating email." };
  return { subject: t.subject(contact, params), body: t.body(contact, params) };
}

const TRIGGER_FIELDS: Record<string, string[]> = { liquidity: ["personName","amount"], activity: ["activity"], sale: ["property","price"], conference: ["event","discussion"], referral: ["referrerName"] };
const FIELD_LABELS: Record<string, string> = { personName: "Person Name", company: "Company", amount: "Liquidity ($M)", activity: "Social Activity", property: "Property Name", price: "Sale Price ($M)", event: "Event Name", discussion: "Topic Discussed", referrerName: "Referrer Name" };
const BEST_PRACTICES = ["Send Tuesday–Thursday, 9–11am recipient timezone","Keep subject line under 50 characters","Personalize with specific market/recent activity","Never lead with referral fee — lead with value","Follow up 5–7 days after initial contact"];

function getSettings() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("pip_settings") ?? "null"); } catch { return null; }
}

export default function OutreachPage() {
  const { history, addRecord, updateStatus, clearHistory } = useOutreachHistory();
  const [pageTab, setPageTab] = useState<"compose" | "history">("compose");
  const [contact, setContact] = useState<Contact | null>(null);
  const [trigger, setTrigger] = useState("cold");
  const [tone, setTone] = useState("warm");
  const [length, setLength] = useState("standard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [params, setParams] = useState<Params>({ personName:"", company:"", amount:"", activity:"", property:"", price:"", event:"", discussion:"", referrerName:"" });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasEmail, setHasEmail] = useState(false);
  const [stats, setStats] = useState<Stats>({ generated:0, sent:0, responses:0 });
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const activeFields = TRIGGER_FIELDS[trigger] ?? [];

  const handleGenerate = useCallback(() => {
    if (!contact) return;
    const email = generateEmail(contact, trigger, params);
    setSubject(email.subject); setBody(email.body); setHasEmail(true);
    setSendError(null); setSendSuccess(false);
    setStats(s => ({ ...s, generated: s.generated + 1 }));
  }, [contact, trigger, params]);

  const handleCopy = (text: string, field: string) => { navigator.clipboard.writeText(text); setCopied(field); setTimeout(() => setCopied(null), 2000); };

  const handleSend = async () => {
    if (!contact || !hasEmail) return;
    const settings = getSettings();
    const apiKey = settings?.resendApiKey;
    if (!apiKey) {
      setSendError("No Resend API key configured. Add it in Settings → Email.");
      return;
    }
    setSending(true); setSendError(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: `${contact.name} <${contact.brokerage}>`,
          subject,
          text: body,
          fromName: settings?.fromName,
          fromEmail: settings?.fromEmail,
          bcc: settings?.bccSelf,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      addRecord({
        recipient: contact.name,
        recipientEmail: `${contact.brokerage}`,
        subject,
        body,
        trigger: TRIGGER_TYPES.find(t => t.value === trigger)?.label ?? trigger,
        sentAt: new Date().toISOString(),
        status: "sent",
        resendId: data.id,
      });
      setSendSuccess(true);
      setStats(s => ({ ...s, sent: s.sent + 1 }));
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const sentCount = history.filter(r => r.status === "sent" || r.status === "replied").length;
  const repliedCount = history.filter(r => r.status === "replied").length;

  return (
    <div className="min-h-screen p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1"><Mail size={20} style={{ color: GOLD }} /><h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Smart Outreach Generator</h1></div>
        <p className="text-sm text-[#9B958F]">Hyper-personalized outreach for Pacific Island Partners</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          {icon:TrendingUp,label:"Generated",value:stats.generated},
          {icon:Send,label:"Sent",value:sentCount},
          {icon:MessageSquare,label:"Replied",value:repliedCount},
          {icon:Clock,label:"Response Rate",value:sentCount>0?`${Math.round((repliedCount/sentCount)*100)}%`:"0%"},
          {icon:History,label:"In History",value:history.length},
        ].map(({icon:Icon,label,value}) => (
          <div key={label} className="card p-4 text-center" style={{ borderTop: `2px solid ${GOLD}` }}>
            <div className="w-8 h-8 rounded-lg bg-[#F5F3EF] flex items-center justify-center mx-auto mb-2"><Icon size={15} style={{ color: GOLD }} /></div>
            <div className="text-2xl font-semibold text-[#1A1615]">{value}</div>
            <p className="text-xs text-[#9B958F] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Page tabs */}
      <div className="flex gap-0.5 border-b border-[#EDE8E0]">
        {[
          { id: "compose" as const, label: "Compose", icon: Zap },
          { id: "history" as const, label: `Email History${history.length > 0 ? ` (${history.length})` : ""}`, icon: History },
        ].map(t => { const Icon = t.icon; const active = pageTab === t.id; return (
          <button key={t.id} onClick={() => setPageTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${active ? "text-[#1E2761] border-[#C9A96E] bg-[#FAFAF8]" : "text-[#9B958F] border-transparent hover:text-[#5A534E] hover:bg-[#F5F3EF]"}`}>
            <Icon size={13} />{t.label}
          </button>
        );})}
      </div>

      {/* Compose tab */}
      {pageTab === "compose" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-6 space-y-5">
            <h2 className="text-base font-semibold text-[#1A1615]">Compose Outreach</h2>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-2">Step 1 — Select Target</label>
              <div className="relative">
                <button onClick={() => setShowDropdown(d => !d)} className="w-full text-left px-4 py-2.5 bg-white border border-[#E0D8CC] rounded-lg flex justify-between items-center hover:border-[#C9A96E] transition text-sm">
                  <span className={contact ? "text-[#1A1615]" : "text-[#C2B9B0]"}>{contact ? `${contact.name} · ${contact.brokerage} (${contact.market})` : "Select a brokerage contact…"}</span>
                  <ChevronDown size={14} className="text-[#9B958F]" />
                </button>
                {showDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#EDE8E0] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {BROKERAGE_CONTACTS.map(c => (
                      <button key={c.id} onClick={() => { setContact(c); setShowDropdown(false); setHasEmail(false); }} className="w-full text-left px-4 py-2.5 hover:bg-[#FAFAF8] transition text-sm border-b border-[#F5F3EF] last:border-0">
                        <span className="font-medium text-[#1A1615]">{c.name}</span><span className="text-[#9B958F] ml-2 text-xs">{c.brokerage} · {c.market}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-2">Step 2 — Trigger Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map(t => (
                  <button key={t.value} onClick={() => { setTrigger(t.value); setHasEmail(false); }} className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${trigger === t.value ? "bg-[#1E2761] text-white border-[#1E2761]" : "text-[#5A534E] bg-white border-[#E0D8CC] hover:border-[#C9A96E]"}`}>{t.label}</button>
                ))}
              </div>
            </div>
            {activeFields.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#5A534E] mb-2">Signal Details</label>
                <div className="space-y-2">{activeFields.map(f => <input key={f} placeholder={FIELD_LABELS[f] ?? f} value={(params as unknown as Record<string,string>)[f] ?? ""} onChange={e => setParams(p => ({ ...p, [f]: e.target.value }))} className="input-base text-sm" />)}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-[#5A534E] mb-2">Tone</label><div className="flex gap-1">{TONE_OPTIONS.map(o => <button key={o.value} onClick={() => setTone(o.value)} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${tone === o.value ? "bg-[#1E2761] text-white border-[#1E2761]" : "text-[#5A534E] bg-white border-[#E0D8CC] hover:border-[#C9A96E]"}`}>{o.label}</button>)}</div></div>
              <div><label className="block text-xs font-semibold text-[#5A534E] mb-2">Length</label><div className="flex gap-1">{LENGTH_OPTIONS.map(o => <button key={o.value} onClick={() => setLength(o.value)} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${length === o.value ? "bg-[#1E2761] text-white border-[#1E2761]" : "text-[#5A534E] bg-white border-[#E0D8CC] hover:border-[#C9A96E]"}`}>{o.label}</button>)}</div></div>
            </div>
            <button onClick={handleGenerate} disabled={!contact} className="btn-gold w-full flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"><Zap size={15} /> Generate Email</button>
            <div className="border border-[#EDE8E0] rounded-xl p-4 bg-[#FAFAF8]">
              <p className="text-xs font-semibold text-[#5A534E] mb-2 flex items-center gap-1.5"><AlertCircle size={12} style={{ color: GOLD }} /> Best Practices</p>
              <ul className="space-y-1">{BEST_PRACTICES.map((tip,i) => <li key={i} className="text-xs text-[#9B958F] flex items-start gap-1.5"><span className="mt-1 w-1 h-1 rounded-full bg-[#E0D8CC] flex-shrink-0" />{tip}</li>)}</ul>
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#1A1615]">Email Preview</h2>
            {hasEmail ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-[#5A534E]">Subject</label><button onClick={() => handleCopy(subject,"subject")} className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1A1615] transition">{copied==="subject" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}{copied==="subject"?"Copied!":"Copy"}</button></div>
                  <input value={subject} onChange={e => setSubject(e.target.value)} className="input-base text-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5"><label className="text-xs font-semibold text-[#5A534E]">Body</label><div className="flex gap-3"><button onClick={() => handleCopy(body,"body")} className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1A1615] transition">{copied==="body" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}{copied==="body"?"Copied!":"Copy"}</button><button onClick={handleGenerate} className="flex items-center gap-1 text-xs text-[#9B958F] hover:text-[#1A1615] transition"><RefreshCw size={11} /> Regen</button></div></div>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={13} className="input-base text-sm leading-relaxed resize-none" />
                </div>
                {sendError && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />{sendError}
                  </div>
                )}
                {sendSuccess && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                    <Check size={13} />Email sent successfully and saved to history.
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-50"
                  >
                    {sending ? <><RefreshCw size={13} className="animate-spin" /> Sending…</> : <><Send size={13} /> Send Email</>}
                  </button>
                </div>
                <p className="text-[11px] text-[#9B958F] text-center">Sends via Resend · Requires API key in Settings → Email</p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F3EF] flex items-center justify-center mb-4"><Mail size={24} className="text-[#C2B9B0]" /></div>
                <p className="text-sm text-[#9B958F]">Select a contact and trigger,<br />then click Generate Email</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History tab */}
      {pageTab === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F3EF] flex items-center justify-center mb-4"><History size={24} className="text-[#C2B9B0]" /></div>
              <p className="text-sm text-[#9B958F]">No emails sent yet</p>
              <p className="text-xs text-[#C2B9B0] mt-1">Emails you send from the Compose tab will appear here</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <button onClick={() => { if (window.confirm("Clear all email history?")) clearHistory(); }} className="flex items-center gap-1.5 text-xs text-[#9B958F] hover:text-red-500 transition-colors">
                  <Trash2 size={12} /> Clear history
                </button>
              </div>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">
                      {["Recipient","Subject","Trigger","Sent At","Status","Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#5A534E]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(item => (
                      <tr key={item.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A1615]">{item.recipient}</td>
                        <td className="px-4 py-3 text-[#5A534E] text-xs max-w-xs truncate">{item.subject}</td>
                        <td className="px-4 py-3 text-[#9B958F] text-xs">{item.trigger}</td>
                        <td className="px-4 py-3 text-[#9B958F] text-xs">
                          {new Date(item.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                          <span className="text-[#C2B9B0]">{new Date(item.sentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.status === "replied"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "sent"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.status === "sent" && (
                              <button
                                onClick={() => updateStatus(item.id, "replied")}
                                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <MessageSquare size={11} /> Mark replied
                              </button>
                            )}
                            {item.status === "replied" && (
                              <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <Check size={11} /> Replied
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
