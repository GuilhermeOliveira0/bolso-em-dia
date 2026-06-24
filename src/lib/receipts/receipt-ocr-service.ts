import { mkdirSync } from "node:fs";
import path from "node:path";
import { parseReceiptOcrText, type ReceiptOcrParseResult } from "./receipt-ocr-parser";

export const RECEIPT_OCR_TIMEOUT_MS = 60_000;
export const RECEIPT_OCR_TIMEOUT_MESSAGE =
  "Não conseguimos ler o comprovante agora. Você pode preencher manualmente.";

export type ReceiptOcrExecutionResult =
  | { ok: true; result: ReceiptOcrParseResult }
  | { ok: false; message: string };

type TesseractModule = typeof import("tesseract.js");
type TesseractWorker = Awaited<ReturnType<TesseractModule["createWorker"]>>;

type RunReceiptImageOcrOptions = {
  timeoutMs?: number;
  createWorker?: TesseractModule["createWorker"];
};

export function resolveTesseractWorkerOptions(): Partial<Tesseract.WorkerOptions> {
  const cachePath = path.join(process.cwd(), ".next", "cache", "tesseract");
  mkdirSync(cachePath, { recursive: true });

  return {
    cachePath,
    workerPath: require.resolve("tesseract.js/src/worker-script/node/index.js"),
  };
}

function createOcrTimeout(timeoutMs: number, onTimeout: () => void) {
  let timeout: ReturnType<typeof setTimeout>;
  const promise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      onTimeout();
      reject(new Error("RECEIPT_OCR_TIMEOUT"));
    }, timeoutMs);
  });

  return {
    clear: () => clearTimeout(timeout),
    promise,
  };
}

function isOcrTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message === "RECEIPT_OCR_TIMEOUT";
}

export async function runReceiptImageOcr(
  imageBuffer: Buffer,
  options: RunReceiptImageOcrOptions = {},
): Promise<ReceiptOcrExecutionResult> {
  let worker: TesseractWorker | null = null;
  let timedOut = false;
  const timeout = createOcrTimeout(options.timeoutMs ?? RECEIPT_OCR_TIMEOUT_MS, () => {
    timedOut = true;
  });
  timeout.promise.catch(() => undefined);

  try {
    const tesseract = (await import("tesseract.js")) as TesseractModule;
    const createWorker = options.createWorker ?? tesseract.createWorker;
    const workerOptions = resolveTesseractWorkerOptions();

    const ocrExecution = (async (): Promise<ReceiptOcrExecutionResult> => {
      const workerPromise = createWorker("por+eng", undefined, workerOptions);
      workerPromise
        .then((createdWorker) => {
          if (timedOut && worker !== createdWorker) {
            void createdWorker.terminate().catch(() => undefined);
          }
        })
        .catch(() => undefined);

      worker = await workerPromise;
      const recognition = await worker.recognize(imageBuffer);
      const rawText = recognition.data.text ?? "";

      if (!rawText.trim()) {
        return {
          ok: false,
          message: "Não foi possível ler dados do comprovante. Preencha a revisão manualmente.",
        };
      }

      return {
        ok: true,
        result: parseReceiptOcrText(rawText, (recognition.data.confidence ?? 0) / 100),
      };
    })();
    ocrExecution.catch(() => undefined);

    return await Promise.race([ocrExecution, timeout.promise]);
  } catch (error) {
    if (isOcrTimeoutError(error)) {
      return {
        ok: false,
        message: RECEIPT_OCR_TIMEOUT_MESSAGE,
      };
    }

    return {
      ok: false,
      message: "A leitura automática falhou. Você ainda pode preencher os dados manualmente.",
    };
  } finally {
    timeout.clear();

    const activeWorker = worker as TesseractWorker | null;

    if (activeWorker) {
      await activeWorker.terminate().catch(() => undefined);
    }
  }
}
