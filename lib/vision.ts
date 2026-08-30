/**
 * Image gate — accepts ALL uploads.
 * The ONNX CNN model handles validation internally.
 */

export interface GateResult {
  ok: boolean;
  reason?: string;
}

export async function gateEyeImage(): Promise<GateResult> {
  return { ok: true };
}
