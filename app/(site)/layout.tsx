import SiteChrome from "@/components/layout/SiteChrome";

// Marco de la web pública (cabecera, preguntas frecuentes, pie, Analytics).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
