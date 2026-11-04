/// <reference lib="webworker" />
/**
 * Removes the background from a product photo in the browser, off the main
 * thread. Runs U²-Net small (Apache 2.0, 4.6 MB, served from /models) through
 * ONNX Runtime on WebAssembly, so it works in any modern browser and fits
 * comfortably in memory. The runtime's .wasm comes from the jsDelivr CDN at
 * the exact installed version.
 */
import * as ort from "onnxruntime-web/wasm";

const MODEL_URL = "/models/u2netp.onnx";
const ORT_VERSION = "1.30.0";
const SIZE = 320;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
/** Matte values below LOW become fully clear and above HIGH fully solid, which removes the soft halo. */
const LOW = 0.15;
const HIGH = 0.75;

type Request = { id: number; width: number; height: number; pixels: Uint8ClampedArray };
export type WorkerMessage =
  | { type: "done"; id: number; width: number; height: number; pixels: Uint8ClampedArray }
  | { type: "error"; id: number; message: string };

ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
// Threads need cross origin isolation, which the site does not set
ort.env.wasm.numThreads = 1;

let session: Promise<ort.InferenceSession> | null = null;

/** Scales the photo to the model's 320×320 input, normalised as U²-Net was trained. */
function toInput({ width, height, pixels }: Request) {
  const canvas = new OffscreenCanvas(width, height);
  canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
  const small = new OffscreenCanvas(SIZE, SIZE);
  const ctx = small.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(canvas, 0, 0, SIZE, SIZE);
  const rgba = ctx.getImageData(0, 0, SIZE, SIZE).data;
  let max = 1;
  for (let i = 0; i < rgba.length; i += 4) max = Math.max(max, rgba[i], rgba[i + 1], rgba[i + 2]);
  const input = new Float32Array(3 * SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    for (let c = 0; c < 3; c++) input[c * SIZE * SIZE + i] = (rgba[i * 4 + c] / max - MEAN[c]) / STD[c];
  }
  return new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]);
}

/** Turns the 320×320 saliency map into an alpha matte at the photo's size. */
function toAlpha(map: Float32Array, width: number, height: number) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of map) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const mask = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const v = (map[i] - lo) / (hi - lo || 1);
    mask[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, (v - LOW) / (HIGH - LOW))) * 255);
  }
  const small = new OffscreenCanvas(SIZE, SIZE);
  small.getContext("2d")!.putImageData(new ImageData(mask, SIZE, SIZE), 0, 0);
  const full = new OffscreenCanvas(width, height);
  const ctx = full.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height).data;
}

self.onmessage = async (e: MessageEvent<Request>) => {
  const req = e.data;
  try {
    session ??= ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] });
    const s = await session;
    const out = await s.run({ [s.inputNames[0]]: toInput(req) });
    // The first output is the finest of U²-Net's side outputs
    const alpha = toAlpha(out[s.outputNames[0]].data as Float32Array, req.width, req.height);
    const { pixels } = req;
    for (let i = 3; i < pixels.length; i += 4) pixels[i] = Math.min(pixels[i], alpha[i]);
    self.postMessage({ type: "done", id: req.id, width: req.width, height: req.height, pixels } satisfies WorkerMessage, [pixels.buffer]);
  } catch (err) {
    session = null;
    self.postMessage({ type: "error", id: req.id, message: err instanceof Error ? err.message : String(err) } satisfies WorkerMessage);
  }
};
