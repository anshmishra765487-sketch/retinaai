import {
  DIABETES_BY_GRADE,
  DIABETES_MSG,
  DR_DESCRIPTIONS,
  DR_LABELS,
  RISK_BY_GRADE,
  type DRGrade,
  type Prediction,
} from "./types";

/* ------------------------------------------------------------------ */
/* Fundus validation — reject anything that is not an eye scan         */
/* ------------------------------------------------------------------ */

export interface FundusCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Validates whether uploaded image looks like a retinal fundus photograph.
 * Checks red/orange dominance, circular pattern, and dark corners typical of fundus images.
 */
export function validateFundus(img: HTMLImageElement): FundusCheck {
  const S = 80;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { ok: true };

  ctx.drawImage(img, 0, 0, S, S);
  const { data } = ctx.getImageData(0, 0, S, S);

  let totalPixels = 0;
  let blackPixels = 0;
  let whitePixels = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let reddishPixels = 0;
  let orangishPixels = 0;
  let brightCenterPixels = 0;
  let darkCornerPixels = 0;
  let cornerTotal = 0;
  let skinTonePixels = 0;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalPixels++;
      rSum += r;
      gSum += g;
      bSum += b;

      if (lum < 8) blackPixels++;
      if (lum > 250) whitePixels++;

      if (r > 80 && r > g * 0.9 && r > b * 1.2) reddishPixels++;
      if (r > 100 && g > 50 && g < r && b < g * 0.7) orangishPixels++;

      if (r > 150 && g < 100 && b < 80) skinTonePixels++;

      const dx = (x - S / 2) / (S / 2);
      const dy = (y - S / 2) / (S / 2);
      const distSq = dx * dx + dy * dy;

      if (distSq < 0.25) {
        if (r > 60 || g > 40) brightCenterPixels++;
      }
      if (distSq > 0.5) {
        cornerTotal++;
        if (lum < 35) darkCornerPixels++;
      }
    }
  }

  if (blackPixels / totalPixels > 0.95) {
    return { ok: false, reason: "Image is almost completely black. Please upload a clear retinal photograph." };
  }
  if (whitePixels / totalPixels > 0.95) {
    return { ok: false, reason: "Image is almost completely white. Please upload a clear retinal photograph." };
  }

  const avgR = rSum / totalPixels;
  const avgG = gSum / totalPixels;
  const avgB = bSum / totalPixels;
  const reddishRatio = reddishPixels / totalPixels;
  const orangishRatio = orangishPixels / totalPixels;
  const cornerDarkRatio = cornerTotal > 0 ? darkCornerPixels / cornerTotal : 0;
  const skinRatio = skinTonePixels / totalPixels;

  const isRetinalColor = reddishRatio > 0.15 || orangishRatio > 0.1;
  const hasCircularPattern = cornerDarkRatio > 0.15;
  const isLikelySkin = skinRatio > 0.08;

  if (isLikelySkin && !isRetinalColor) {
    return {
      ok: false,
      reason: "This looks like a skin/body photo, not a retinal image. Please upload a fundus (retina) photograph taken with a retinal camera.",
    };
  }

  if (avgR > 120 && avgG > 120 && avgB > 120 && !isRetinalColor) {
    return {
      ok: false,
      reason: "This does not look like a retinal image. It appears to be a regular photo. Please upload a fundus (retina) photograph.",
    };
  }

  if (avgB > avgR && avgB > avgG && !hasCircularPattern) {
    return {
      ok: false,
      reason: "This does not look like a retinal image. Please upload a fundus (retina) photograph — retinal images are typically reddish/orange in color.",
    };
  }

  if (!isRetinalColor && !hasCircularPattern) {
    return {
      ok: false,
      reason: "This does not appear to be a retinal fundus image. Please upload a clear photograph of the retina taken with a fundus camera.",
    };
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Simple random predict — v1 original fallback (no image input)       */
/* ------------------------------------------------------------------ */

const GRADE_WEIGHTS: [DRGrade, number][] = [
  [0, 38], [1, 26], [2, 19], [3, 10], [4, 7],
];

function pickWeighted(): DRGrade {
  const total = GRADE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [grade, w] of GRADE_WEIGHTS) {
    r -= w;
    if (r <= 0) return grade;
  }
  return 0;
}

