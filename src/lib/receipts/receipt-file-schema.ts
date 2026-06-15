export const RECEIPT_BUCKET = "receipts";
export const MAX_RECEIPT_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_RECEIPT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AcceptedReceiptMimeType = (typeof ACCEPTED_RECEIPT_MIME_TYPES)[number];

export type ReceiptFileValidationResult =
  | { ok: true; file: File; safeFileName: string; fileType: AcceptedReceiptMimeType }
  | { ok: false; message: string };

export function sanitizeReceiptFileName(fileName: string): string {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();

  return normalized || "comprovante";
}

function isFile(value: FormDataEntryValue | File | null | undefined): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function validateReceiptFile(
  value: FormDataEntryValue | File | null | undefined,
): ReceiptFileValidationResult {
  if (!isFile(value) || value.size === 0) {
    return { ok: false, message: "Envie uma imagem de comprovante Pix." };
  }

  if (!ACCEPTED_RECEIPT_MIME_TYPES.includes(value.type as AcceptedReceiptMimeType)) {
    return {
      ok: false,
      message: "Somente imagens PNG, JPG, JPEG ou WEBP sao aceitas agora.",
    };
  }

  if (value.size > MAX_RECEIPT_FILE_SIZE_BYTES) {
    return { ok: false, message: "A imagem deve ter no maximo 5 MB." };
  }

  return {
    ok: true,
    file: value,
    safeFileName: sanitizeReceiptFileName(value.name),
    fileType: value.type as AcceptedReceiptMimeType,
  };
}
