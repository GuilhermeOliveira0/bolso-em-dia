"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadReceiptAction, type UploadReceiptResult } from "@/app/comprovantes/actions";
import { AppIcon } from "@/components/ui/AppIcon";
import { MAX_RECEIPT_FILE_SIZE_BYTES } from "@/lib/receipts/receipt-file-schema";

export function ReceiptUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<UploadReceiptResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      let actionResult: UploadReceiptResult;

      try {
        actionResult = await uploadReceiptAction(formData);
      } catch {
        actionResult = {
          ok: false,
          message: "Nao foi possivel enviar o comprovante. Tente novamente.",
        };
      }

      setResult(actionResult);

      if (actionResult.ok) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <section
      aria-labelledby="receipt-upload-title"
      className="panel receipt-upload-panel prototype-upload-card"
    >
      <form
        ref={formRef}
        className="receipt-form"
        encType="multipart/form-data"
        method="post"
        onSubmit={handleSubmit}
      >
        <div className="receipt-dropzone">
          <AppIcon className="app-icon upload-icon" name="receipt" />
          <h2 id="receipt-upload-title">Anexar Comprovante</h2>
          <p>Arraste e solte seu comprovante Pix aqui ou clique para selecionar o arquivo.</p>
          <label className="field">
            <span>Imagem do comprovante</span>
            <input accept="image/png,image/jpeg,image/webp" name="receipt" required type="file" />
          </label>
        </div>

        <p className="info-message">
          <strong>Leitura Inteligente:</strong> OCR ainda nao esta ativo. PNG, JPG, JPEG ou WEBP
          ate {MAX_RECEIPT_FILE_SIZE_BYTES / 1024 / 1024} MB.
        </p>

        {result ? (
          <p className={result.ok ? "success-message" : "error-message"} role="status">
            {result.message}
          </p>
        ) : null}

        <button className="primary-action" disabled={isPending} type="submit">
          {isPending ? "Enviando..." : "Enviar comprovante"}
        </button>
      </form>
    </section>
  );
}
