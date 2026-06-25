import { describe, expect, it } from "vitest";
import { classifyExpense } from "@/lib/expenses/expense-classifier";

describe("classifyExpense", () => {
  it("sugere Combustível / Necessário para posto ou combustível", () => {
    expect(classifyExpense({ description: "Posto gasolina aditivada" })).toMatchObject({
      suggestedCategory: "combustivel",
      suggestedType: "necessario",
      confidence: "high",
      matchedKeyword: "gasolina",
    });
  });

  it("sugere Mecânica / Importante para oficina e manutenção", () => {
    expect(classifyExpense({ recipient: "Oficina troca de oleo" })).toMatchObject({
      suggestedCategory: "mecanica",
      suggestedType: "importante",
      confidence: "high",
      matchedKeyword: "oficina",
    });
  });

  it("sugere Alimentação / Lazer para iFood", () => {
    expect(classifyExpense({ recipient: "iFood Pagamentos" })).toMatchObject({
      suggestedCategory: "alimentacao",
      suggestedType: "lazer",
      confidence: "high",
      matchedKeyword: "ifood",
    });
  });

  it("sugere Saúde / Necessário para farmácia", () => {
    expect(classifyExpense({ recipient: "Farmácia Pague Menos" })).toMatchObject({
      suggestedCategory: "saude",
      suggestedType: "necessario",
      confidence: "high",
      matchedKeyword: "farmacia",
    });
  });

  it("sugere Assinaturas / Lazer para Netflix", () => {
    expect(classifyExpense({ recipient: "Netflix" })).toMatchObject({
      suggestedCategory: "assinaturas",
      suggestedType: "lazer",
      confidence: "high",
      matchedKeyword: "netflix",
    });
  });

  it("sugere Compras / Supérfluo para Shopee", () => {
    expect(classifyExpense({ recipient: "Shopee" })).toMatchObject({
      suggestedCategory: "compras",
      suggestedType: "superfluo",
      confidence: "high",
      matchedKeyword: "shopee",
    });
  });

  it("sugere Moradia / Necessário para conta de luz", () => {
    expect(classifyExpense({ description: "Conta de luz de junho" })).toMatchObject({
      suggestedCategory: "moradia",
      suggestedType: "necessario",
      confidence: "high",
      matchedKeyword: "luz",
    });
  });

  it("retorna baixa confiança para texto desconhecido", () => {
    expect(classifyExpense({ recipient: "Recebedor sem regra" })).toMatchObject({
      suggestedCategory: "",
      suggestedType: "",
      confidence: "low",
      matchedKeyword: "",
    });
  });

  it("funciona com acentos e maiúsculas", () => {
    expect(classifyExpense({ description: "PAGAMENTO DE COMBUSTÍVEL" })).toMatchObject({
      suggestedCategory: "combustivel",
      suggestedType: "necessario",
      confidence: "high",
      matchedKeyword: "combustivel",
    });
  });

  it("prioriza recebedor sobre texto OCR genérico", () => {
    expect(
      classifyExpense({
        recipient: "Posto",
        ocrText: "Comprovante Pix com palavra mercado no rodapé",
      }),
    ).toMatchObject({
      suggestedCategory: "combustivel",
      suggestedType: "necessario",
      matchedKeyword: "posto",
    });
  });

  it("usa texto OCR como apoio com confiança média", () => {
    expect(classifyExpense({ ocrText: "Recebedor não identificado\nAssinatura Spotify" })).toMatchObject({
      suggestedCategory: "assinaturas",
      suggestedType: "lazer",
      confidence: "medium",
      matchedKeyword: "spotify",
    });
  });
});
