import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Eye,
  FileText,
  HeartPulse,
  Layers,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  Zap,
} from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const steps = [
  {
    icon: Upload,
    title: "1. Upload Retinal Image",
    text: "Drag & drop a fundus photograph of the retina, or try the built-in demo case.",
  },
  {
    icon: ScanEye,
    title: "2. AI Analyzes",
    text: "A deep CNN examines vessels, hemorrhages and exudates across five DR stages.",
  },
  {
    icon: BrainCircuit,
    title: "3. Explainable Result",
    text: "A Grad-CAM style heatmap shows exactly which regions influenced the prediction.",
  },
  {
    icon: FileText,
    title: "4. Get Report",
    text: "Download or print a structured screening report with risk level and guidance.",
  },
];

const features = [
  { icon: BrainCircuit, title: "Explainable AI", text: "Heatmap visualizations make the model's decision transparent instead of a black box." },
  { icon: Zap, title: "Instant Analysis", text: "Screening completes in seconds — designed for busy eye camps and clinics." },
  { icon: Layers, title: "5-Stage Grading", text: "Classifies No DR, Mild, Moderate, Severe and Proliferative stages following clinical scales." },
  { icon: ShieldCheck, title: "Privacy First", text: "Images are processed in your browser during this demo and never leave your device." },
  { icon: FileText, title: "Printable Reports", text: "Structured patient reports with confidence scores ready to share with specialists." },
  { icon: HeartPulse, title: "Trend Dashboard", text: "Track screenings over time with charts for low, moderate and high-risk cases." },
];

const benefits = [
  "Detects early signs before vision loss symptoms appear",
  "Brings affordable screening to remote and rural camps",
  "Helps doctors prioritize urgent cases faster",
  "Reduces manual grading workload for ophthalmologists",
  "Builds trust through explainable visual evidence",
  "Educates patients about diabetic eye health",
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -right-32 h-96 w-96 rounded-full bg-teal-100 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700">
              <Sparkles className="h-3.5 w-3.5" /> Explainable AI · Healthcare
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              AI-Powered Diabetic{" "}
              <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">
                Retinopathy Screening
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              RetinaAI analyzes retinal fundus images using deep learning and
              provides an easy-to-understand risk assessment — complete with a
              visual explanation of what the AI looked at.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/screening"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Start Screening <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/education"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                Learn About DR
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-teal-500" /> No image leaves your device</span>
              <span className="flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-teal-500" /> Doctor-in-the-loop design</span>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-md animate-float-slow lg:block">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-sky-500 via-teal-400 to-cyan-300 opacity-10 blur-xl" />
            <div className="relative flex h-full flex-col items-center justify-center rounded-[2rem] border border-slate-100 bg-white/70 shadow-xl backdrop-blur">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/40 animate-pulse-ring" />
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-orange-900 via-amber-800 to-stone-900 shadow-inner">
                  <div className="absolute left-9 top-16 h-11 w-11 rounded-full bg-amber-200/90 blur-[1px]" />
                  <div className="absolute right-12 bottom-14 h-8 w-8 rounded-full bg-yellow-950/80" />
                  <Eye className="h-12 w-12 text-white/85" />
                </div>
              </div>
              <p className="mt-6 text-sm font-semibold tracking-wide text-slate-700 uppercase">Fundus Analysis</p>
              <div className="mt-3 flex gap-2">
                {["No DR", "Mild", "Moderate"].map((t) => (
                  <span key={t} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{t}</span>
                ))}
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">+ Heatmap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="How It Works"
            title="From image to insight in four steps"
            subtitle="A simple workflow anyone can follow — no medical expertise needed to operate the tool."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-600 to-teal-500 px-3 py-0.5 text-xs font-bold text-white">
                  Step {i + 1}
                </span>
                <s.icon className="h-8 w-8 text-sky-600" />
                <h3 className="mt-4 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Features"
            title="Everything a modern screening camp needs"
            subtitle="Purpose-built tools that keep patients, technicians and doctors on the same page."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-100 p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-teal-50">
                  <f.icon className="h-5.5 w-5.5 text-teal-600" />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle
              align="left"
              eyebrow="Benefits"
              title="Why early screening matters"
              subtitle="Diabetic retinopathy often has no symptoms until vision is already damaged. Early detection changes outcomes."
            />
          </div>
          <ul className="grid gap-3.5 sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About technology CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-teal-600 py-20 text-white">
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <BrainCircuit className="mx-auto h-12 w-12 text-teal-200" />
          <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">About the Technology</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-sky-100">
            Convolutional Neural Networks trained on retinal fundus datasets,
            combined with Grad-CAM based explainability, running on a modern
            web stack with a Python/FastAPI-ready backend architecture.
          </p>
          <Link
            href="/technology"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-sky-700 shadow-lg transition hover:-translate-y-0.5"
          >
            Explore the Stack <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Bottom disclaimer */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <DisclaimerBanner compact />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 leading-relaxed text-slate-500">{subtitle}</p>
    </div>
  );
}
