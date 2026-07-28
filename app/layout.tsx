import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
  metadataBase: new URL("https://covegaragebcn.com"),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-screen flex flex-col bg-dark-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
