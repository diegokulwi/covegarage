import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, ShieldCheck } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CarGrid from "@/components/cars/CarGrid";
import { getCars } from "@/lib/services/cars";
import { categorias } from "@/lib/data/categorias";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";

interface Props {
  params: { categoria: string };
}

export async function generateStaticParams() {
  return categorias.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoria = categorias.find((c) => c.slug === params.categoria);
  if (!categoria) return {};

  return {
    title: categoria.metaTitulo,
    description: categoria.metaDescripcion,
    alternates: {
      canonical: `/coches-por-tipo/${categoria.slug}`,
    },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const categoria = categorias.find((c) => c.slug === params.categoria);
  if (!categoria) notFound();

  const cars = (await getCars()).filter((c) => c.estado !== "vendido" && categoria.filtro(c));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/" },
          { label: categoria.heroTitulo, href: `/coches-por-tipo/${categoria.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#7DC832" }}>
              {categoria.nombre}
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              {categoria.heroTitulo}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">{categoria.heroTexto}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-dark-900 hover:opacity-90 hover:scale-105 transition-all"
                style={{ backgroundColor: "#7DC832" }}
              >
                Hablar por WhatsApp
              </a>
              <a
                href={`tel:${siteSettings.telefono}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition-all"
              >
                <Phone className="w-5 h-5" />
                {siteSettings.telefono}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Garantía */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#7DC832" }} />
            <p className="text-slate-500 text-sm leading-relaxed">
              Todos los coches incluyen garantía mecánica de 12 meses y pasan una revisión de 80 puntos antes de la venta.
            </p>
          </div>
        </div>
      </section>

      {/* Stock */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-dark-900 mb-1">{categoria.nombre} disponibles</h2>
          <p className="text-slate-500 text-sm mb-8">Stock revisado en Barcelona. Visita con cita previa.</p>
          <CarGrid cars={cars} emptyMessage={categoria.emptyMessage} />
        </div>
      </section>
    </>
  );
}
