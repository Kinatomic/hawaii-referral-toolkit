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

const NAVY = "#1E2761";
const GOLD = "#C9A96E";
const CHART_COLORS = ["#1E2761", "#CADCFC", "#B8D4F1", "#7FB3E3", "#4A90C7", "#2d3a8c"];

const stageColors: Record<string, string> = {
  "Showing Scheduled": "bg-amber-900/40 text-amber-300 border border-amber-800/50",
  "Under Contract": "bg-green-900/40 text-green-300 border border-green-800/50",
  "Initial Inquiry": "bg-blue-900/40 text-blue-300 border border-blue-800/50",
  "Negotiation": "bg-purple-900/40 text-purple-300 border border-purple-800/50",
  "Property Tour": "bg-orange-900/40 text-orange-300 border border-orange-800/50",
  "Closed": "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
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
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Referral Pipeline</h1>
          <p className="text-[#8b95b0] text-sm mt-0.5">Pacific Island Partners · Hawaii Luxury</p>
        </div>
        <div className="text-right text-sm text-[#8b95b0]">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Brokerage Partners", value: "60", sub: "+12 this quarter", icon: Building2, trend: true },
          { label: "Active Leads", value: String(activeLeads), sub: "In active pipeline", icon: Users, trend: false },
          { label: "Closed YTD", value: String(closedDeals), sub: "Successfully closed", icon: CheckCircle, trend: false },
          { label: "Commission YTD", value: `$${(totalCommission / 1000000).toFixed(2)}M`, sub: "Revenue generated", icon: DollarSign, trend: false },
        ].map(({ label, value, sub, icon: Icon, trend }) => (
          <div key={label} className="card p-5 border-t-2" style={{ borderTopColor: GOLD }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[#8b95b0] text-xs font-medium">{label}</p>
              <Icon size={18} style={{ color: GOLD }} />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <div className={`flex items-center mt-2 text-xs ${trend ? "text-green-400" : "text-[#8b95b0]"}`}>
              {trend && <ArrowUp size={12} className="mr-1" />}
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Pipeline Table */}
        <div className="col-span-7 space-y-4">
          {/* Filter */}
          <div className="card p-4 flex items-center gap-3">
            <span className="text-sm text-[#8b95b0]">Filter:</span>
            {["All", "Molokai", "Maui"].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeFilter === f
                    ? "text-white"
                    : "text-[#8b95b0] bg-[#212840] hover:text-white"
                }`}
                style={activeFilter === f ? { backgroundColor: NAVY } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: NAVY }}>
                  {["Lead", "Brokerage", "Market", "Property", "Value", "Stage", "Days"].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-white ${h === "Value" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className="border-b border-[#2a3050] hover:bg-[#212840] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{row.lead}</td>
                    <td className="px-4 py-3 text-[#8b95b0] text-xs">{row.brokerage}</td>
                    <td className="px-4 py-3 text-[#8b95b0]">{row.market}</td>
                    <td className="px-4 py-3 text-[#8b95b0]">{row.property}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">{row.value}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${stageColors[row.stage] ?? "bg-gray-800 text-gray-300"}`}>
                        {row.stage === "Closed" && <CheckCircle size={11} />}
                        {row.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[#8b95b0] text-xs">{row.days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Funnel */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Outreach Funnel</h3>
            <div className="space-y-3">
              {[
                { label: "Total Target Brokerages", value: 60 },
                { label: "Contacted", value: 35 },
                { label: "Responded", value: 22 },
                { label: "Meetings Completed", value: 12 },
                { label: "Partnerships Signed", value: 8 },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8b95b0]">{s.label}</span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                  <div className="w-full bg-[#2a3050] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(s.value / 60) * 100}%`,
                        backgroundColor: i === 4 ? NAVY : `rgba(30,39,97,${0.3 + i * 0.15})`,
                        border: i === 4 ? `1px solid ${GOLD}` : undefined,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts column */}
        <div className="col-span-5 space-y-4">
          {/* Commission Bar Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Commission</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyCommission}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3050" />
                <XAxis dataKey="month" stroke="#8b95b0" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8b95b0" tick={{ fontSize: 10 }} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip
                  formatter={(v) => [`$${((v as number) / 1000).toFixed(0)}K`, "Commission"]}
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3050", borderRadius: 8 }}
                  labelStyle={{ color: "#e8ecf4" }}
                />
                <Bar dataKey="commission" fill={NAVY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Distribution */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Market Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={marketDistribution} cx="50%" cy="50%" outerRadius={65}
                  dataKey="value" labelLine={false}
                  label={({ name, value }) => `${value}%`}>
                  {marketDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`}
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3050", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {marketDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-[#8b95b0]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          {/* Property Donut */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Property Mix</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={propertyDistribution} cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65} dataKey="value" labelLine={false}
                  label={({ value }) => `${value}%`}>
                  {propertyDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`}
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3050", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity + Actions */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: GOLD }} />
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-[#2a3050] last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: GOLD }} />
                <div>
                  <p className="text-[10px] font-semibold text-[#8b95b0] mb-0.5">{a.date}</p>
                  <p className="text-sm text-[#c8d0e4]">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Pipeline Actions</h3>
            <p className="text-xs text-[#8b95b0]">Manage referral leads and track partnership progress.</p>
          </div>
          <button
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            <Plus size={16} /> Add New Lead
          </button>
          <div className="pt-4 border-t border-[#2a3050] space-y-2">
            <p className="text-xs text-[#8b95b0] font-medium">Quick Stats</p>
            <p className="text-sm text-[#c8d0e4]">
              <span className="font-bold text-white">{filtered.length}</span> total leads
            </p>
            <p className="text-sm text-[#c8d0e4]">
              <span className="font-bold text-white">${filtered.reduce((s, d) => s + d.valueNum, 0).toLocaleString()}</span> pipeline value
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
