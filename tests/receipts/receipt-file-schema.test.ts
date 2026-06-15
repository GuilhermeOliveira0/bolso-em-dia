import { describe, expect, it } from "vitest";
import {
  MAX_RECEIPT_FILE_SIZE_BYTES,
  sanitizeReceiptFileName,
  validateReceiptFile,
} from "@/lib/receipts/receipt-file-schema";

function createFile(name: string, type: string, size = 128): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("receipt file validation", () => {
  it("accepts png, jpeg and webp images up to 5 MB", () => {
    const files = [
      createFile("comprovante.png", "image/png"),
      createFile("comprovante.jpg", "image/jpeg"),
      createFile("comprovante.webp", "image/webp"),
    ];

    for (const file of files) {
      expect(validateReceiptFile(file).ok).toBe(true);
    }
  });

  it("rejects pdf files in the current slice", () => {
    const result = validateReceiptFile(createFile("comprovante.pdf", "application/pdf"));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("PNG");
    }
  });

  it("rejects images larger than 5 MB", () => {
    const result = validateReceiptFile(
      createFile("comprovante.png", "image/png", MAX_RECEIPT_FILE_SIZE_BYTES + 1),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("5 MB");
    }
  });

  it("rejects missing or empty files", () => {
    expect(validateReceiptFile(null).ok).toBe(false);
    expect(validateReceiptFile(createFile("vazio.png", "image/png", 0)).ok).toBe(false);
  });

  it("sanitizes the original file name before storage", () => {
    expect(sanitizeReceiptFileName("Comprovante Pix Joao #1.PNG")).toBe(
      "comprovante-pix-joao-1.png",
    );
  });
});
