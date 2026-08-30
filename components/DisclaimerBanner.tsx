import { Info } from "lucide-react";

export default function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 print:border-amber-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        This tool is for screening and educational purposes only. It does not
        replace examination or diagnosis by a qualified healthcare
        professional.
      </p>
    );
  }
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 print:hidden">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs font-medium text-amber-800 sm:text-sm">
        <Info className="h-4 w-4 shrink-0" />
        Screening &amp; educational tool only — not a substitute for
        examination or diagnosis by a qualified healthcare professional.
      </p>
    </div>
  );
}
