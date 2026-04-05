"use client";

import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Building2, Users, CheckCircle, DollarSign, ArrowUp, Plus, Activity,
  X, Trash2, AlertTriangle, RefreshCw, Edit2,
} from "lucide-react";
import {
  monthlyCommission, marketDistribution, propertyDistribution, activityFeed,
} from "@/lib/data";
import { usePipeline, PipelineRow } from "@/lib/useLocalData";

const GOLD = "#C9A96E";
const NAVY = "#1E2761";
const CHART_COLORS = ["#1E2761", "#4A6CF7", "#7B9EF7", "#CADCFC", "#C9A96E", "#E8DCC8"];

const stageColors: Record<string, string> = {
  "Showing Scheduled": "bg-amber-50 text-amber-700 border border-amber-200",
  "Under Contract":    "bg-green-50 text-green-700 border border-green-200",
  "Initial Inquiry":   "bg-blue-50 text-blue-700 border border-blue-200",
  "Negotiation":       "bg-purple-50 text-purple-700 border border-purple-200",
  "Property Tour":     "bg-orange-50 text-orange-700 border border-orange-200",
  "Closed":            "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const STAGES = ["Initial Inquiry", "Property Tour", "Showing Scheduled", "Negotiation", "Under Contract", "Closed"];
const MARKETS = ["Molokai", "Maui", "Oahu", "Kauai", "Big Island", "Other"];

interface LeadForm {
  lead: string;
  brokerage: string;
  market: string;
  property: string;
  valueNum: number;
  stage: string;
  days: number;
}

const BLANK_FORM: LeadForm = {
  lead: "", brokerage: "",
  market: "Molokai", property: "", valueNum: 0, stage: "Initial Inquiry", days: 0,
};

function LeadModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<LeadForm> & { id?: number };
  onSave: (f: LeadForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<LeadForm>({
    lead: initial?.lead ?? "",
    brokerage: initial?.brokerage ?? "",
    market: initial?.market ?? "Molokai",
    property: initial?.property ?? "",
    valueNum: initial?.valueNum ?? 0,
    stage: initial?.stage ?? "Initial Inquiry",
    days: initial?.days ?? 0,
  });
  const set = <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lead.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#EDE8E0]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3]">
          <h2 className="text-sm font-semibold text-[#1A1615]">{initial?.id ? "Edit Lead" : "Add New Lead"}</h2>
          <button onClick={onClose} className="text-[#9B958F] hover:text-[#1A1615] transition"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Lead Name *</label>
              <input
                value={form.lead}
                onChange={e => set("lead", e.target.value)}
                placeholder="John Smith"
                required
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Brokerage</label>
              <input value={form.brokerage} onChange={e => set("brokerage", e.target.value)} placeholder="Compass" className="input-base text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Market</label>
              <select value={form.market} onChange={e => set("market", e.target.value)} className="input-base text-sm">
                {MARKETS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Property / Notes</label>
              <input value={form.property} onChange={e => set("property", e.target.value)} placeholder="Oceanfront estate, Molokai North Shore" className="input-base text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Deal Value ($)</label>
              <input
                type="number"
                min="0"
                step="100000"
                value={form.valueNum || ""}
                onChange={e => set("valueNum", Number(e.target.value))}
                placeholder="5000000"
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A534E] mb-1.5">Stage</label>
              <select value={form.stage} onChange={e => set("stage", e.target.value)} className="input-base text-sm">
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
            <button type="submit" className="btn-primary flex-1 text-sm py-2.5">
              {initial?.id ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-[#EDE8E0] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <h2 className="text-sm font-semibold text-[#1A1615] mb-1">Delete lead?</h2>
        <p className="text-xs text-[#9B958F] mb-6">"{name}" will be permanently removed from the pipeline.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 text-sm py-2">Cancel</button>
          <button onClick={onConfirm} className="flex-1 text-sm py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { rows, isDemoData, addRow, updateRow, deleteRow, clearDemo } = usePipeline();
  const [activeFilter, setActiveFilter] = useState("All");
  const [modal, setModal] = useState<"add" | null>(null);
  const [editRow, setEditRow] = useState<PipelineRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PipelineRow | null>(null);

  const filtered = activeFilter === "All"
    ? rows
    : rows.filter(d => d.market === activeFilter || d.property.includes(activeFilter));

  const totalCommission = monthlyCommission.reduce((s, m) => s + m.commission, 0);
  const closedDeals = rows.filter(d => d.stage === "Closed").length;
  const activeLeads = rows.filter(d => d.stage !== "Closed").length;

  const handleAddSave = (form: LeadForm) => {
    addRow({
      lead: form.lead,
      brokerage: form.brokerage,
      market: form.market,
      property: form.property,
      value: form.valueNum >= 1_000_000
        ? `$${(form.valueNum / 1_000_000).toFixed(1)}M`
        : form.valueNum > 0 ? `$${(form.valueNum / 1000).toFixed(0)}K` : "–",
      valueNum: form.valueNum,
      stage: form.stage,
      days: 0,
    });
    setModal(null);
  };

  const handleEditSave = (form: LeadForm) => {
    if (!editRow) return;
    updateRow(editRow.id, {
      lead: form.lead,
      brokerage: form.brokerage,
      market: form.market,
      property: form.property,
      value: form.valueNum >= 1_000_000
        ? `$${(form.valueNum / 1_000_000).toFixed(1)}M`
        : form.valueNum > 0 ? `$${(form.valueNum / 1000).toFixed(0)}K` : "–",
      valueNum: form.valueNum,
      stage: form.stage,
    });
    setEditRow(null);
  };

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Demo data banner */}
      {isDemoData && (
        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle size={15} />
            <span className="font-medium">Sample data</span>
            <span className="text-amber-600">— this pipeline is pre-filled with demo leads. Clear it to start fresh.</span>
          </div>
          <button
            onClick={() => { if (window.confirm("Remove all sample data and start with an empty pipeline?")) clearDemo(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw size={12} /> Clear sample data
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1615] tracking-tight">Referral Pipeline</h1>
          <p className="text-sm text-[#9B958F] mt-0.5">Pacific Island Partners · Hawaii Luxury</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#9B958F]">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button onClick={() => setModal("add")} className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Brokerage Partners", value: "60", sub: "+12 this quarter", icon: Building2, trend: true },
          { label: "Active Leads",       value: String(activeLeads), sub: "In active pipeline", icon: Users, trend: false },
          { label: "Closed YTD",         value: String(closedDeals), sub: "Successfully closed", icon: CheckCircle, trend: false },
          { label: "Commission YTD",     value: `$${(totalCommission / 1000000).toFixed(2)}M`, sub: "Revenue generated", icon: DollarSign, trend: false },
        ].map(({ label, value, sub, icon: Icon, trend }) => (
          <div key={label} className="card p-5" style={{ borderTop: `2px solid ${GOLD}` }}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-[#9B958F]">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-[#F5F3EF] flex items-center justify-center">
                <Icon size={15} style={{ color: GOLD }} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-[#1A1615] tracking-tight">{value}</p>
            <div className={`flex items-center mt-2 text-xs ${trend ? "text-emerald-600" : "text-[#9B958F]"}`}>
              {trend && <ArrowUp size={11} className="mr-1" />}
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Pipeline Table */}
        <div className="col-span-7 space-y-4">
          <div className="card p-3 flex items-center gap-2">
            <span className="text-xs text-[#9B958F] font-medium mr-1">Filter:</span>
            {["All", "Molokai", "Maui"].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? "bg-[#1E2761] text-white"
                    : "text-[#5A534E] bg-[#F5F3EF] hover:bg-[#EDE8E0]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F5F3EF] flex items-center justify-center mb-3">
                  <Users size={20} className="text-[#C2B9B0]" />
                </div>
                <p className="text-sm text-[#9B958F]">No leads yet</p>
                <button onClick={() => setModal("add")} className="mt-3 text-xs font-semibold text-[#1E2761] hover:underline flex items-center gap-1">
                  <Plus size={11} /> Add your first lead
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">
                    {["Lead", "Brokerage", "Market", "Property", "Value", "Stage", "Days", ""].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-[#5A534E] text-left ${h === "Value" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <tr
                      key={row.id}
                      onClick={() => setEditRow(row)}
                      className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-medium text-[#1A1615]">
                        <div className="flex items-center gap-2">
                          {row.lead}
                          {isDemoData && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-500 border border-amber-200">DEMO</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#9B958F] text-xs">{row.brokerage}</td>
                      <td className="px-4 py-3 text-[#5A534E]">{row.market}</td>
                      <td className="px-4 py-3 text-[#5A534E]">{row.property}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1A1615]">{row.value}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[row.stage] ?? "bg-gray-100 text-gray-600"}`}>
                          {row.stage === "Closed" && <CheckCircle size={10} />}
                          {row.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[#9B958F] text-xs">{row.days}d</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setEditRow(row); }}
                            className="p-1 rounded hover:bg-[#EDE8E0] text-[#9B958F] hover:text-[#1A1615] transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteTarget(row); }}
                            className="p-1 rounded hover:bg-red-50 text-[#9B958F] hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#1A1615] mb-4">Outreach Funnel</h3>
            <div className="space-y-3">
              {[
                { label: "Total Target Brokerages", value: 60 },
                { label: "Contacted", value: 35 },
                { label: "Responded", value: 22 },
                { label: "Meetings Completed", value: 12 },
                { label: "Partnerships Signed", value: 8 },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#5A534E]">{s.label}</span>
                    <span className="font-semibold text-[#1A1615]">{s.value}</span>
                  </div>
                  <div className="w-full bg-[#F5F3EF] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(s.value / 60) * 100}%`, backgroundColor: i === 4 ? GOLD : NAVY, opacity: 0.4 + i * 0.12 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-5 space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#1A1615] mb-4">Monthly Commission</h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={monthlyCommission}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                <XAxis dataKey="month" stroke="#C2B9B0" tick={{ fontSize: 10, fill: "#9B958F" }} />
                <YAxis stroke="#C2B9B0" tick={{ fontSize: 10, fill: "#9B958F" }} tickFormatter={v => `$${(v as number) / 1000}K`} />
                <Tooltip formatter={(v) => [`$${((v as number) / 1000).toFixed(0)}K`, "Commission"]} contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="commission" fill={NAVY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#1A1615] mb-3">Market Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={marketDistribution} cx="50%" cy="50%" outerRadius={58} dataKey="value" labelLine={false} label={({ value }) => `${value}%`}>
                  {marketDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {marketDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-[#5A534E]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[#1A1615] mb-3">Property Mix</h3>
            <ResponsiveContainer width="100%" height={145}>
              <PieChart>
                <Pie data={propertyDistribution} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" labelLine={false} label={({ value }) => `${value}%`}>
                  {propertyDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "white", border: "1px solid #EDE8E0", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity + Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} style={{ color: GOLD }} />
            <h3 className="text-sm font-semibold text-[#1A1615]">Recent Activity</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-[#F5F3EF] last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: GOLD }} />
                <div>
                  <p className="text-[10px] font-semibold text-[#C2B9B0] mb-0.5 uppercase tracking-wider">{a.date}</p>
                  <p className="text-sm text-[#5A534E]">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[#1A1615] mb-1">Summary</h3>
          <p className="text-xs text-[#9B958F] mb-4">Current filtered view</p>
          <div className="space-y-0 flex-1 divide-y divide-[#F5F3EF]">
            {[
              { label: "Total leads", value: filtered.length },
              {
                label: "Pipeline value",
                value: filtered.length
                  ? `$${(filtered.reduce((s, d) => s + (d.valueNum ?? 0), 0) / 1000000).toFixed(1)}M`
                  : "–",
              },
              {
                label: "Avg deal",
                value: filtered.length
                  ? `$${((filtered.reduce((s, d) => s + (d.valueNum ?? 0), 0) / filtered.length) / 1000000).toFixed(1)}M`
                  : "–",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5">
                <span className="text-sm text-[#9B958F]">{label}</span>
                <span className="text-sm font-semibold text-[#1A1615]">{value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setModal("add")} className="btn-gold w-full mt-4 text-sm py-2.5 flex items-center justify-center gap-1.5">
            <Plus size={14} /> Add New Lead
          </button>
        </div>
      </div>

      {/* Modals */}
      {modal === "add" && (
        <LeadModal onSave={handleAddSave} onClose={() => setModal(null)} />
      )}
      {editRow && (
        <LeadModal initial={editRow} onSave={handleEditSave} onClose={() => setEditRow(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.lead}
          onConfirm={() => { deleteRow(deleteTarget.id); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
