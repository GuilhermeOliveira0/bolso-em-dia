"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  label?: string;
};

export function LogoutButton({ label = "Sair" }: LogoutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button className="secondary-action" disabled={isSubmitting} onClick={handleLogout} type="button">
      {isSubmitting ? "Saindo..." : label}
    </button>
  );
}
