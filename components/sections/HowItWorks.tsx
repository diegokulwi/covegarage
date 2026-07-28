import { siteContent } from "@/lib/data/mockSettings";

export default function HowItWorks() {
  const { comoFunciona } = siteContent;

  return (
    <section className="py-20 bg-dark-800 border-y border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7DC832" }}>
            Proceso simple
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-slate-400 font-sans normal-case tracking-normal">
            Comprar tu próximo coche es más fácil de lo que crees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {comoFunciona.map((step, i) => (
            <div key={step.paso} className="relative">
              {/* Connector */}
              {i < comoFunciona.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0" style={{ background: "linear-gradient(90deg, #7DC832, transparent)" }} />
              )}
              <div className="relative z-10 bg-dark-700 border border-dark-600 rounded-xl p-6 hover:border-[#7DC832]/40 transition-all">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 border border-[#7DC832]/30" style={{ backgroundColor: "rgba(125,200,50,0.08)" }}>
                  <span className="font-heading text-3xl font-bold" style={{ color: "#7DC832" }}>{step.paso}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">{step.titulo}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-sans normal-case tracking-normal">{step.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
