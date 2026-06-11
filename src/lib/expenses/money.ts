export function parseCurrencyToCents(value: string): number | null {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [reais, centavos = ""] = normalized.split(".");
  const cents = Number.parseInt(reais, 10) * 100 + Number.parseInt(centavos.padEnd(2, "0"), 10);

  return Number.isSafeInteger(cents) ? cents : null;
}

export function formatCentsToCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
}
