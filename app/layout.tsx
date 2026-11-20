import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { siteSettings } from "@/lib/data/mockSettings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.covegarage.es"),
  title: {
    default: `${siteSettings.nombreEmpresa} — ${siteSettings.slogan}`,
    template: `%s | ${siteSettings.nombreEmpresa}`,
  },
  description: siteSettings.descripcion,
  keywords: [
    "comprar coche Barcelona",
    "vender coche Barcelona",
    "coches segunda mano Barcelona",
    "importación coches Europa",
    "Cove Garage BCN",
    "coche garantía Barcelona",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: siteSettings.nombreEmpresa,
    title: `${siteSettings.nombreEmpresa} — ${siteSettings.slogan}`,
    description: siteSettings.descripcion,
  },
  robots: { index: true, follow: true },
};

// Layout raíz mínimo: fuentes, estilos y <html>/<body>. La cabecera, el pie y Analytics de la web
// pública están en components/layout/SiteChrome.tsx (los usa app/(site)/layout.tsx); el panel de
// administración (app/admin) tiene su propio marco.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-screen flex flex-col bg-dark-900">{children}</body>
    </html>
  );
}