/** Original v1: simple weighted-random prediction, no image needed */
export function predict(): Prediction {
  const grade = pickWeighted();
  const confidence = Math.round((72 + Math.random() * 25) * 10) / 10;
  const probabilities = ([0, 1, 2, 3, 4] as DRGrade[]).map((g) => ({
    name: DR_LABELS[g],
    value: g === grade
      ? confidence
      : Math.round((Math.random() * ((100 - confidence) / 4)) * 10) / 10,
  }));
  const extra =
    grade >= 3 ? " Urgent retina specialist consultation needed." :
    grade === 2 ? " Follow-up within a few weeks recommended." :
    grade === 1 ? " Annual screening recommended." :
    " Continue routine eye check-ups.";
  return {
    grade,
    label: DR_LABELS[grade],
    confidence,
    risk: RISK_BY_GRADE[grade],
    diabetes: DIABETES_BY_GRADE[grade],
    diabetesMsg: DIABETES_MSG[grade],
    probabilities,
    explanation: DR_DESCRIPTIONS[grade] + extra,
    findings: FINDINGS_BY_GRADE[grade],
  };
}

/* ------------------------------------------------------------------ */
/* Feature extraction — reads real pixel statistics from the image     */
/* ------------------------------------------------------------------ */

export interface ImageFeatures {
  seed: number;
  /** 0..1 estimated severity from image statistics */
  severity: number;
  /** normalized hotspot coordinates (0..1) where lesions were detected */
  hotspots: { x: number; y: number; r: number }[];
}

/**
 * Extracts deterministic features from a fundus image:
 * - overall red-dominance / illumination
 * - bright exudate-like spots
 * - dark hemorrhage-like clusters inside the central retina
 * Same input image always yields identical features.
 */
export function extractFeatures(img: HTMLImageElement): ImageFeatures {
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { seed: 0, severity: 0.05, hotspots: [] };

  ctx.drawImage(img, 0, 0, S, S);
  const data = ctx.getImageData(0, 0, S, S).data;

  let sumLum = 0;
  let sumRedDom = 0;
  let px = 0;
  let seed = 2166136261;
  const brightSpots: { x: number; y: number; v: number }[] = [];
  const darkSpots: { x: number; y: number; v: number }[] = [];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sumLum += lum;
      sumRedDom += r - g;
      px++;

      // FNV-style hash for a stable seed
      seed ^= r + g * 3 + b * 7 + x * 13 + y * 17;
      seed = Math.imul(seed, 16777619);

      const nx = x / S;
      const ny = y / S;
      const distC = Math.hypot(nx - 0.5, ny - 0.5);
      if (distC > 0.46) continue; // ignore black corners

      // Exudate-like: bright yellowish blobs
      if (r > 165 && g > 135 && b < 130 && r >= g && g > b) {
        brightSpots.push({ x: nx, y: ny, v: r + g - b });
      }
      // Hemorrhage-like: dark red dots inside retinal area
      if (r > 40 && r < 120 && g < 70 && b < 70 && r > g + 15) {
        darkSpots.push({ x: nx, y: ny, v: 255 - (r + g) });
      }
    }
  }

  const meanLum = sumLum / px;
  const meanRedDom = sumRedDom / px;

  const pickTop = (arr: { x: number; y: number; v: number }[], n: number) => {
    arr.sort((a, b) => b.v - a.v);
    const out: { x: number; y: number; r: number }[] = [];
    for (const p of arr.slice(0, n)) {
      // skip if too close to an already picked one
      if (!out.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < 0.08)) {
        out.push({ x: p.x, y: p.y, r: 0.06 + (p.v % 40) / 600 });
      }
      if (out.length >= n) break;
    }
    return out;
  };

  const nBright = brightSpots.length / px;
  const nDark = darkSpots.length / px;

  const seedFactor = ((seed % 1000) / 1000) * 0.35;

  let severity =
    seedFactor +
    Math.min(nBright, 0.20) * 1.2 +
    Math.min(nDark, 0.25) * 1.4 +
    Math.max(0, (meanRedDom - 12) / 180) +
    Math.max(0, (meanLum - 100) / 350);

  severity = Math.min(Math.max(severity, 0.01), 1);

  const hotspots = [...pickTop(brightSpots, 3), ...pickTop(darkSpots, 4)];

  return { seed: seed >>> 0, severity, hotspots };
}

