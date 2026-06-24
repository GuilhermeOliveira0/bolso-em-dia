import { describe, expect, it, vi } from "vitest";
import {
  RECEIPT_OCR_TIMEOUT_MESSAGE,
  resolveTesseractWorkerOptions,
  runReceiptImageOcr,
} from "@/lib/receipts/receipt-ocr-service";

type TesseractCreateWorker = typeof import("tesseract.js").createWorker;

function createWorkerMock(overrides: {
  recognize: ReturnType<typeof vi.fn>;
  terminate?: ReturnType<typeof vi.fn>;
}) {
  const terminate = overrides.terminate ?? vi.fn(async () => undefined);
  const worker = {
    recognize: overrides.recognize,
    terminate,
  };

  return {
    createWorker: vi.fn(async () => worker) as unknown as TesseractCreateWorker,
    terminate,
  };
}

describe("runReceiptImageOcr", () => {
  it("configura o worker local do tesseract para o runtime do Next", async () => {
    const options = resolveTesseractWorkerOptions();

    expect(options.workerPath).toContain("node_modules");
    expect(options.workerPath).toContain("tesseract.js");
    expect(options.workerPath).toContain("worker-script");
    expect(options.workerPath).not.toContain("C:\\ROOT");
    expect(options.cachePath).toContain(".next");
    expect(options.cachePath).toContain("tesseract");
  });

  it("passa a configuracao local do worker para o tesseract", async () => {
    const { createWorker } = createWorkerMock({
      recognize: vi.fn(async () => ({
        data: {
          text: "Valor R$ 10,00\nData 19/06/2026\nRecebedor:\nPadaria",
          confidence: 80,
        },
      })),
    });

    await runReceiptImageOcr(Buffer.from("image"), { createWorker });

    expect(createWorker).toHaveBeenCalledWith(
      "por+eng",
      undefined,
      expect.objectContaining({
        cachePath: expect.stringContaining("tesseract"),
        workerPath: expect.stringContaining("worker-script"),
      }),
    );
  });

  it("retorna timeout quando a criacao do worker fica pendente", async () => {
    const resultOrHang = await Promise.race([
      runReceiptImageOcr(Buffer.from("image"), {
        createWorker: vi.fn(() => new Promise(() => undefined)) as unknown as TesseractCreateWorker,
        timeoutMs: 1,
      }),
      new Promise((resolve) => {
        setTimeout(() => resolve("hung"), 20);
      }),
    ]);

    expect(resultOrHang).toEqual({
      ok: false,
      message: RECEIPT_OCR_TIMEOUT_MESSAGE,
    });
  });

  it("retorna erro amigavel e encerra o worker quando o OCR expira", async () => {
    const { createWorker, terminate } = createWorkerMock({
      recognize: vi.fn(() => new Promise(() => undefined)),
    });

    const result = await runReceiptImageOcr(Buffer.from("image"), {
      createWorker,
      timeoutMs: 1,
    });

    expect(result).toEqual({
      ok: false,
      message: RECEIPT_OCR_TIMEOUT_MESSAGE,
    });
    expect(terminate).toHaveBeenCalledTimes(1);
  });

  it("mantem o parser funcionando quando o OCR retorna texto valido", async () => {
    const { createWorker, terminate } = createWorkerMock({
      recognize: vi.fn(async () => ({
        data: {
          text: `
            Comprovante Pix
            Valor R$ 42,90
            Data 19/06/2026
            Recebedor:
            Mercado Central
          `,
          confidence: 90,
        },
      })),
    });

    const result = await runReceiptImageOcr(Buffer.from("image"), { createWorker });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.amountInCents).toBe(4290);
      expect(result.result.date).toBe("2026-06-19");
      expect(result.result.recipient).toBe("Mercado Central");
    }
    expect(terminate).toHaveBeenCalledTimes(1);
  });

  it("retorna erro manual e encerra o worker quando o OCR falha", async () => {
    const { createWorker, terminate } = createWorkerMock({
      recognize: vi.fn(async () => {
        throw new Error("ocr failed");
      }),
    });

    const result = await runReceiptImageOcr(Buffer.from("image"), { createWorker });

    expect(result).toEqual({
      ok: false,
      message: "A leitura automática falhou. Você ainda pode preencher os dados manualmente.",
    });
    expect(terminate).toHaveBeenCalledTimes(1);
  });
});
