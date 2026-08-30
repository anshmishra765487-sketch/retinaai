"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BrainCircuit,
  Download,
  Eye,
  FileText,
  Info,
  Lightbulb,
  Printer,
  RotateCcw,
  ScanEye,
} from "lucide-react";
import { getResult, getHistory, saveScreening } from "@/lib/store";
import { DR_LABELS, type DRGrade, type ScreeningRecord } from "@/lib/types";

const RISK_STYLES: Record<string, string> = {
  Low: "bg-teal-50 text-teal-700 border-teal-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
};

const GRADE_BAR: Record<DRGrade, string> = {
  0: "from-teal-400 to-teal-500",
  1: "from-sky-400 to-teal-500",
  2: "from-amber-400 to-orange-500",
  3: "from-orange-500 to-red-500",
  4: "from-red-500 to-red-600",
};

export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">Loading...</div>}>
      <ResultsPage />
    </Suspense>
  );
}

function ResultsPage() {
  const searchParams = useSearchParams();
  const [record, setRecord] = useState<ScreeningRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [pid, setPid] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const r = getResult(id);
      if (r) {
        setRecord(r);
        setLoading(false);
        return;
      }
    }
    setRecord(null);
    setLoading(false);
  }, [searchParams]);

  if (loading) return null;

  if (!record) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">No result yet</h1>
        <p className="mt-2 text-slate-500">
          Analyze a retinal image first to see the AI results here.
        </p>
        <Link
          href="/screening"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-5 py-3 font-semibold text-white shadow-md"
        >
          <ScanEye className="h-4 w-4" /> Start Screening
        </Link>
      </div>
    );
  }

  const attachInfo = () => {
    const updated: ScreeningRecord = {
      ...record,
      patientName: name.trim(),
      patientId: pid.trim() || `PID-${Date.now().toString().slice(-5)}`,
    };
    setRecord(updated);
    saveScreening(updated); // also refreshes latest
  };

  const dateStr = new Date(record.date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Prediction summary */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md sm:p-8 print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">AI Screening Result</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{record.label}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Report ID · {record.id} · {dateStr}
              {record.engine && (
                <span
                  className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-bold ${
                    record.engine === "cnn"
                      ? "bg-teal-50 text-teal-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {record.engine === "cnn" ? "CNN Model (ONNX)" : "Demo Engine"}
                </span>
              )}
            </p>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-sm font-bold ${RISK_STYLES[record.risk]}`}>
            {record.risk} Risk
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Confidence" value={`${record.confidence}%`} />
          <Metric label="Stage (0–4)" value={`Grade ${record.grade}`} />
          <Metric label="Risk Level" value={record.risk} />
          <Metric label="Recommendation" value={record.risk === "High" ? "Urgent referral" : record.risk === "Moderate" ? "Follow-up visit" : "Routine check-up"} />
        </div>

        {/* Diabetes Status */}
        <div className={`mt-6 rounded-2xl border p-5 ${
          record.diabetes === "Highly Likely"
            ? "border-red-200 bg-red-50"
            : record.diabetes === "Likely"
              ? "border-orange-200 bg-orange-50"
              : record.diabetes === "Possible"
                ? "border-amber-200 bg-amber-50"
                : "border-teal-200 bg-teal-50"
        }`}>
          <p className="flex items-center gap-2 font-semibold text-slate-800">
            <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 6v6l4 2"/></svg>
            Diabetes Status: <span className={
              record.diabetes === "Highly Likely" ? "text-red-700" :
              record.diabetes === "Likely" ? "text-orange-700" :
              record.diabetes === "Possible" ? "text-amber-700" : "text-teal-700"
            }>{record.diabetes}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {record.diabetesMsg}
          </p>
        </div>

        <div className="mt-6">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full bg-gradient-to-r ${GRADE_BAR[record.grade]}`} style={{ width: `${Math.min(record.confidence, 100)}%` }} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-800">
            <Lightbulb className="h-4.5 w-4.5 text-sky-600" /> What this means
          </p>
          <p className="mt-2 leading-relaxed text-slate-600">{record.explanation}</p>
          <ul className="mt-4 space-y-1.5">
            {record.findings.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          This tool is for screening and educational purposes only. It does not
          replace examination or diagnosis by a qualified healthcare
          professional.
        </p>
      </section>

      {/* Explainable AI */}
      <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-md sm:p-8">
        <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">Explainable AI</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">What did the model look at?</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Figure src={record.imageDataUrl} label="Original Fundus Image" icon={<Eye className="h-4 w-4" />} empty="Image unavailable" />
          <Figure src={record.heatmapDataUrl} label="AI Attention Heatmap (Grad-CAM)" icon={<BrainCircuit className="h-4 w-4" />} empty="Heatmap unavailable for demo records" />
        </div>

        <p className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <Info className="h-4 w-4 shrink-0 text-sky-600" />
          Highlighted regions indicate areas the model considered important when making its prediction.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <XaiCard title="Why explainability?" text="A prediction without reasons is hard to trust. Heatmaps let doctors verify the AI focused on real lesions, not artifacts." />
          <XaiCard title="How Grad-CAM works" text="The network's last convolutional layer shows which pixels contributed most to the chosen class — drawn as a heat overlay." />
          <XaiCard title="Human in the loop" text="The final medical decision always stays with a qualified ophthalmologist; the AI is only a second opinion." />
        </div>
      </section>

      {/* Patient report */}
      <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-md sm:p-8" id="printable">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">Patient Report</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">RetinaAI Screening Report</h2>
          </div>
          <FileText className="hidden h-9 w-9 text-sky-200 sm:block" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 print:hidden">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Patient name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={attachInfo}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Patient ID (optional)</span>
            <input
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              onBlur={attachInfo}
              placeholder="auto-generated if empty"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <table className="mt-5 w-full overflow-hidden rounded-2xl border border-slate-100 text-left text-sm">
          <tbody className="[&_td]:border-b [&_td]:border-slate-50 [&_th]:border-b [&_th]:border-slate-50 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:text-slate-500 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-slate-700">
            <tr><th>Patient Name</th><td>{record.patientName || "—"}</td></tr>
            <tr><th>Patient ID</th><td>{record.patientId || "—"}</td></tr>
            <tr><th>Screening Date</th><td>{dateStr}</td></tr>
            <tr><th>AI Prediction</th><td className="font-bold">{record.label} ({DR_LABELS[record.grade]})</td></tr>
            <tr><th>Confidence</th><td>{record.confidence}%</td></tr>
            <tr><th>Risk Level</th><td>{record.risk}</td></tr>
            <tr><th>Summary</th><td>{record.explanation}</td></tr>
          </tbody>
        </table>

        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-5 py-3 font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5"
          >
            <Printer className="h-4.5 w-4.5" /> Print Report
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
          >
            <Download className="h-4 w-4" /> Download as PDF
          </button>
          <Link
            href="/screening"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
          >
            <RotateCcw className="h-4 w-4" /> New Screening
          </Link>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
          Generated by RetinaAI screening software · Demo build with simulated
          inference · Not a medical device · This tool is for screening and
          educational purposes only and does not replace examination or
          diagnosis by a qualified healthcare professional.
        </p>
      </section>

      {getHistorySafeLength() > 1 && (
        <div className="mt-8 text-center print:hidden">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-teal-600">
            View all screenings on the Dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function Figure({ src, label, icon, empty }: { src: string; label: string; icon: React.ReactNode; empty: string }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon} {label}
      </p>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="aspect-square w-full rounded-2xl border border-slate-100 object-cover shadow-sm" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
          {empty}
        </div>
      )}
    </div>
  );
}

function XaiCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <p className="font-bold text-slate-800">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

function getHistorySafeLength(): number {
  try {
    return getHistory().length;
  } catch {
    return 0;
  }
}
