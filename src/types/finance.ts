export type ExpenseSource = "manual" | "ocr";
export type ReceiptStatus = "uploaded" | "processing" | "processed" | "failed" | "reviewed";
export type ReceiptOcrStatus = "pending" | "processing" | "processed" | "failed";

export type User = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
};

export type ExpenseType = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type PaymentMethod = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  userId: string;
  amountInCents: number;
  description: string;
  date: string;
  categoryId: string;
  expenseTypeId: string;
  paymentMethod: string;
  source: ExpenseSource;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseDraft = {
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  expenseTypeId: string;
  paymentMethod: string;
};

export type ExpenseFormErrors = Partial<Record<keyof ExpenseDraft, string>>;

export type Receipt = {
  id: string;
  userId: string;
  expenseId: string | null;
  filePath: string;
  fileName: string;
  fileType: "image/png" | "image/jpeg" | "image/webp";
  fileSize: number;
  status: ReceiptStatus;
  ocrText?: string | null;
  extractedAmountInCents?: number | null;
  extractedDate?: string | null;
  extractedRecipient?: string | null;
  ocrStatus?: ReceiptOcrStatus | null;
  ocrConfidence?: number | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReceiptWithPreview = Receipt & {
  previewUrl: string | null;
};
