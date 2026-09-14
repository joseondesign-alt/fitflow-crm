import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./convex-provider";

export const metadata: Metadata = {
  title: {
    default: "FitFlow CRM",
    template: "%s · FitFlow CRM",
  },
  description: "Le centre de pilotage CRM pour les studios fitness et les coachs.",
  applicationName: "FitFlow CRM",
  authors: [{ name: "FitFlow" }],
  generator: "Next.js",
  keywords: ["CRM fitness", "club de sport", "coach", "automatisation", "FitFlow"],
  referrer: "origin-when-cross-origin",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/fitflow-logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "FitFlow CRM",
    title: "FitFlow CRM",
    description: "Le centre de pilotage CRM pour les studios fitness et les coachs.",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "FitFlow CRM",
    description: "Le centre de pilotage CRM pour les studios fitness et les coachs.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#062e29",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><ConvexClientProvider>{children}</ConvexClientProvider></body></html>;
}
