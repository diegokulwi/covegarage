"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-dark-950">
      {/* Background image oscura */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')",
        }}
      />
      {/* Overlay muy oscuro para legibilidad */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.85) 55%, rgba(5,5,5,0.4) 100%)" }} />

      {/* Línea verde decorativa izquierda */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent, #7DC832, transparent)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl">

          {/* Título principal estilo COVE */}
          <h1 className="font-heading font-extrabold leading-none mb-2 text-white" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            VENDEMOS
          </h1>
          <h1 className="font-heading font-extrabold leading-none mb-6" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", color: "#7DC832" }}>
            TU PRÓXIMO
          </h1>
          <h1 className="font-heading font-extrabold leading-none mb-8 text-white" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            COCHE
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-xl font-sans normal-case tracking-normal">
            Coches nacionales e importación bajo pedido de toda Europa. Garantía 12 meses, trato personalizado y total transparencia.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/coches"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-dark-900 hover:opacity-90 hover:scale-105 transition-all"
              style={{ backgroundColor: "#7DC832" }}
            >
              Ver coches disponibles
            </Link>
            <button
              onClick={() => window.open(generateWhatsAppUrl(), "_blank")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L0 24l6.338-1.503A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.034-1.378l-.361-.214-3.735.98.999-3.648-.235-.374A9.86 9.86 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.467 0 9.882 4.415 9.882 9.882 0 5.467-4.415 9.882-9.882 9.882z" />
              </svg>
              Hablar por WhatsApp
            </button>
          </div>

          {/* Quick search */}
          <div className="flex flex-wrap gap-2 mt-10">
            {[
              { label: "SUVs", href: "/coches" },
              { label: "Hasta 10.000€", href: "/coches" },
              { label: "Automáticos", href: "/coches" },
              { label: "Cabrio", href: "/coches" },
              { label: "Ver todos →", href: "/coches" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-full text-xs font-semibold border border-white/20 text-slate-300 hover:border-[#7DC832] hover:text-[#7DC832] transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10 mt-10 pt-8 border-t border-white/10">
            {[
              { value: "+100", label: "Coches vendidos" },
              { value: "+5", label: "Años de experiencia" },
              { value: "98%", label: "Clientes satisfechos" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-4xl font-bold" style={{ color: "#7DC832" }}>{stat.value}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-sans normal-case">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
