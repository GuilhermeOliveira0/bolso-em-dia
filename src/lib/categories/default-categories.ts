import type { Category } from "@/types/finance";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "alimentacao", name: "Alimentação", color: "#ba5f3b", isDefault: true },
  { id: "mercado", name: "Mercado", color: "#597a3f", isDefault: true },
  { id: "transporte", name: "Transporte", color: "#3f6f8f", isDefault: true },
  { id: "lazer", name: "Lazer", color: "#8f5d83", isDefault: true },
  { id: "saude", name: "Saúde", color: "#4f8571", isDefault: true },
  { id: "educacao", name: "Educação", color: "#7d6a3f", isDefault: true },
  { id: "moradia", name: "Moradia", color: "#6a655c", isDefault: true },
  { id: "contas", name: "Contas", color: "#9a7044", isDefault: true },
  { id: "compras", name: "Compras", color: "#735c9c", isDefault: true },
  { id: "assinaturas", name: "Assinaturas", color: "#526d78", isDefault: true },
  { id: "outros", name: "Outros", color: "#747474", isDefault: true },
];

export function getCategoryName(categoryId: string): string {
  return DEFAULT_CATEGORIES.find((category) => category.id === categoryId)?.name ?? "Categoria";
}
