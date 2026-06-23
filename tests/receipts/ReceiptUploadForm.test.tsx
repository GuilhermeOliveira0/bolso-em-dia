import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadReceiptAction } from "@/app/comprovantes/actions";
import { ReceiptUploadForm } from "@/components/receipts/ReceiptUploadForm";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/app/comprovantes/actions", () => ({
  uploadReceiptAction: vi.fn(),
}));

describe("ReceiptUploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the form visible when upload fails unexpectedly", async () => {
    vi.mocked(uploadReceiptAction).mockRejectedValueOnce(new Error("storage unavailable"));

    render(<ReceiptUploadForm />);

    const file = new File(["receipt"], "comprovante.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Imagem do comprovante"), {
      target: { files: [file] },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Enviar comprovante" }).closest("form")!);

    expect(
      await screen.findByText("Não foi possível enviar o comprovante. Tente novamente."),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Imagem do comprovante")).toBeInTheDocument();
    });
  });
});
