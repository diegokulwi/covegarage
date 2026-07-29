import type { Metadata } from "next";
import Image from "next/image";
import { Award, Users, ThumbsUp, ShieldCheck } from "lucide-react";
import FinalCTA from "@/components/sections/FinalCTA";
import { siteSettings } from "@/lib/data/mockSettings";

export const metadata: Metadata = {
  title: "Sobre nosotros — Quiénes somos",
  description:
    "Somos especialistas en compra y venta de vehículos de segunda mano en Barcelona. Conoce nuestra historia y nuestros valores.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Transparencia total",
    description:
      "Nunca ocultamos información sobre un vehículo. Historial, kilómetros y estado real siempre disponibles.",
  },
  {
    icon: ThumbsUp,
    title: "Honestidad ante todo",
    description:
      "Si un coche no es para ti, te lo decimos. Preferimos un cliente satisfecho a una venta rápida.",
  },
  {
    icon: Award,
    title: "Calidad garantizada",
    description:
      "Cada vehículo pasa una revisión de 80 puntos antes de entrar en nuestro stock.",
  },
  {
    icon: Users,
    title: "Trato cercano",
    description:
      "Somos un equipo pequeño y comprometido. Aquí no eres un número, eres un cliente de por vida.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 bg-dark-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80')",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">
            Sobre nosotros
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
            Más de 5 años ayudando a encontrar el coche perfecto
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            En Cove Garage BCN seleccionamos cada coche a mano, con criterio y sin letra pequeña. Porque tu próxima compra merece confianza real, no promesas vacías.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              "Precios competitivos",
              "Coches listos para llevar",
              "Sin mareos",
              "Trato directo y rápido",
            ].map((frase) => (
              <span
                key={frase}
                className="px-4 py-2 rounded-full text-sm font-semibold border"
                style={{ borderColor: "#7DC832", color: "#7DC832" }}
              >
                {frase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
                Nuestra historia
              </p>
              <h2 className="text-3xl font-black text-dark-900 mb-6">
                Nuestra historia
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  {siteSettings.nombreEmpresa} nació en Barcelona con una idea clara: el mercado de coches de segunda mano necesitaba más honestidad y menos complicaciones.
                </p>
                <p>
                  Llevamos más de 5 años seleccionando a mano cada vehículo, comprobando su historial y revisando su estado mecánico antes de ponerlo a la venta. Sin sorpresas, sin letra pequeña.
                </p>
                <p>
                  No somos un gran concesionario. Somos un equipo pequeño y especializado que conoce cada coche de su stock y te asesora con criterio real, sin presiones y sin perder el tiempo.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80"
                alt="Nuestras instalaciones"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: "+50", label: "Coches vendidos" },
              { value: "+5", label: "Años de experiencia" },
              { value: "98%", label: "Clientes satisfechos" },
              { value: "15 días", label: "Tiempo medio de venta" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-8 border border-slate-100">
                <p className="text-4xl font-black text-brand-600 mb-1">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
              Nuestros valores
            </p>
            <h2 className="text-3xl font-black text-dark-900">
              Lo que nos diferencia
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="font-bold text-dark-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
