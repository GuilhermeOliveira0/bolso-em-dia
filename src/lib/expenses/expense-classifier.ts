export type ExpenseClassificationConfidence = "high" | "medium" | "low";

export type ExpenseClassificationInput = {
  recipient?: string | null;
  description?: string | null;
  ocrText?: string | null;
};

export type ExpenseClassificationResult = {
  suggestedCategory: string;
  suggestedType: string;
  confidence: ExpenseClassificationConfidence;
  matchedKeyword: string;
  reason: string;
};

type ExpenseClassificationRule = {
  categoryId: string;
  expenseTypeId: string;
  keywords: string[];
};

const EXPENSE_CLASSIFICATION_RULES: ExpenseClassificationRule[] = [
  {
    categoryId: "combustivel",
    expenseTypeId: "necessario",
    keywords: ["combustivel", "gasolina", "etanol", "diesel", "posto"],
  },
  {
    categoryId: "mecanica",
    expenseTypeId: "importante",
    keywords: ["mecanica", "oficina", "manutencao", "troca de oleo", "pneu"],
  },
  {
    categoryId: "alimentacao",
    expenseTypeId: "lazer",
    keywords: ["ifood", "restaurante", "burger", "hamburguer", "pizza", "lanche", "cafeteria", "delivery"],
  },
  {
    categoryId: "mercado",
    expenseTypeId: "necessario",
    keywords: ["mercado", "supermercado", "atacadao", "extra", "assai", "carrefour", "pao de acucar"],
  },
  {
    categoryId: "saude",
    expenseTypeId: "necessario",
    keywords: ["farmacia", "drogaria", "remedio", "hospital", "consulta", "saude"],
  },
  {
    categoryId: "moradia",
    expenseTypeId: "necessario",
    keywords: ["aluguel", "luz", "energia", "agua", "internet", "condominio", "gas"],
  },
  {
    categoryId: "assinaturas",
    expenseTypeId: "lazer",
    keywords: ["netflix", "spotify", "disney", "prime", "amazon prime", "youtube", "assinatura"],
  },
  {
    categoryId: "compras",
    expenseTypeId: "superfluo",
    keywords: ["shopee", "shein", "mercado livre", "amazon", "loja", "shopping"],
  },
  {
    categoryId: "educacao",
    expenseTypeId: "importante",
    keywords: ["curso", "faculdade", "escola", "livro", "educacao", "udemy", "alura"],
  },
];

function normalizeForClassification(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findRuleMatch(text: string) {
  for (const rule of EXPENSE_CLASSIFICATION_RULES) {
    const matchedKeyword = rule.keywords.find((keyword) => text.includes(keyword));

    if (matchedKeyword) {
      return { rule, matchedKeyword };
    }
  }

  return null;
}

export function classifyExpense(
  input: ExpenseClassificationInput,
): ExpenseClassificationResult {
  const sources = [
    { label: "recebedor", value: input.recipient, confidence: "high" as const },
    { label: "descrição", value: input.description, confidence: "high" as const },
    { label: "texto do comprovante", value: input.ocrText, confidence: "medium" as const },
  ];

  for (const source of sources) {
    const normalizedText = normalizeForClassification(source.value ?? "");

    if (!normalizedText) {
      continue;
    }

    const match = findRuleMatch(normalizedText);

    if (!match) {
      continue;
    }

    return {
      suggestedCategory: match.rule.categoryId,
      suggestedType: match.rule.expenseTypeId,
      confidence: source.confidence,
      matchedKeyword: match.matchedKeyword,
      reason: `Sugestão por palavra-chave no ${source.label}.`,
    };
  }

  return {
    suggestedCategory: "",
    suggestedType: "",
    confidence: "low",
    matchedKeyword: "",
    reason: "Não encontramos uma palavra-chave confiável. Revise manualmente.",
  };
}

export { EXPENSE_CLASSIFICATION_RULES };
