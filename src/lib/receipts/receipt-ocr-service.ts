import { parseReceiptOcrText, type ReceiptOcrParseResult } from "./receipt-ocr-parser";

export type ReceiptOcrExecutionResult =
  | { ok: true; result: ReceiptOcrParseResult }
  | { ok: false; message: string };

type TesseractModule = typeof import("tesseract.js");

export async function runReceiptImageOcr(imageBuffer: Buffer): Promise<ReceiptOcrExecutionResult> {
  try {
    const tesseract = (await import("tesseract.js")) as TesseractModule;
    const recognition = await tesseract.recognize(imageBuffer, "por+eng");
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
  } catch {
    return {
      ok: false,
      message: "A leitura automática falhou. Você ainda pode preencher os dados manualmente.",
    };
  }
}
