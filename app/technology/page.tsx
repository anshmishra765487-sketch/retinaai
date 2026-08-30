import {
  Boxes,
  BrainCircuit,
  Camera,
  Code2,
  Cpu,
  FileCode2,
  Flame,
  Layers3,
  Palette,
  ServerCog,
} from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const pipeline = [
  { icon: Camera, title: "Fundus Image Processing", text: "Input images are resized, contrast-enhanced (CLAHE) and normalized to standardize lighting across cameras before inference." },
  { icon: Cpu, title: "Deep Learning / CNN", text: "A convolutional neural network (ResNet / EfficientNet family) extracts visual features and classifies the image into five DR stages." },
  { icon: BrainCircuit, title: "Explainable AI", text: "Grad-CAM produces a heatmap from the final convolutional layer, revealing which retinal regions influenced the prediction." },
  { icon: ServerCog, title: "FastAPI Backend", text: "A Python FastAPI service exposes POST /predict for real model inference — the React frontend is already wired to swap the mock engine." },
];

const stack = [
  { name: "Computer Vision", detail: "Retinal image preprocessing, vessel & lesion feature extraction", icon: EyeIcon },
  { name: "Deep Learning (CNN)", detail: "Five-class DR grading trained on fundus datasets", icon: Layers3 },
  { name: "Explainable AI", detail: "Grad-CAM attention heatmaps for transparent decisions", icon: BrainCircuit },
  { name: "Python + FastAPI", detail: "Production-ready REST backend architecture", icon: FileCode2 },
  { name: "React 19", detail: "Component-driven interactive UI with Next.js App Router", icon: Code2 },
  { name: "Tailwind CSS v4", detail: "Utility-first responsive design system", icon: Palette },
];

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function TechnologyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">Under the Hood</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Technology Behind RetinaAI</h1>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-slate-500">
          A modern full-stack architecture combining computer vision, deep
          learning and explainability with a production-grade web platform.
        </p>
      </header>

      {/* Pipeline */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Boxes className="h-5 w-5 text-sky-600" /> Inference Pipeline
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pipeline.map((p, i) => (
            <div key={p.title} className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="absolute -top-2.5 right-5 rounded-full bg-gradient-to-r from-sky-600 to-teal-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-teal-50">
                <p.icon className="h-5.5 w-5.5 text-teal-600" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack grid */}
      <section className="mt-12 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Flame className="h-5 w-5 text-orange-500" /> Tech Stack
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((s) => (
            <div key={s.name} className="rounded-2xl bg-gradient-to-b from-slate-50 to-white p-5 ring-1 ring-slate-100 transition hover:ring-sky-200">
              <s.icon className="h-6 w-6 text-sky-600" />
              <p className="mt-3 font-bold text-slate-800">{s.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API contract */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-teal-400" />
          <span className="ml-2 text-xs font-medium text-slate-400">backend/api.py — drop-in FastAPI service</span>
        </div>
        <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-teal-100">
{`from fastapi import FastAPI, UploadFile

app = FastAPI(title="RetinaAI Inference API")

@app.post("/predict")
async def predict(image: UploadFile):
    """Run CNN inference + Grad-CAM on a fundus image."""
    # img = preprocess(await image.read())
    # grade, probs, heatmap = model.explain(img)
    return {
        "grade": 2,                # 0..4
        "label": "Moderate",
        "confidence": 91.4,
        "heatmap": "<base64 png>",
    }`}
        </pre>
      </section>

      <div className="mt-8">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}