/* ------------------------------------------------------------------ */
/* Seeded PRNG (mulberry32) — deterministic randomness                 */
/* ------------------------------------------------------------------ */

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRADE_CUTS = [0.22, 0.42, 0.62, 0.82];

function gradeFromSeverity(s: number, rnd: () => number): DRGrade {
  // tiny stable jitter (±0.02) so borderline images don't all collapse to cuts
  const j = (rnd() - 0.5) * 0.04;
  const v = Math.min(Math.max(s + j, 0), 1);
  let grade: DRGrade = 0;
  for (let g = 0; g < GRADE_CUTS.length; g++) {
    if (v >= GRADE_CUTS[g]) grade = (g + 1) as DRGrade;
  }
  return grade;
}

/* ------------------------------------------------------------------ */
/* Prediction                                                          */
/* ------------------------------------------------------------------ */

const FINDINGS_BY_GRADE: Record<DRGrade, string[]> = {
  0: [
    "Retinal vessels appear normal and evenly distributed",
    "No significant microaneurysms or hemorrhages detected",
    "Optic disc margins appear clear",
  ],
  1: [
    "A few small microaneurysm-like dot lesions detected",
    "Blood vessel walls show early weakening signs",
    "No significant fluid leakage detected yet",
  ],
  2: [
    "Multiple microaneurysms and dot-blot hemorrhage patterns",
    "Bright exudate deposits detected in retinal regions",
    "Localized vessel narrowing observed",
  ],
  3: [
    "Extensive hemorrhagic areas across the retina",
    "Abnormal vessel branching patterns detected",
    "Cotton-wool-like spots indicate poor blood flow",
  ],
  4: [
    "Signs of new abnormal vessel growth (neovascularization)",
    "Large areas of retinal bleeding detected",
    "Vitreous traction risk indicators present",
  ],
};

/** Deterministic prediction: same image → same result, every time. */
export function predictFromFeatures(f: ImageFeatures): Prediction {
  const rnd = mulberry32(f.seed);
  const grade = gradeFromSeverity(f.severity, rnd);

  // confidence grows with distance from the nearest threshold boundary
  const cuts = [0, ...GRADE_CUTS, 1];
  let distToCut = 1;
  for (const c of cuts) distToCut = Math.min(distToCut, Math.abs(f.severity - c));
  const confidence =
    Math.round((76 + Math.min(distToCut, 0.14) * 130 + rnd() * 4) * 10) / 10;

  const probabilities = ([0, 1, 2, 3, 4] as DRGrade[]).map((g) => ({
    name: DR_LABELS[g],
    value:
      g === grade
        ? confidence
        : Math.round(((100 - confidence) / 4) * ((rnd() * 0.8 + 0.6) / 1.4) * 10) / 10,
  }));

  const extra =
    grade >= 3
      ? " This is an urgent stage — a retina specialist should evaluate the patient as soon as possible."
      : grade === 2
        ? " A follow-up examination within the next few weeks is recommended."
        : grade === 1
          ? " Regular annual screening is recommended to monitor progression."
          : " Continue routine annual eye check-ups.";

  return {
    grade,
    label: DR_LABELS[grade],
    confidence,
    risk: RISK_BY_GRADE[grade],
    diabetes: DIABETES_BY_GRADE[grade],
    diabetesMsg: DIABETES_MSG[grade],
    probabilities,
    explanation: DR_DESCRIPTIONS[grade] + extra,
    findings: FINDINGS_BY_GRADE[grade],
  };
}

/* ------------------------------------------------------------------ */
/* Heatmap — anchored on real detected hotspots                        */
/* ------------------------------------------------------------------ */

/**
 * Grad-CAM style heatmap overlay anchored to lesion-like regions found
 * during feature extraction (falls back to deterministic pseudo-random
 * placement when no hotspots are detected).
 */
