"use client";

import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Building2, Users, CheckCircle, DollarSign, ArrowUp, Plus, Activity } from "lucide-react";
import {
  pipelineData, monthlyCommission, marketDistribution,
  propertyDistribution, activityFeed,
} from "@/lib/data";

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

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? pipelineData
    : pipelineData.filter(d => d.property.includes(activeFilter));

  const totalCommission = monthlyCommission.reduce((s, m) => s + m.commission, 0);
  const closedDeals = pipelineData.filter(d => d.stage === "Closed").length;
  const activeLeads = pipelineData.filter(d => d.stage !== "Closed").length;

  return (
    <div className="min-h-screen p-8 space-y-6">
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
          <button className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F3EF] border-b border-[#EDE8E0]">
                  {["Lead", "Brokerage", "Market", "Property", "Value", "Stage", "Days"].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-[#5A534E] text-left ${h === "Value" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className="border-b border-[#F5F3EF] hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1615]">{row.lead}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
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
              { label: "Pipeline value", value: `$${(filtered.reduce((s, d) => s + d.valueNum, 0) / 1000000).toFixed(1)}M` },
              { label: "Avg deal", value: `$${((filtered.reduce((s, d) => s + d.valueNum, 0) / filtered.length) / 1000000).toFixed(1)}M` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5">
                <span className="text-sm text-[#9B958F]">{label}</span>
                <span className="text-sm font-semibold text-[#1A1615]">{value}</span>
              </div>
            ))}
          </div>
          <button className="btn-gold w-full mt-4 text-sm py-2.5 flex items-center justify-center gap-1.5">
            <Plus size={14} /> Add New Lead
          </button>
        </div>
      </div>
    </div>
  );
}
