/// <reference lib="webworker" />
/**
 * Removes the background from a product photo in the browser, off the main
 * thread. BiRefNet lite (MIT licence) runs through transformers.js on WebGPU
 * when the browser has it, otherwise on WebAssembly. The model (about 115 MB)
 * downloads on first use and is cached by the browser after that.
 */
import { pipeline, RawImage, type BackgroundRemovalPipeline } from "@huggingface/transformers";

const MODEL = "onnx-community/BiRefNet_lite-ONNX";

type Request = { id: number; width: number; height: number; pixels: Uint8ClampedArray };
export type WorkerMessage =
  | { type: "progress"; loaded: number; total: number }
  | { type: "done"; id: number; width: number; height: number; pixels: Uint8ClampedArray }
  | { type: "error"; id: number; message: string };

let remover: Promise<BackgroundRemovalPipeline> | null = null;

function load() {
  const progress_callback = (p: { status: string; loaded?: number; total?: number }) => {
    if (p.status === "progress" && p.total) self.postMessage({ type: "progress", loaded: p.loaded ?? 0, total: p.total });
  };
  remover ??= (async () => {
    const hasWebGpu = "gpu" in navigator && (await (navigator as Navigator & { gpu: { requestAdapter(): Promise<unknown> } }).gpu.requestAdapter());
    try {
      return (await pipeline("background-removal", MODEL, {
        device: hasWebGpu ? "webgpu" : "wasm",
        dtype: "fp16",
        progress_callback,
      })) as BackgroundRemovalPipeline;
    } catch {
      // Some WebAssembly builds cannot run the half precision model
      return (await pipeline("background-removal", MODEL, { device: "wasm", dtype: "fp32", progress_callback })) as BackgroundRemovalPipeline;
    }
  })();
  return remover;
}

self.onmessage = async (e: MessageEvent<Request>) => {
  const { id, width, height, pixels } = e.data;
  try {
    const remove = await load();
    const out = (await remove(new RawImage(pixels, width, height, 4))) as RawImage;
    const rgba = out.channels === 4 ? out : out.rgba();
    const data = new Uint8ClampedArray(rgba.data);
    self.postMessage({ type: "done", id, width: rgba.width, height: rgba.height, pixels: data } satisfies WorkerMessage, [data.buffer]);
  } catch (err) {
    self.postMessage({ type: "error", id, message: err instanceof Error ? err.message : String(err) } satisfies WorkerMessage);
  }
};
