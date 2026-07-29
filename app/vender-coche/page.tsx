import type { Metadata } from "next";
import { CheckCircle, Clock, TrendingUp, Phone, Banknote, FileCheck, ShieldCheck } from "lucide-react";
import SellCarForm from "@/components/forms/SellCarForm";
import FinalCTA from "@/components/sections/FinalCTA";
import { siteSettings } from "@/lib/data/mockSettings";

export const metadata: Metadata = {
  title: "Vender mi coche — Tasación gratuita y pago al firmar",
  description:
    "Compramos tu coche al mejor precio. Tasación gratuita, sin trámites y con pago al firmar. Si no llegamos a un acuerdo, te ofrecemos gestión de venta sin coste.",
};

const steps = [
  {
    step: 1,
    title: "Rellena el formulario",
    description: "Datos básicos de tu coche. Solo tarda 2 minutos.",
  },
  {
    step: 2,
    title: "Te llamamos y tasamos",
    description: "Analizamos tu coche y te hacemos una oferta real de compra directa.",
  },
  {
    step: 3,
    title: "Cerramos el trato",
    description: "Si la oferta te convence, firmamos y cobras al momento. Si no, te proponemos gestión de venta.",
  },
];

export default function VenderCochePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#7DC832" }}>
              Vende tu coche
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              Vender tu coche no{" "}
              <span style={{ color: "#7DC832" }}>tiene que ser un lío</span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-6">
              Te compramos el coche directamente, sin anuncios, sin esperas y sin tratar con desconocidos. Tasación gratuita y pago al firmar.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              ¿No llegamos a un acuerdo de precio? ¿No tienes apuro en vender? Sin problema — te ofrecemos gestión de venta y nos encargamos de todo.
            </p>
            <div className="flex flex-wrap gap-5">
              {[
                { icon: TrendingUp, text: "Precio de mercado real" },
                { icon: Banknote, text: "Pago al firmar" },
                { icon: FileCheck, text: "Nos encargamos de todos los trámites" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-300">
                  <Icon className="w-4 h-4" style={{ color: "#7DC832" }} />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pain points banner */}
      <section className="bg-dark-800 border-t border-dark-700 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-400 text-center">
            {[
              "Sin llamadas de desconocidos",
              "Sin publicar anuncios",
              "Sin regateos eternos",
              "Sin gastos ni comisiones",
              "Sin trámites complicados",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span style={{ color: "#7DC832" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-dark-900 mb-2">
                  Solicitar tasación gratuita
                </h2>
                <p className="text-slate-500 mb-6">
                  Rellena los datos y te contactamos con una oferta real de compra. Sin compromiso.
                </p>
                <SellCarForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Steps */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-dark-900 mb-5">¿Cómo funciona?</h3>
                <div className="space-y-5">
                  {steps.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div
                        className="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ backgroundColor: "#7DC832" }}
                      >
                        {s.step}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900 text-sm">{s.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call */}
              <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#7DC832" }}>
                <h3 className="font-bold mb-1">¿Prefieres hablar directamente?</h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Llámanos y en 5 minutos te damos una estimación por teléfono.
                </p>
                <a
                  href={`tel:${siteSettings.telefono}`}
                  className="flex items-center gap-2 font-bold text-white hover:opacity-80 transition-opacity"
                >
                  <Phone className="w-5 h-5" />
                  {siteSettings.telefono}
                </a>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-dark-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" style={{ color: "#7DC832" }} />
                  Nuestra promesa
                </h3>
                <ul className="space-y-2.5">
                  {[
                    "Tasación gratuita y sin compromiso",
                    "Oferta de compra directa o gestión de venta",
                    "Pago seguro al firmar",
                    "Sin gastos ni comisiones ocultas",
                    "Nos encargamos de todos los trámites",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#7DC832" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
