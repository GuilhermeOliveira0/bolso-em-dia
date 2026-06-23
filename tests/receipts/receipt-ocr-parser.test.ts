import { describe, expect, it } from "vitest";
import { parseReceiptOcrText } from "@/lib/receipts/receipt-ocr-parser";

describe("parseReceiptOcrText", () => {
  it("extrai valor, data e recebedor de texto comum de Pix", () => {
    const result = parseReceiptOcrText(
      `
      Comprovante Pix
      Valor R$ 42,90
      Data 19/06/2026
      Recebedor:
      Mercado Central
      `,
      0.9,
    );

    expect(result.amountInCents).toBe(4290);
    expect(result.amountText).toBe("42,90");
    expect(result.date).toBe("2026-06-19");
    expect(result.recipient).toBe("Mercado Central");
    expect(result.fieldsNeedReview).toEqual([]);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("usa o maior valor quando existem valores menores no comprovante", () => {
    const result = parseReceiptOcrText(
      `
      Tarifa R$ 0,00
      Total R$ 1.250,35
      Para Maria Silva
      Em 02/01/2026
      `,
      0.8,
    );

    expect(result.amountInCents).toBe(125035);
    expect(result.date).toBe("2026-01-02");
    expect(result.recipient).toBe("Maria Silva");
  });

  it("marca campos ausentes para revisão manual", () => {
    const result = parseReceiptOcrText("Comprovante Pix ilegível", 0.1);

    expect(result.amountInCents).toBeNull();
    expect(result.date).toBe("");
    expect(result.recipient).toBe("");
    expect(result.fieldsNeedReview).toEqual(["amount", "date", "recipient"]);
    expect(result.confidence).toBeLessThan(0.1);
  });

  it("ignora candidatos de recebedor com CPF, CNPJ ou chave Pix", () => {
    const result = parseReceiptOcrText(
      `
      Valor: R$ 99,90
      Data: 10/03/2026
      Recebedor
      CPF 123.456.789-00
      Nome: Padaria Boa Massa
      `,
      0.7,
    );

    expect(result.recipient).toBe("Padaria Boa Massa");
  });
});
