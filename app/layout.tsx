import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitFlow CRM",
  description: "CRM fitness connecté et automatisé.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
