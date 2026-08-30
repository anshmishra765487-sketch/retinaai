import Link from "next/link";
import { Activity, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                <Activity className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-slate-900">
                Retina<span className="text-sky-600">AI</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Explainable diabetic retinopathy screening — helping make
              eye-care more accessible through AI-assisted retinal image
              analysis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-2 text-sm sm:grid-cols-3">
            <div className="col-span-1 space-y-2 sm:col-span-3 md:col-span-1">
              <p className="font-semibold text-slate-900">Product</p>
              <Link href="/screening" className="block text-slate-500 hover:text-sky-600">Screening</Link>
              <Link href="/dashboard" className="block text-slate-500 hover:text-sky-600">Dashboard</Link>
              <Link href="/results" className="block text-slate-500 hover:text-sky-600">Results</Link>
            </div>
            <div className="space-y-2 sm:col-span-3 md:col-span-1">
              <p className="font-semibold text-slate-900">Learn</p>
              <Link href="/education" className="block text-slate-500 hover:text-sky-600">Education</Link>
              <Link href="/technology" className="block text-slate-500 hover:text-sky-600">Technology</Link>
            </div>
            <div className="space-y-2 sm:col-span-3 md:col-span-1">
              <p className="font-semibold text-slate-900">Project</p>
              <span className="block text-slate-400">College Hackathon Demo</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Code2 className="h-3.5 w-3.5" /> Open Source
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-relaxed text-slate-400">
          © {new Date().getFullYear()} RetinaAI · For screening and educational
          purposes only. It does not replace examination or diagnosis by a
          qualified healthcare professional.
        </div>
      </div>
    </footer>
  );
}
