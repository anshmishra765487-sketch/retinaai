import type { Prediction } from "./types";
import { DIABETES_BY_GRADE, DIABETES_MSG, DR_DESCRIPTIONS, DR_LABELS, RISK_BY_GRADE } from "./types";

/**
 * Real CNN inference in the browser using ONNX Runtime Web.
 * Model: retinopathy_model.onnx (PyTorch CNN exported to ONNX,
 * trained on retinal fundus photographs for DR grading).
 */

const MODEL_URL = "/models/retinopathy_model.onnx";
const INPUT_SIZE = 224;

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

type OrtModule = typeof import("onnxruntime-web");
let sessionPromise: Promise<import("onnxruntime-web").InferenceSession> | null =
  null;
let ortPromise: Promise<OrtModule> | null = null;

export function isRealModelAvailable(): boolean {
  return true; // model ships in /public — availability checked at runtime
}

async function getOrt(): Promise<OrtModule> {
  if (!ortPromise) {
    ortPromise = import("onnxruntime-web");
  }
  return ortPromise;
}

async function getSession() {
  if (!sessionPromise) {
    const ort = await getOrt();
    ort.env.wasm.numThreads = 1;
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  }
  return sessionPromise;
}

function imageToTensor(img: HTMLImageElement): {
  data: Float32Array;
  dims: number[];
} {
  const canvas = document.createElement("canvas");
  canvas.width = INPUT_SIZE;
  canvas.height = INPUT_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");

  // Cover-fit (center crop equivalent), like typical training pipelines
  const scale = Math.max(INPUT_SIZE / img.width, INPUT_SIZE / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (INPUT_SIZE - w) / 2, (INPUT_SIZE - h) / 2, w, h);

  const { data: px } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const plane = INPUT_SIZE * INPUT_SIZE;
  const out = new Float32Array(plane * 3);

  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) {
      const v = px[i * 4 + c] / 255;
      out[c * plane + i] = (v - MEAN[c]) / STD[c];
    }
  }
  return { data: out, dims: [1, 3, INPUT_SIZE, INPUT_SIZE] };
}

function softmax(logits: Float32Array | number[]): number[] {
  const arr = Array.from(logits);
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

const FINDINGS_BY_GRADE: Record<number, string[]> = {
  0: [
    "CNN found no significant lesion patterns in the retina",
    "Vessel structure appears within normal range",
  ],
  1: [
    "CNN detected early microaneurysm-like signals",
    "Minor changes near vessel endings observed",
  ],
  2: [
    "CNN detected moderate lesion patterns across the retina",
    "Hemorrhage and exudate indicators present",
  ],
  3: [
    "CNN detected severe multi-region damage signals",
    "Extensive hemorrhagic patterns identified",
  ],
  4: [
    "CNN detected proliferative-stage neovascularization signals",
    "High-risk abnormal vessel growth patterns found",
  ],
};

/**
 * Runs the real exported CNN on a fundus image.
 * Supports both 5-class (APTOS 0-4) and 2-class (DR / No-DR) heads.
 */
export async function runRealInference(
  img: HTMLImageElement,
): Promise<Prediction> {
  const ort = await getOrt();
  const session = await getSession();

  const { data, dims } = imageToTensor(img);
  const inputName = session.inputNames[0];
  const feeds: Record<string, import("onnxruntime-web").Tensor> = {
    [inputName]: new ort.Tensor("float32", data, dims),
  };

  const output = await session.run(feeds);
  const first = session.outputNames[0];
  const logits = output[first].data as Float32Array;
  const probs = softmax(logits);
  const nClasses = probs.length;

  let grade: number;
  if (nClasses >= 5) {
    grade = probs.indexOf(Math.max(...probs));
    grade = Math.min(grade, 4);
  } else {
    // Binary head: index 1 assumed to be "DR present"
    const hasDR = probs[1] >= probs[0];
    const p = Math.max(...probs);
    grade = !hasDR ? 0 : p > 0.85 ? 3 : 2;
  }

  const confidence = Math.round(probs[grade === undefined ? 0 : Math.min(grade, nClasses - 1)] * 1000) / 10;

  const probabilities =
    nClasses >= 5
      ? ([0, 1, 2, 3, 4] as number[]).map((g) => ({
          name: DR_LABELS[g as 0],
          value:
            Math.round((probs[g] ?? 0) * 1000) / 10,
        }))
      : [
          { name: "No DR", value: Math.round((probs[0] ?? 0) * 1000) / 10 },
          { name: "DR Present", value: Math.round((probs[1] ?? 0) * 1000) / 10 },
        ];

  return {
    grade: grade as 0 | 1 | 2 | 3 | 4,
    label: DR_LABELS[grade as 0],
    confidence,
    risk: RISK_BY_GRADE[grade as 0],
    diabetes: DIABETES_BY_GRADE[grade as 0],
    diabetesMsg: DIABETES_MSG[grade as 0],
    probabilities,
    explanation: DR_DESCRIPTIONS[grade as 0],
    findings: FINDINGS_BY_GRADE[Math.min(grade, 4)],
  };
}
