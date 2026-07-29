import { Shield, FileCheck, Banknote, Handshake, RefreshCw, MapPin } from "lucide-react";
import { siteContent } from "@/lib/data/mockSettings";

const iconMap: Record<string, React.ElementType> = {
  Shield, FileCheck, Banknote, Handshake, RefreshCw, MapPin,
};

export default function Benefits() {
  const { beneficios } = siteContent;

  return (
    <section className="py-20 bg-dark-900 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7DC832" }}>
            Por qué elegirnos
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Confianza, Trato y Calidad
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-sans normal-case tracking-normal">
            Más de 5 años ofreciendo vehículos seleccionados con total transparencia y garantía real.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {beneficios.map((b) => {
            const Icon = iconMap[b.icono] || Shield;
            return (
              <div
                key={b.titulo}
                className="group p-6 rounded-xl border border-dark-600 bg-dark-800 hover:border-[#7DC832]/50 hover:bg-dark-700 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-dark-500 group-hover:border-[#7DC832]/50 transition-colors" style={{ backgroundColor: "rgba(125,200,50,0.1)" }}>
                  <Icon className="w-6 h-6" style={{ color: "#7DC832" }} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">{b.titulo}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-sans normal-case tracking-normal">{b.descripcion}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
