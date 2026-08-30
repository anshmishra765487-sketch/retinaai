import type { DRGrade, ScreeningRecord } from "./types";
import { DIABETES_BY_GRADE, DIABETES_MSG, DR_LABELS } from "./types";

const KEY = "retinaai:history";
const PREFIX = "retinaai:result:";

export function getHistory(): ScreeningRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedDemo();
    const parsed = JSON.parse(raw) as ScreeningRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScreening(record: ScreeningRecord): void {
  try {
    sessionStorage.setItem(PREFIX + record.id, JSON.stringify(record));
  } catch {
    // ignore
  }
  try {
    const history = getHistory();
    history.unshift(record);
    window.localStorage.setItem(KEY, JSON.stringify(history.slice(0, 30)));
  } catch {
    try {
      window.localStorage.clear();
      window.localStorage.setItem(KEY, JSON.stringify([record]));
    } catch {
      // no storage
    }
  }
}

export function getResult(id: string): ScreeningRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as ScreeningRecord) : null;
  } catch {
    return null;
  }
}

export function clearHistory(): void {
  window.localStorage.removeItem(KEY);
}

function makeId(i: number): string {
  return `RDA-${String(1000 + i).slice(-4)}${String.fromCharCode(65 + (i % 26))}`;
}

function seedDemo(): ScreeningRecord[] {
  const grades: [DRGrade, string, number][] = [
    [0, "Demo Patient", 96.2],
    [1, "R. Sharma", 88.4],
    [2, "A. Verma", 91.7],
    [0, "Demo Patient", 95.1],
    [3, "S. Patel", 89.3],
    [1, "M. Khan", 84.9],
    [4, "K. Reddy", 93.6],
    [0, "Demo Patient", 97.0],
    [2, "P. Gupta", 90.2],
    [1, "Demo Patient", 86.5],
    [0, "D. Joshi", 94.8],
    [2, "V. Iyer", 87.9],
  ];

  const records: ScreeningRecord[] = grades.map(([grade, name, conf], i) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(i * 1.3));
    d.setHours(9 + (i % 8), (i * 13) % 60, 0, 0);
    return {
      id: makeId(i + 1),
      patientName: name,
      patientId: `PID-${String(2400 + i * 7)}`,
      date: d.toISOString(),
      grade,
      label: DR_LABELS[grade],
      confidence: conf,
      risk: grade >= 3 ? "High" : grade === 2 ? "Moderate" : "Low",
      diabetes: DIABETES_BY_GRADE[grade],
      diabetesMsg: DIABETES_MSG[grade],
      explanation:
        "Demo record generated with realistic sample data for dashboard preview.",
      findings: ["Sample demo finding A", "Sample demo finding B"],
      imageDataUrl: "",
      heatmapDataUrl: "",
      probabilities: [],
    };
  });

  try {
    window.localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
  return records;
}
