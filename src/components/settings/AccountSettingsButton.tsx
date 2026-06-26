import Link from "next/link";

type AccountSettingsButtonProps = {
  email: string;
  initial: string;
};

export function AccountSettingsButton({ email, initial }: AccountSettingsButtonProps) {
  return (
    <Link
      aria-label="Abrir configurações da conta"
      className="avatar-chip avatar-button"
      href="/configuracoes"
      title={`Configurações de ${email}`}
    >
      {initial}
    </Link>
  );
}
