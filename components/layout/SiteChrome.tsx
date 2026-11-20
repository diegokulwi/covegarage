import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQSection from "@/components/sections/FAQSection";
import ContactTracker from "@/components/layout/ContactTracker";
import { siteSettings } from "@/lib/data/mockSettings";

// Ficha de negocio (Schema.org AutoDealer) — le dice a Google qué es,
// dónde está y cuándo abre Cove Garage BCN, para Maps y búsqueda local.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: siteSettings.nombreEmpresa,
  description: siteSettings.descripcion,
  image: "https://www.covegarage.com/logo1.png",
  url: "https://www.covegarage.com",
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

const GA_MEASUREMENT_ID = "G-F96CWNQV08";

/**
 * Todo lo que rodea a las páginas públicas: datos estructurados, Google Analytics, cabecera, preguntas
 * frecuentes y pie. Vive aquí (y no en el layout raíz) para que el panel de administración no lo herede.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
      </Script>
      <ContactTracker />
      <Header />
      <main className="flex-1">{children}</main>
      <FAQSection />
      <Footer />
    </>
  );
}
