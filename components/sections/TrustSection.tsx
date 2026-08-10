import { Star } from "lucide-react";
import { siteContent } from "@/lib/data/mockSettings";

const STATS = [
  { value: "+100", label: "Coches vendidos" },
  { value: "+5", label: "Años de experiencia" },
  { value: "98%", label: "Clientes satisfechos" },
  { value: "30 días", label: "Tiempo medio de venta" },
];

export default function TrustSection() {
  const { testimonios } = siteContent;

  return (
    <section className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="bg-dark-800 rounded-2xl p-6 border border-dark-600 text-center">
              <p className="font-heading text-4xl font-bold mb-1" style={{ color: "#7DC832" }}>{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7DC832" }}>
            Testimonios
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: "#7DC832" }} />
              ))}
            </div>
            <span className="font-bold text-white">5.0</span>
            <span className="text-slate-500 text-sm font-sans normal-case tracking-normal">— +100 reseñas verificadas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonios.map((t) => (
            <div
              key={t.nombre}
              className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-[#7DC832]/30 transition-all"
            >
              <div className="flex mb-3">
                {[...Array(t.puntuacion)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#7DC832" }} />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4 font-sans normal-case tracking-normal">
                &ldquo;{t.texto}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-dark-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#7DC832]/30" style={{ backgroundColor: "rgba(125,200,50,0.1)" }}>
                    <span className="font-bold text-xs" style={{ color: "#7DC832" }}>{t.nombre[0]}</span>
                  </div>
                  <span className="font-semibold text-white text-sm">{t.nombre}</span>
                </div>
                {t.fecha && <span className="text-xs text-slate-600">{t.fecha}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
