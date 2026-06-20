"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadReceiptAction, type UploadReceiptResult } from "@/app/comprovantes/actions";
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
    <section className="panel receipt-upload-panel" aria-labelledby="receipt-upload-title">
      <div className="section-heading">
        <p className="eyebrow">Comprovante Pix</p>
        <h2 id="receipt-upload-title">Enviar imagem</h2>
        <p>Guarde a imagem do comprovante sem criar um gasto automaticamente.</p>
      </div>

      <form ref={formRef} className="receipt-form" encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
        <div className="receipt-dropzone">
          <label className="field">
            <span>Imagem do comprovante</span>
            <input
              accept="image/png,image/jpeg,image/webp"
              name="receipt"
              required
              type="file"
            />
          </label>
          <p className="receipt-help">
            Selecione uma imagem do comprovante Pix para manter o arquivo privado na sua conta.
          </p>
        </div>

        <p className="info-message">
          OCR ainda nao esta ativo. PNG, JPG, JPEG ou WEBP ate{" "}
          {MAX_RECEIPT_FILE_SIZE_BYTES / 1024 / 1024} MB.
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
