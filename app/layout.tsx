import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQSection from "@/components/sections/FAQSection";
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
  metadataBase: new URL("https://covegarage.com"),
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

// Ficha de negocio (Schema.org AutoDealer) — le dice a Google qué es,
// dónde está y cuándo abre Cove Garage BCN, para Maps y búsqueda local.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: siteSettings.nombreEmpresa,
  description: siteSettings.descripcion,
  image: "https://covegarage.com/logo1.png",
  url: "https://covegarage.com",
  telephone: siteSettings.telefono,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Carrer de Moscou, 22",
    addressLocality: siteSettings.ciudad,
    postalCode: "08005",
    addressCountry: "ES",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "20:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-screen flex flex-col bg-dark-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <FAQSection />
        <Footer />
      </body>
    </html>
  );
}
