export type DRGrade = 0 | 1 | 2 | 3 | 4;

export type RiskLevel = "Low" | "Moderate" | "High";

export type DiabetesStatus = "Unlikely" | "Possible" | "Likely" | "Highly Likely";

export const DR_LABELS: Record<DRGrade, string> = {
  0: "No DR",
  1: "Mild",
  2: "Moderate",
  3: "Severe",
  4: "Proliferative DR",
};

export const DR_DESCRIPTIONS: Record<DRGrade, string> = {
  0: "No visible signs of diabetic retinopathy were detected in this image.",
  1: "A few small microaneurysms detected. Earliest stage of diabetic retinopathy.",
  2: "More damaged blood vessels and some bleeding spots detected.",
  3: "Extensive blood vessel damage and significant bleeding detected.",
  4: "New abnormal blood vessels are growing, which can cause serious vision loss.",
};

export const RISK_BY_GRADE: Record<DRGrade, RiskLevel> = {
  0: "Low",
  1: "Low",
  2: "Moderate",
  3: "High",
  4: "High",
};

export const DIABETES_BY_GRADE: Record<DRGrade, DiabetesStatus> = {
  0: "Unlikely",
  1: "Possible",
  2: "Likely",
  3: "Highly Likely",
  4: "Highly Likely",
};

export const DIABETES_MSG: Record<DRGrade, string> = {
  0: "No signs of diabetic retinopathy detected. Diabetes-related eye damage is unlikely. Continue routine eye check-ups.",
  1: "Early signs of diabetic retinopathy found. This suggests possible diabetes or pre-diabetes. Please consult a doctor and get your blood sugar (HbA1c, fasting glucose) tested.",
  2: "Moderate diabetic retinopathy detected. This strongly indicates uncontrolled diabetes. Please consult an endocrinologist immediately and get your HbA1c, fasting glucose, and kidney function tested.",
  3: "Severe diabetic retinopathy found. This indicates poorly controlled diabetes that is damaging your eyes. Urgent diabetes management and retina specialist consultation required.",
  4: "Advanced diabetic retinopathy detected. This indicates long-standing, uncontrolled diabetes with serious eye complications. Immediate specialist care and diabetes control are critical.",
};

export interface Prediction {
  grade: DRGrade;
  label: string;
  confidence: number;
  risk: RiskLevel;
  diabetes: DiabetesStatus;
  diabetesMsg: string;
  probabilities: { name: string; value: number }[];
  explanation: string;
  findings: string[];
}

export interface ScreeningRecord {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  grade: DRGrade;
  label: string;
  confidence: number;
  risk: RiskLevel;
  diabetes: DiabetesStatus;
  diabetesMsg: string;
  explanation: string;
  findings: string[];
  imageDataUrl: string;
  heatmapDataUrl: string;
  probabilities: { name: string; value: number }[];
  /** "cnn" = real ONNX model, "heuristic" = offline demo fallback */
  engine?: "cnn" | "heuristic";
}
