import type { PaymentMethod } from "@/types/finance";

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pix", name: "Pix" },
  { id: "debito", name: "Débito" },
  { id: "credito", name: "Crédito" },
  { id: "dinheiro", name: "Dinheiro" },
  { id: "outro", name: "Outro" },
];

export function getPaymentMethodName(paymentMethodId: string): string {
  return (
    DEFAULT_PAYMENT_METHODS.find((paymentMethod) => paymentMethod.id === paymentMethodId)?.name ??
    "Forma de pagamento"
  );
}