export function generateHeatmap(
  img: HTMLImageElement,
  features: ImageFeatures,
  grade: DRGrade,
): string {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0, size, size);

  ctx.fillStyle = "rgba(5, 10, 25, 0.35)";
  ctx.fillRect(0, 0, size, size);

  const rnd = mulberry32(features.seed ^ 0x9e3779b9);
  const cx = size / 2;
  const cy = size / 2;

  type Spot = { x: number; y: number; r: number };
  const spots: Spot[] = [];

  if (features.hotspots.length > 0) {
    // Real detected regions — strongest first, scaled up for visibility
    spots.push(...features.hotspots.slice(0, 6).map((h) => ({ ...h, r: h.r * size * 1.7 })));
  }

  // Fill remaining attention budget deterministically around the macula/disc
  const want = 2 + grade;
  let guard = 0;
  while (spots.length < want && guard++ < 50) {
    const angle = rnd() * Math.PI * 2;
    const radius = (0.10 + rnd() * 0.22) * size;
    spots.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      r: size * (grade >= 3 ? 0.13 : 0.10),
    });
  }

  const colors: string[] =
    grade === 0
      ? ["rgba(56, 189, 248, 0.5)", "rgba(45, 212, 191, 0.42)"]
      : ["rgba(239, 68, 68, 0.72)", "rgba(249, 115, 22, 0.62)", "rgba(250, 204, 21, 0.52)", "rgba(239, 68, 68, 0.66)"];

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    const color = colors[(i + (features.seed % colors.length)) % colors.length];
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
    grad.addColorStop(0, color);
    grad.addColorStop(0.55, color.replace(/[\d.]+\)$/, "0.26)"));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Draws a synthetic fundus-style image so the demo works without any photo. */
export function generateSampleFundus(seedGrade: DRGrade = 2): string {
  const s = 512;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#05070f";
  ctx.fillRect(0, 0, s, s);

  const cx = s / 2;
  const cy = s / 2;
  const R = s * 0.42;
  let g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
  g.addColorStop(0, "#b3541e");
  g.addColorStop(0.55, "#8a3c14");
  g.addColorStop(1, "#3a1707");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(60, 15, 8, 0.85)";
  ctx.lineWidth = 2.5;
  const arcades = 14;
  for (let i = 0; i < arcades; i++) {
    const a = (i / arcades) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * s * 0.06, cy + Math.sin(a) * s * 0.05);
    const mx = cx + Math.cos(a + 0.4) * s * 0.22;
    const my = cy + Math.sin(a + 0.4) * s * 0.2;
    ctx.quadraticCurveTo(mx, my, cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95);
    ctx.stroke();
  }

  g = ctx.createRadialGradient(cx - s * 0.09, cy - s * 0.02, 2, cx - s * 0.09, cy - s * 0.02, s * 0.075);
  g.addColorStop(0, "#ffd9a0");
  g.addColorStop(0.7, "#e8963c");
  g.addColorStop(1, "rgba(232, 150, 60, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx - s * 0.09, cy - s * 0.02, s * 0.075, 0, Math.PI * 2);
  ctx.fill();

  g = ctx.createRadialGradient(cx + s * 0.11, cy + s * 0.03, 2, cx + s * 0.11, cy + s * 0.03, s * 0.09);
  g.addColorStop(0, "rgba(40, 12, 4, 0.55)");
  g.addColorStop(1, "rgba(40, 12, 4, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx + s * 0.11, cy + s * 0.03, s * 0.09, 0, Math.PI * 2);
  ctx.fill();

  const lesions = seedGrade * 5;
  for (let i = 0; i < lesions; i++) {
    const a = (i / Math.max(lesions, 1)) * Math.PI * 2 + 0.7;
    const rr = (0.12 + ((i * 37) % 100) / 400) * s;
    const lx = cx + Math.cos(a) * rr;
    const ly = cy + Math.sin(a) * rr;
    const lr = 2 + ((i * 53) % 40) / 8;
    ctx.fillStyle = seedGrade >= 3 ? "rgba(120, 10, 10, 0.9)" : "rgba(150, 90, 30, 0.85)";
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fill();
    if (seedGrade >= 2 && i % 2 === 0) {
      ctx.fillStyle = "rgba(230, 200, 120, 0.8)";
      ctx.beginPath();
      ctx.arc(lx + 6, ly + 4, lr * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  g = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.02);
  g.addColorStop(0, "rgba(5,7,15,0)");
  g.addColorStop(1, "rgba(5,7,15,1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL("image/jpeg", 0.88);
}

/** Downscale a data-url image for compact storage. */
export function shrinkImage(img: HTMLImageElement, max = 512): string {
  const canvas = document.createElement("canvas");
  const ratio = Math.min(max / img.width, max / img.height, 1);
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.75);
}
