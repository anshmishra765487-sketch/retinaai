"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  RefreshCcw,
  ScanEye,
  UploadCloud,
} from "lucide-react";
import {
  extractFeatures,
  generateHeatmap,
  predictFromFeatures,
  shrinkImage,
  validateFundus,
} from "@/lib/mockAI";
import { runRealInference } from "@/lib/drModel";
import { saveScreening } from "@/lib/store";
import type { Prediction } from "@/lib/types";

const STEPS = [
  "Preprocessing image…",
  "Running AI analysis…",
  "Detecting patterns…",
  "Generating heatmap…",
];

export default function ScreeningPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const loadFile = useCallback((file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG / PNG).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Image is too large. Please use an image under 12 MB.");
      return;
    }
    if (inputRef.current) inputRef.current.value = "";
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const analyze = useCallback(() => {
    if (!preview) return;
    setAnalyzing(true);
    setStepIdx(0);
    setError(null);

    const runPipeline = (img: HTMLImageElement) => {
      const check = validateFundus(img);
      if (!check.ok) {
        setError(check.reason || "This does not appear to be a retinal fundus image. Please upload a clear eye/retina photograph.");
        setAnalyzing(false);
        return;
      }
      // Progress ticker driven by real async stages
      let i = 0;
      const advance = () => {
        i += 1;
        if (i < STEPS.length) setStepIdx(i);
      };
      const ticker = window.setInterval(advance, 1600);

      (async () => {
        try {
          const features = extractFeatures(img);
          advance(); // model load step

          let prediction: Prediction;
          let engine: "cnn" | "heuristic" = "heuristic";
          try {
            prediction = await runRealInference(img);
            engine = "cnn";
          } catch {
            prediction = predictFromFeatures(features);
          }
          advance(); // inference done
          const heatmap = generateHeatmap(img, features, prediction.grade);
          const recId = `RDA-${Date.now().toString().slice(-6)}`;
          saveScreening({
            id: recId,
            patientName: "",
            patientId: "",
            date: new Date().toISOString(),
            grade: prediction.grade,
            label: prediction.label,
            confidence: prediction.confidence,
            risk: prediction.risk,
            diabetes: prediction.diabetes,
            diabetesMsg: prediction.diabetesMsg,
            explanation: prediction.explanation,
            findings: prediction.findings,
            imageDataUrl: shrinkImage(img, 400),
            heatmapDataUrl: heatmap,
            probabilities: prediction.probabilities,
            engine,
          });
          window.clearInterval(ticker);
          window.location.href = `/results?id=${recId}`;
        } catch {
          window.clearInterval(ticker);
          setError("Analysis failed. Please try again with another image.");
          setAnalyzing(false);
        }
      })();
    };

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      runPipeline(img);
    };
    img.onerror = () => {
      setError("Could not read this image. Please try another file.");
      setAnalyzing(false);
    };
  }, [preview, router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">Retinal Screening</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Upload a Fundus Image</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Drag &amp; drop a retinal photograph to begin — or try the built-in
          demo case. Analysis runs entirely in your browser.
        </p>
      </div>

      {!analyzing && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`mt-10 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition sm:p-14 ${
            dragging
              ? "border-teal-400 bg-teal-50"
              : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => loadFile(e.target.files?.[0])}
          />
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-200">
            <UploadCloud className="h-8 w-8" />
          </span>
          <p className="mt-5 font-semibold text-slate-800">
            Drop retinal image here, or click to browse
          </p>
          <p className="mt-1.5 text-sm text-slate-400">JPG, PNG or WEBM · up to 12 MB</p>
        </div>
      )}

      {error && (
        <p className="mt-4 flex items-start justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {preview && !analyzing && (
        <div className="animate-fade-up mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded retinal scan preview"
              className="h-56 w-56 rounded-2xl border border-slate-100 object-cover shadow-sm"
            />
            <div className="flex-1 space-y-3 text-left">
              <p className="flex items-center gap-2 text-sm font-medium text-teal-700">
                <ImagePlus className="h-4 w-4" /> Image ready for analysis
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                Make sure the image is a clear fundus photograph showing the
                retina, optic disc and macula region.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => analyze()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-5 py-3 font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:opacity-95"
                >
                  <ScanEye className="h-4.5 w-4.5" /> Analyze Image
                </button>
                <button
                  onClick={() => { setPreview(null); setError(null); }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                >
                  <RefreshCcw className="h-4 w-4" /> Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!preview && !analyzing && (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">Upload an image above to begin</p>
        </div>
      )}

      {analyzing && (
        <div className="animate-fade-up mt-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-md sm:p-12">
          <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full border-4 border-slate-100 shadow-inner sm:h-72 sm:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview ?? ""} alt="Scanning" className="h-full w-full scale-110 object-cover opacity-80" />
            <div className="absolute left-0 h-0.5 w-full animate-scan-line bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_18px_4px_rgba(45,212,191,0.7)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-900/30 via-transparent to-transparent" />
          </div>
          <div className="mx-auto mt-8 max-w-sm">
            <p className="flex items-center justify-center gap-2 font-semibold text-slate-800">
              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
              {STEPS[stepIdx]}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-700"
                style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <ol className="mt-5 space-y-2 text-left">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-2.5 text-xs ${i <= stepIdx ? "text-slate-700" : "text-slate-300"}`}>
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${i < stepIdx ? "bg-teal-500 text-white" : i === stepIdx ? "bg-sky-100 text-sky-700" : "bg-slate-100"}`}>
                    {i + 1}
                  </span>
                  {s.replace("…", "")}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
