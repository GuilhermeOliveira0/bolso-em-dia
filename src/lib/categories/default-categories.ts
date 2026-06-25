import type { Category } from "@/types/finance";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "alimentacao", name: "Alimentação", color: "#ba5f3b", isDefault: true },
  { id: "mercado", name: "Mercado", color: "#597a3f", isDefault: true },
  { id: "mecanica", name: "Mecânica", color: "#64748b", isDefault: true },
  { id: "combustivel", name: "Combustível", color: "#f97316", isDefault: true },
  { id: "lazer", name: "Lazer", color: "#8f5d83", isDefault: true },
  { id: "saude", name: "Saúde", color: "#4f8571", isDefault: true },
  { id: "educacao", name: "Educação", color: "#7d6a3f", isDefault: true },
  { id: "moradia", name: "Moradia", color: "#6a655c", isDefault: true },
  { id: "contas", name: "Contas", color: "#9a7044", isDefault: true },
  { id: "compras", name: "Compras", color: "#735c9c", isDefault: true },
  { id: "assinaturas", name: "Assinaturas", color: "#526d78", isDefault: true },
  { id: "sitio", name: "Sítio", color: "#16a34a", isDefault: true },
  { id: "outros", name: "Outros", color: "#747474", isDefault: true },
];

export const LEGACY_CATEGORIES: Category[] = [
  { id: "transporte", name: "Transporte", color: "#3f6f8f", isDefault: true },
];

export const ALL_KNOWN_CATEGORIES: Category[] = [...DEFAULT_CATEGORIES, ...LEGACY_CATEGORIES];

export function getExpenseCategoryOptions(selectedCategoryId?: string): Category[] {
  const legacySelection = LEGACY_CATEGORIES.find((category) => category.id === selectedCategoryId);

  return legacySelection ? [...DEFAULT_CATEGORIES, legacySelection] : DEFAULT_CATEGORIES;
}

export function isDefaultCategoryId(categoryId: string): boolean {
  return DEFAULT_CATEGORIES.some((category) => category.id === categoryId);
}

export function isKnownCategoryId(categoryId: string): boolean {
  return ALL_KNOWN_CATEGORIES.some((category) => category.id === categoryId);
}

export function getCategoryName(categoryId: string): string {
  return ALL_KNOWN_CATEGORIES.find((category) => category.id === categoryId)?.name ?? "Categoria";
}
