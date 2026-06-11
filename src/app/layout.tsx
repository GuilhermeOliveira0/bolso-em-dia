import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolso em Dia",
  description: "Controle financeiro pessoal simples e mobile-first.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#21594f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
