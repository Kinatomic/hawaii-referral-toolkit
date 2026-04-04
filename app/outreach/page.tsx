"use client";

import { useState, useCallback } from "react";
import {
  Mail, Send, Copy, RefreshCw, Save, Zap, Clock, TrendingUp,
  ChevronDown, Check, AlertCircle, Trash2,
} from "lucide-react";
import { BROKERAGE_CONTACTS, TRIGGER_TYPES, TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/data";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";

interface Contact { id: number; name: string; brokerage: string; market: string; }
interface QueueItem { id: number; recipient: string; subject: string; trigger: string; generated: string; status: string; }
interface Stats { generated: number; queued: number; sent: number; responses: number; }
interface Params {
  personName: string; company: string; amount: string; activity: string;
  property: string; price: string; event: string; discussion: string; referrerName: string;
}

function generateEmail(contact: Contact, trigger: string, params: Params) {
  const templates: Record<string, { subject: (c: Contact, p: Params) => string; body: (c: Contact, p: Params) => string }> = {
    cold: {
      subject: (c) => c.market === "LA" ? "Your LA Clients' Next Trophy Property" : `Hawaii's Most Exclusive Market — For Your ${c.market} Clientele`,
      body: (c) => {
        const openings: Record<string, string> = {
          LA: `Josh — Your $9B+ track record speaks for itself. The buyers at that level increasingly tell us the same thing: "I have LA, I have Aspen... what's next?" That answer is increasingly Hawaii.`,
          NYC: `Ryan — Your reputation in NYC's most competitive trophy market is legendary. We work with a similar tier of buyer, but they're discovering something most Manhattan agents don't: the most exclusive address in America isn't in NYC anymore.`,
          Aspen: `Steven — You've dominated Aspen's luxury market for years. But even your biggest clients tell us: "I need another place that feels as private and exclusive as the Aspen community." Enter Molokai.`,
          "Beverly Hills": `Jade — Your Beverly Hills book is extraordinary. The $15M+ clients you work with are increasingly asking about Hawaii — not as a vacation rental, but as a genuine sanctuary.`,
          Miami: `We're seeing your Miami clients ask about what's next. Molokai delivers privacy that South Beach simply can't.`,
        };
        const opening = openings[c.market] ?? `${c.name.split(" ")[0]} — Your reputation in ${c.market} luxury is exactly why we're reaching out.`;
        return `${opening}

We're Mark Janes and Heidi Dollinger at Island Sotheby's International Realty, and we specialize in a segment of Hawaii most mainland agents don't even know exists: Molokai — 6,000-acre beachfront estates with zero paparazzi, zero resorts, zero traffic lights. Think "private island" without leaving Hawaii.

Your buyers at the $15M+ level have a specific need we solve better than anyone: a place where they can be truly unreachable. No Instagram problem. No surprise neighbors. Just uncompromised privacy and some of the most dramatic coastline on Earth.

We send you referrals with context (not a blind lead), we handle the full transaction, and we know how to work with mainland brokerages — we've built our entire practice on it.

Would you be open to a brief call this week to discuss the market and see if there's a fit for your book?

Best,
Mark Janes & Heidi Dollinger
Island Sotheby's International Realty`;
      },
    },
    liquidity: {
      subject: (c, p) => `Congratulations on ${p.personName || "the recent close"} — Hawaii Opportunity`,
      body: (c, p) => {
        const amountStr = p.amount ? ` of $${p.amount}M` : "";
        return `${c.name.split(" ")[0]} — Congratulations on the ${p.personName || "recent exit"} close${amountStr}. That's an exceptional outcome.

We see a pattern in our practice: exits in that range create a specific kind of buyer — someone who's just spent 5–10 years building something extraordinary and now wants a place that feels as far from a boardroom as possible. Somewhere they can actually breathe.

Molokai is that place. Not Maui (too social), not Oahu (too developed), not the mainland (too much is still business). Molokai is where your post-exit clients go to remember why they built their empire in the first place.

We specialize in exactly this moment: helping newly liquid UHNW clients find their sanctuary. And we'd love to be your referral partner when your clients start asking, "What's next?"

Do you have 15 minutes this week to talk about how we work with mainland brokerages?

Best,
Mark & Heidi`;
      },
    },
    activity: {
      subject: (c, p) => `Re: ${p.activity || "Expanding Referral Network"} — Hawaii's Most Exclusive Market`,
      body: (c, p) => `${c.name.split(" ")[0]} — Saw your recent post about ${p.activity || "expanding referral partnerships"} in luxury markets. Perfect timing.

We're the team that luxury agents across the mainland trust when their UHNW clients discover Hawaii. Not because we're aggressive, but because we're selective. We don't pitch every client — we match opportunities that make sense.

Your ${c.market} clientele is exactly the demographic moving to Hawaii: established wealth, privacy priorities, looking for something genuinely different. We have the inventory and expertise to make those transactions seamless.

More importantly, we understand referral relationships. We know you need to be confident in who you're sending your clients to. We'd love the chance to build that confidence with you.

Interested in a brief call to explore the opportunity?

Best,
Mark & Heidi`,
    },
    sale: {
      subject: (c, p) => `Referral Opportunity — Your Recent ${p.property || "Property"} Close`,
      body: (c, p) => `${c.name.split(" ")[0]} — Saw the news on your recent close of ${p.property || "the luxury property"}${p.price ? ` at $${p.price}M` : ""}. Exceptional transaction.

That level of deal flow tells us a lot: your clients are serious, your network is strong, and you know how to close at the top end. Those are exactly the agents we want to partner with.

Here's what we're seeing: agents with your trajectory often have clients who, after 1–2 major closings, start asking about Hawaii. Not as a vacation rental — as a serious second/primary residence. And they want someone they trust to guide them through the Hawaii market.

That's where we come in. We're not trying to steal your client — we're trying to extend your relationship and deepen your value. You stay the hero; we handle Hawaii complexity.

Would you be open to a conversation about how we structure these partnerships?

Best,
Mark & Heidi`,
    },
    conference: {
      subject: (c, p) => `Great Meeting You at ${p.event || "the Conference"} — Hawaii Opportunity`,
      body: (c, p) => `${c.name.split(" ")[0]} — Great meeting you at ${p.event || "the event"} the other day. I enjoyed our conversation about ${p.discussion || "the luxury market trends"}.

I wanted to follow up on something we touched on: the opportunity in Hawaii luxury. We're seeing an interesting shift in your market (${c.market}) where top agents are being asked about Hawaii options by their UHNW clients — and most don't have a trusted partner on the ground.

We've spent years building that ground game. Island Sotheby's connections, market knowledge, privacy-first approach, and — most importantly — respect for the referral relationship. Your client remains your client; we just execute Hawaii.

Would love to explore this as an ongoing partnership. Does next Tuesday work for a brief call?

Best,
Mark & Heidi
Island Sotheby's International Realty`,
    },
    referral: {
      subject: (c, p) => `${p.referrerName || "A Colleague"} Recommended You — Hawaii Partnership`,
      body: (c, p) => `${c.name.split(" ")[0]} — ${p.referrerName || "A mutual contact"} recently recommended we connect. Said you're exactly the kind of agent we should be working with.

Your reputation in ${c.market}, your client caliber, and your network are exactly what we look for in partnership opportunities.

Here's the reality: agents like you increasingly get asked about Hawaii. Your clients want a second home that's genuinely private, genuinely unique, and genuinely remote. Molokai delivers all three — and we're the team that makes that transaction effortless for you.

We'd love to explore a formal referral partnership. Would you have time this week for a quick introductory call?

Best,
Mark & Heidi`,
    },
    molokai: {
      subject: () => "Molokai's Most Exclusive Properties — For Your Privacy-Seeking Clients",
      body: (c) => `${c.name.split(" ")[0]} — You likely have clients who fit a specific profile: UHNW, privacy-obsessed, and tired of every major market feeling exposed.

Molokai is the antidote.

Not a resort. Not a development. Not even a town, really. Actual 6,000-acre private estates with direct coastline, zero infrastructure drama, zero paparazzi, zero social media presence. This is where your clients go when they need to truly disappear.

We work exclusively in this segment. We understand the buyer psychology (privacy above all), the market (incredibly selective), and the transaction complexity (mainland brokerages often underestimate it).

If you have clients asking "Is there anywhere genuinely private left in Hawaii?" — the answer is yes, and we're the experts.

Let's talk about how we can partner on this.

Best,
Mark & Heidi`,
    },
    market: {
      subject: () => "Hawaii Luxury Market Insights — Q2 2026 Update",
      body: (c) => `${c.name.split(" ")[0]} — We're sharing market intelligence with select agents we respect, and you came to mind.

Q2 2026 Hawaii luxury is revealing some fascinating patterns, especially in Molokai: down from headline-grabbing development talk, but UP in quiet acquisition by serious UHNW buyers. The narrative has shifted from "trophy property" to "genuine sanctuary."

This matters for your book because it means when your post-liquidity, privacy-seeking clients ask about Hawaii, you can give them real, current data — not speculation. And you have a trusted partner (us) ready to execute the introductions and transactions.

Would love to discuss how we can work together on referrals in this market.

Quick call this week?

Best,
Mark & Heidi`,
    },
  };

  const t = templates[trigger];
  if (!t) return { subject: "Hawaii Opportunity", body: "Error generating email." };
  return { subject: t.subject(contact, params), body: t.body(contact, params) };
}

const TRIGGER_FIELDS: Record<string, string[]> = {
  liquidity: ["personName", "company", "amount"],
  activity: ["activity"],
  sale: ["property", "price"],
  conference: ["event", "discussion"],
  referral: ["referrerName"],
};

const FIELD_LABELS: Record<string, string> = {
  personName: "Person/Company Name",
  company: "Company",
  amount: "Liquidity Amount ($M)",
  activity: "Social Media Activity",
  property: "Property Name",
  price: "Sale Price ($M)",
  event: "Event Name",
  discussion: "Topic Discussed",
  referrerName: "Referrer Name",
};

const BEST_PRACTICES = [
  "Send Tuesday–Thursday, 9–11am recipient timezone",
  "Keep subject line under 50 characters",
  "Personalize with specific market/recent activity",
  "Never lead with referral fee — lead with value",
  "Follow up 5–7 days after initial contact",
  "Second follow-up 14 days after first",
  "Always reference their market expertise",
];

export default function OutreachPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [trigger, setTrigger] = useState("cold");
  const [tone, setTone] = useState("warm");
  const [length, setLength] = useState("standard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [params, setParams] = useState<Params>({ personName: "", company: "", amount: "", activity: "", property: "", price: "", event: "", discussion: "", referrerName: "" });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasEmail, setHasEmail] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<Stats>({ generated: 0, queued: 0, sent: 0, responses: 0 });
  const [copied, setCopied] = useState<string | null>(null);

  const activeFields = TRIGGER_FIELDS[trigger] ?? [];

  const handleGenerate = useCallback(() => {
    if (!contact) return;
    const email = generateEmail(contact, trigger, params);
    setSubject(email.subject);
    setBody(email.body);
    setHasEmail(true);
    setStats(s => ({ ...s, generated: s.generated + 1 }));
  }, [contact, trigger, params]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleQueue = () => {
    if (!contact || !hasEmail) return;
    setQueue(q => [{ id: Date.now(), recipient: contact.name, subject, trigger: TRIGGER_TYPES.find(t => t.value === trigger)?.label ?? trigger, generated: new Date().toLocaleDateString(), status: "Draft" }, ...q]);
    setStats(s => ({ ...s, queued: s.queued + 1 }));
  };

  const handleMarkSent = (id: number) => {
    setQueue(q => q.map(item => item.id === id ? { ...item, status: "Sent" } : item));
    setStats(s => ({ ...s, sent: s.sent + 1 }));
  };

  const handleRemove = (id: number) => {
    setQueue(q => q.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail size={22} style={{ color: GOLD }} />
            <h1 className="text-2xl font-bold text-white">Smart Outreach Generator</h1>
          </div>
          <p className="text-[#8b95b0] text-sm">Hyper-personalized outreach for Pacific Island Partners</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { icon: TrendingUp, label: "Generated", value: stats.generated },
          { icon: Save, label: "In Queue", value: stats.queued },
          { icon: Send, label: "Sent", value: stats.sent },
          { icon: Zap, label: "Responses", value: stats.responses },
          { icon: Clock, label: "Response Rate", value: stats.sent > 0 ? `${Math.round((stats.responses / stats.sent) * 100)}%` : "0%" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-4 text-center" style={{ borderLeft: `3px solid ${GOLD}` }}>
            <Icon size={18} className="mx-auto mb-1.5" style={{ color: GOLD }} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-xs text-[#8b95b0] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Compose Panel */}
        <div className="card p-6 space-y-5">
          <h2 className="text-base font-bold text-white">Compose Outreach</h2>

          {/* Step 1: Contact */}
          <div>
            <label className="block text-xs font-semibold text-[#8b95b0] mb-2">Step 1 — Select Target</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(d => !d)}
                className="w-full text-left px-4 py-2.5 bg-[#0f1117] border border-[#2a3050] rounded-lg flex justify-between items-center hover:border-[#3a4570] transition text-sm"
              >
                <span className={contact ? "text-white" : "text-[#8b95b0]"}>
                  {contact ? `${contact.name} · ${contact.brokerage} (${contact.market})` : "Select a brokerage contact…"}
                </span>
                <ChevronDown size={14} className="text-[#8b95b0]" />
              </button>
              {showDropdown && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-[#2a3050] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {BROKERAGE_CONTACTS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setContact(c); setShowDropdown(false); setHasEmail(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#212840] transition text-sm border-b border-[#2a3050] last:border-0"
                    >
                      <span className="text-white font-medium">{c.name}</span>
                      <span className="text-[#8b95b0] ml-2 text-xs">{c.brokerage} · {c.market}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Trigger */}
          <div>
            <label className="block text-xs font-semibold text-[#8b95b0] mb-2">Step 2 — Trigger Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGER_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setTrigger(t.value); setHasEmail(false); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                    trigger === t.value
                      ? "text-white border"
                      : "text-[#8b95b0] bg-[#0f1117] border border-[#2a3050] hover:border-[#3a4570]"
                  }`}
                  style={trigger === t.value ? { backgroundColor: NAVY, borderColor: GOLD } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {activeFields.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#8b95b0] mb-2">Signal Details</label>
              <div className="space-y-2">
                {activeFields.map(f => (
                  <input
                    key={f}
                    placeholder={FIELD_LABELS[f] ?? f}
                    value={(params as unknown as Record<string, string>)[f] ?? ""}
                    onChange={e => setParams(p => ({ ...p, [f]: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a3050] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8b95b0] focus:outline-none focus:border-[#3a4570]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tone + Length */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8b95b0] mb-2">Tone</label>
              <div className="flex gap-1">
                {TONE_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setTone(o.value)}
                    className={`flex-1 py-1.5 text-xs rounded transition-all ${tone === o.value ? "text-white" : "text-[#8b95b0] bg-[#0f1117] border border-[#2a3050]"}`}
                    style={tone === o.value ? { backgroundColor: NAVY, border: `1px solid ${GOLD}` } : {}}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b95b0] mb-2">Length</label>
              <div className="flex gap-1">
                {LENGTH_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setLength(o.value)}
                    className={`flex-1 py-1.5 text-xs rounded transition-all ${length === o.value ? "text-white" : "text-[#8b95b0] bg-[#0f1117] border border-[#2a3050]"}`}
                    style={length === o.value ? { backgroundColor: NAVY, border: `1px solid ${GOLD}` } : {}}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!contact}
            className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            <Zap size={16} /> Generate Email
          </button>

          {/* Best Practices */}
          <div className="border border-[#2a3050] rounded-lg p-4 bg-[#0f1117]">
            <p className="text-xs font-semibold text-[#8b95b0] mb-2 flex items-center gap-1.5">
              <AlertCircle size={12} style={{ color: GOLD }} /> Best Practices
            </p>
            <ul className="space-y-1">
              {BEST_PRACTICES.map((tip, i) => (
                <li key={i} className="text-xs text-[#8b95b0] flex items-start gap-1.5">
                  <span className="mt-0.5 w-1 h-1 rounded-full bg-[#3a4570] flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Email Preview</h2>

          {hasEmail ? (
            <>
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#8b95b0]">Subject</label>
                  <button onClick={() => handleCopy(subject, "subject")} className="flex items-center gap-1 text-xs text-[#8b95b0] hover:text-white transition">
                    {copied === "subject" ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copied === "subject" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2a3050] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3a4570]"
                />
              </div>

              {/* Body */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#8b95b0]">Body</label>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(body, "body")} className="flex items-center gap-1 text-xs text-[#8b95b0] hover:text-white transition">
                      {copied === "body" ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                      {copied === "body" ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={handleGenerate} className="flex items-center gap-1 text-xs text-[#8b95b0] hover:text-white transition">
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                </div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={16}
                  className="w-full bg-[#0f1117] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-[#c8d0e4] focus:outline-none focus:border-[#3a4570] leading-relaxed resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleQueue}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 border border-[#3a4570] text-[#8b95b0] hover:text-white hover:border-white transition"
                >
                  <Save size={14} /> Save to Queue
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition hover:opacity-90"
                  style={{ backgroundColor: GOLD, color: NAVY }}
                >
                  <Send size={14} /> Send Email
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
              <Mail size={48} className="text-[#2a3050] mb-4" />
              <p className="text-[#8b95b0] text-sm">Select a contact and trigger,<br />then click Generate Email</p>
            </div>
          )}
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[#2a3050] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Outreach Queue ({queue.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1E2761] text-white text-xs">
                {["Recipient", "Subject", "Trigger", "Generated", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map(item => (
                <tr key={item.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{item.recipient}</td>
                  <td className="px-4 py-3 text-[#c8d0e4] text-xs max-w-xs truncate">{item.subject}</td>
                  <td className="px-4 py-3 text-[#8b95b0] text-xs">{item.trigger}</td>
                  <td className="px-4 py-3 text-[#8b95b0] text-xs">{item.generated}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Sent" ? "bg-green-900/40 text-green-300 border border-green-700/40" : "bg-amber-900/40 text-amber-300 border border-amber-700/40"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status !== "Sent" && (
                        <button onClick={() => handleMarkSent(item.id)} className="text-xs text-green-400 hover:underline flex items-center gap-1">
                          <Check size={11} /> Mark Sent
                        </button>
                      )}
                      <button onClick={() => handleRemove(item.id)} className="text-xs text-red-400 hover:text-red-300 transition">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
