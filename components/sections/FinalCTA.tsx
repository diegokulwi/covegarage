"use client";

import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-dark-950 relative overflow-hidden">
      {/* Decorative line */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent, #7DC832, transparent)" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#7DC832" }}>
          ¿Listo para dar el paso?
        </p>
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5">
          Hablemos sin compromiso
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto font-sans normal-case tracking-normal">
          Tanto si quieres comprar como vender, estamos aquí para ayudarte. Contáctanos ahora y te respondemos de inmediato.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.open(generateWhatsAppUrl(), "_blank")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-dark-900 hover:opacity-90 transition-all"
            style={{ backgroundColor: "#7DC832" }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L0 24l6.338-1.503A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.034-1.378l-.361-.214-3.735.98.999-3.648-.235-.374A9.86 9.86 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.467 0 9.882 4.415 9.882 9.882 0 5.467-4.415 9.882-9.882 9.882z"/>
            </svg>
            WhatsApp ahora
          </button>
          <a
            href={`tel:${siteSettings.telefono}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition-all"
          >
            <Phone className="w-5 h-5" />
            {siteSettings.telefono}
          </a>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase tracking-wider text-slate-400 hover:text-white transition-all"
          >
            Formulario
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-slate-600 text-sm mt-8 font-sans normal-case tracking-normal">{siteSettings.horario}</p>
      </div>
    </section>
  );
}
