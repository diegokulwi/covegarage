import { CheckCircle } from "lucide-react";
import CarRequestForm from "@/components/forms/CarRequestForm";

// Para quien no encuentra su coche en el stock: deja qué busca y su presupuesto.
export default function CarRequestSection() {
  return (
    <section id="busco-mi-coche" className="scroll-mt-24 py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
              ¿No encuentras tu coche?
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-dark-900 mb-4 leading-tight">
              Dinos qué coche quieres y te lo buscamos
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Cuéntanos el modelo y tu presupuesto. Te avisamos en cuanto entre uno parecido o lo
              buscamos por ti: coches nacionales o de importación bajo pedido de Europa.
            </p>
            <ul className="space-y-2.5">
              {[
                "Sin compromiso",
                "Respuesta en menos de 2 horas",
                "Coches revisados y con garantía de 12 meses",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#7DC832" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <CarRequestForm />
        </div>
      </div>
    </section>
  );
}
