import {
  AlertTriangle,
  BookOpenCheck,
  Eye,
  Glasses,
  HeartPulse,
  Microscope,
  Stethoscope,
} from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const symptoms = [
  "Blurred or fluctuating vision",
  "Dark or empty areas in vision",
  "Floaters — spots or strings drifting in view",
  "Poor night vision",
  "Colors appearing faded",
  "Sudden vision loss (emergency)",
];

const riskFactors = [
  "Living with diabetes for many years",
  "Uncontrolled blood sugar levels",
  "High blood pressure",
  "High cholesterol",
  "Pregnancy in diabetic patients",
  "Smoking and obesity",
];

export default function EducationPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-xs font-bold tracking-widest text-teal-600 uppercase">Patient Education</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Understanding Diabetic Retinopathy
        </h1>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-slate-500">
          Simple, factual information about one of the leading causes of
          preventable blindness in working-age adults.
        </p>
      </header>

      {/* What is DR */}
      <section className="mt-12 grid items-center gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
            <Microscope className="h-6 w-6 text-sky-600" /> What is Diabetic Retinopathy?
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Diabetic retinopathy (DR) is an eye condition caused by{" "}
            <strong>high blood sugar damaging the tiny blood vessels</strong>{" "}
            in the retina — the light-sensitive tissue at the back of the eye.
            Damaged vessels can leak fluid, swell, or close off entirely. In
            later stages, new fragile blood vessels grow abnormally, which can
            bleed and pull on the retina.
          </p>
          <p className="mt-3 leading-relaxed text-slate-600">
            It develops in stages: <strong>Mild → Moderate → Severe →
            Proliferative</strong>. Early stages often have{" "}
            <strong>no symptoms at all</strong>, which is why regular screening
            matters so much.
          </p>
        </div>
        <div className="mx-auto flex h-40 w-40 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br from-orange-900 via-amber-800 to-stone-900 text-center shadow-lg">
          <Eye className="h-9 w-9 text-white/85" />
          <span className="mt-2 px-6 text-[11px] font-semibold tracking-wide text-white/80 uppercase">Retina Fundus View</span>
        </div>
      </section>

      {/* Symptoms & Risk factors */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <InfoCard title="Common Symptoms" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} items={symptoms} note="Often none until late stages — screening detects what eyes cannot feel yet." />
        <InfoCard title="Who Is At Risk?" icon={<HeartPulse className="h-5 w-5 text-red-400" />} items={riskFactors} note="Anyone with diabetes should get a dilated eye exam at least once a year." />
      </section>

      {/* Why early screening */}
      <section className="mt-8 rounded-3xl bg-gradient-to-br from-sky-700 via-sky-600 to-teal-600 p-8 text-white shadow-md sm:p-10">
        <h2 className="flex items-center gap-2.5 text-2xl font-bold">
          <Stethoscope className="h-6 w-6 text-teal-200" /> Why Early Screening Matters
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ["90%", "of severe vision loss from diabetes can be prevented with timely treatment"],
            ["1 in 3", "people with diabetes develop some degree of retinopathy"],
            ["Yearly", "dilated eye exams catch changes years before symptoms appear"],
          ].map(([big, small]) => (
            <div key={big} className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-3xl font-extrabold">{big}</p>
              <p className="mt-2 text-sm leading-relaxed text-sky-100">{small}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-xl bg-white/15 px-4 py-3 text-sm leading-relaxed text-sky-50">
          Treatments like laser therapy, injections and surgery work best when
          started early. Screening is the first step that makes early
          treatment possible.
        </p>
      </section>

      {/* AI helps doctors */}
      <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
        <h2 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
          <Glasses className="h-6 w-6 text-teal-600" /> How AI Helps Doctors
        </h2>
        <div className="mt-6 space-y-4">
          {[
            ["Faster triage", "AI grades hundreds of images in minutes so specialists can focus on urgent cases first."],
            ["Consistent second opinion", "The model never gets tired — it applies the same criteria to every single image."],
            ["Reach where doctors are scarce", "Screening camps in remote areas can get expert-level grading without an on-site ophthalmologist."],
            ["Explainable decisions", "Heatmaps show which retinal regions drove the prediction, keeping the doctor in control of the final call."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
              <div>
                <p className="font-bold text-slate-800">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm italic text-slate-400">
          Remember: AI supports screening — the diagnosis and treatment plan
          always come from a qualified eye-care professional.
        </p>
      </section>

      <div className="mt-8">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  items,
  note,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
      <h3 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
        {icon} {title}
      </h3>
      <ul className="mt-4 grid gap-2.5">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            {i}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl bg-sky-50 px-3.5 py-2.5 text-xs leading-relaxed text-sky-800">{note}</p>
    </div>
  );
}
