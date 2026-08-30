"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertOctagon,
  Activity,
  Eye,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { getHistory } from "@/lib/store";
import type { ScreeningRecord } from "@/lib/types";

const RISK_COLORS = { Low: "#14b8a6", Moderate: "#f59e0b", High: "#ef4444" };

export default function DashboardPage() {
  const [history] = useState<ScreeningRecord[]>(() =>
    typeof window !== "undefined" ? getHistory() : [],
  );

  const stats = useMemo(() => {
    const low = history.filter((h) => h.risk === "Low").length;
    const mod = history.filter((h) => h.risk === "Moderate").length;
    const high = history.filter((h) => h.risk === "High").length;
    return { total: history.length, low, mod, high };
  }, [history]);

  const gradeData = useMemo(() => {
    const names = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];
    return names.map((name, grade) => ({
      name: name.replace("Proliferative DR", "Prolif."),
      cases: history.filter((h) => h.grade === grade).length,
    }));
  }, [history]);

  const trendData = useMemo(() => {
    const days = 14;
    const out: { day: string; screenings: number; highRisk: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayRecords = history.filter((h) => {
        const hd = new Date(h.date);
        return hd >= d && hd < next;
      });
      out.push({
        day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        screenings: dayRecords.length,
        highRisk: dayRecords.filter((r) => r.risk === "High").length,
      });
    }
    return out;
  }, [history]);

  const riskPie = useMemo(
    () => [
      { name: "Low Risk", value: stats.low, color: RISK_COLORS.Low },
      { name: "Moderate Risk", value: stats.mod, color: RISK_COLORS.Moderate },
      { name: "High Risk", value: stats.high, color: RISK_COLORS.High },
    ],
    [stats],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">Overview</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">Screening Dashboard</h1>
          <p className="mt-2 text-slate-500">Live view of all retinal screenings performed with RetinaAI.</p>
        </div>
        <Link
          href="/screening"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5"
        >
          <Activity className="h-4 w-4" /> New Screening
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Eye className="h-6 w-6" />} label="Total Screenings" value={stats.total} tone="sky" />
        <StatCard icon={<ShieldCheck className="h-6 w-6" />} label="Low-Risk Cases" value={stats.low} tone="teal" />
        <StatCard icon={<TriangleAlert className="h-6 w-6" />} label="Moderate-Risk Cases" value={stats.mod} tone="amber" />
        <StatCard icon={<AlertOctagon className="h-6 w-6" />} label="High-Risk Cases" value={stats.high} tone="red" />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="font-bold text-slate-900">Screenings — Last 14 Days</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -18, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="screenings" name="Screenings" stroke="#0284c7" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="highRisk" name="High-risk" stroke="#ef4444" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-slate-900">Risk Distribution</h2>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskPie} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={4} strokeWidth={0}>
                  {riskPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-5">
          <h2 className="font-bold text-slate-900">Cases by DR Stage</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Bar dataKey="cases" name="Cases" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="font-bold text-slate-900">Recent Screening History</h2>
          <span className="text-xs font-medium text-slate-400">{Math.min(history.length, 10)} of {history.length}</span>
        </div>
        <div className="overflow-x-auto px-2 pb-4">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-slate-400 [&_th]:uppercase">
                <th>Patient</th><th>Date</th><th>Prediction</th><th>Confidence</th><th>Risk</th><th></th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((h) => (
                <tr key={h.id + h.date} className="border-t border-slate-50 hover:bg-sky-50/40 [&_td]:px-4 [&_td]:py-3.5">
                  <td>
                    <span className="font-semibold text-slate-800">{h.patientName || "Unnamed"}</span>
                    <span className="block text-xs text-slate-400">{h.patientId || h.id}</span>
                  </td>
                  <td className="whitespace-nowrap text-slate-500">
                    {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    <span className="block text-xs text-slate-300">
                      {new Date(h.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="font-medium text-slate-700">{h.label}</td>
                  <td className="text-slate-500">{h.confidence}%</td>
                  <td>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${h.risk === "Low" ? "bg-teal-50 text-teal-700" : h.risk === "Moderate" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                      {h.risk}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href="/results" className="text-xs font-semibold text-sky-600 hover:text-teal-600">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
        Demo dataset is shown until you perform your first live screening · All
        results are screening-support only and not a medical diagnosis.
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "sky" | "teal" | "amber" | "red" }) {
  const tones = {
    sky: "from-sky-50 to-white text-sky-600 border-sky-100",
    teal: "from-teal-50 to-white text-teal-600 border-teal-100",
    amber: "from-amber-50 to-white text-amber-600 border-amber-100",
    red: "from-red-50 to-white text-red-600 border-red-100",
  };
  return (
    <div className={`rounded-3xl border bg-gradient-to-b p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm`}>{icon}</div>
      <p className="mt-4 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
