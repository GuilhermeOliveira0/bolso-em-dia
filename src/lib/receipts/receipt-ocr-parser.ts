import { formatCentsToCurrency, parseCurrencyToCents } from "@/lib/expenses/money";

export type OcrFieldConfidence = "high" | "medium" | "low";

export type ReceiptOcrParseResult = {
  normalizedText: string;
  amountInCents: number | null;
  amountText: string;
  date: string;
  recipient: string;
  confidence: number;
  fieldsNeedReview: Array<"amount" | "date" | "recipient">;
};

const recipientKeywords = [
  "recebedor",
  "favorecido",
  "beneficiario",
  "beneficiário",
  "destino",
  "para",
  "nome",
];

const ignoredRecipientFragments = [
  "cpf",
  "cnpj",
  "chave",
  "instituicao",
  "instituição",
  "banco",
  "agencia",
  "agência",
  "conta",
  "valor",
  "data",
  "pix",
];

export function normalizeOcrText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function normalizeDate(day: string, month: string, year: string): string {
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function isValidDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function extractAmount(text: string): number | null {
  const matches = [...text.matchAll(/(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/gi)];
  const amounts = matches
    .map((match) => parseCurrencyToCents(match[1]))
    .filter((amount): amount is number => amount !== null && amount > 0);

  if (amounts.length === 0) {
    return null;
  }

  return Math.max(...amounts);
}

function extractDate(text: string): string {
  const match = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);

  if (!match) {
    return "";
  }

  const normalized = normalizeDate(match[1], match[2], match[3]);
  return isValidDate(normalized) ? normalized : "";
}

function sanitizeRecipientCandidate(value: string): string {
  return value
    .replace(/^[\s:.-]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 80);
}

function isLikelyRecipient(value: string): boolean {
  const candidate = sanitizeRecipientCandidate(value);
  const normalized = normalizeForMatch(candidate);

  if (candidate.length < 3 || /\d{5,}/.test(candidate)) {
    return false;
  }

  return !ignoredRecipientFragments.some((fragment) => normalized.includes(fragment));
}

function extractRecipient(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const normalizedLine = normalizeForMatch(lines[index]);
    const keyword = recipientKeywords.find((entry) => normalizedLine.includes(entry));

    if (!keyword) {
      continue;
    }

    const sameLineCandidate = sanitizeRecipientCandidate(
      lines[index].replace(new RegExp(keyword, "i"), ""),
    );

    if (isLikelyRecipient(sameLineCandidate)) {
      return sameLineCandidate;
    }

    const nextLine = lines[index + 1];
    if (nextLine && isLikelyRecipient(nextLine)) {
      return sanitizeRecipientCandidate(nextLine);
    }
  }

  return "";
}

export function parseReceiptOcrText(text: string, ocrConfidence = 0): ReceiptOcrParseResult {
  const normalizedText = normalizeOcrText(text);
  const amountInCents = extractAmount(normalizedText);
  const date = extractDate(normalizedText);
  const recipient = extractRecipient(normalizedText);
  const fieldsNeedReview: ReceiptOcrParseResult["fieldsNeedReview"] = [];

  if (!amountInCents) fieldsNeedReview.push("amount");
  if (!date) fieldsNeedReview.push("date");
  if (!recipient) fieldsNeedReview.push("recipient");

  const extractedFieldCount = 3 - fieldsNeedReview.length;
  const parserConfidence = extractedFieldCount / 3;
  const confidence = Math.max(0, Math.min(1, (parserConfidence + ocrConfidence) / 2));

  return {
    normalizedText,
    amountInCents,
    amountText: amountInCents ? formatCentsToCurrency(amountInCents).replace("R$", "").trim() : "",
    date,
    recipient,
    confidence,
    fieldsNeedReview,
  };
}
