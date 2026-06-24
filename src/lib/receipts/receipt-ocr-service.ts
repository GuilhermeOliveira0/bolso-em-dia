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

function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("RECEIPT_OCR_TIMEOUT")), timeoutMs);
  });
}

function isOcrTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message === "RECEIPT_OCR_TIMEOUT";
}

export async function runReceiptImageOcr(
  imageBuffer: Buffer,
  options: RunReceiptImageOcrOptions = {},
): Promise<ReceiptOcrExecutionResult> {
  let worker: TesseractWorker | null = null;

  try {
    const tesseract = (await import("tesseract.js")) as TesseractModule;
    const createWorker = options.createWorker ?? tesseract.createWorker;
    const timeoutMs = options.timeoutMs ?? RECEIPT_OCR_TIMEOUT_MS;

    worker = await createWorker("por+eng");
    const recognitionPromise = worker.recognize(imageBuffer);
    recognitionPromise.catch(() => undefined);

    const recognition = await Promise.race([
      recognitionPromise,
      createTimeoutPromise(timeoutMs),
    ]);
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
    if (worker) {
      await worker.terminate().catch(() => undefined);
    }
  }
}
