import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ShieldCheck, Banknote } from "lucide-react";
import Button from "@/components/ui/Button";

export default function BuySection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80"
              alt="Compra tu próximo coche"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Foto: Toyota Corolla blanco (Unsplash 73XAgT8DOpo). La tarjeta va arriba, sobre el cielo, para no tapar el coche. */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900/25 to-transparent" />
            <div className="absolute top-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-xs text-slate-500 mb-1">Precio medio de ahorro</p>
                <p className="text-2xl font-black text-dark-900">Hasta 8.000€</p>
                <p className="text-xs text-brand-600 font-medium">vs concesionario oficial</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
              Compra tu coche
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-dark-900 mb-5 leading-tight">
              Coches revisados, a un precio justo, sin letra pequeña
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Seleccionamos cada vehículo a mano. Nada entra en nuestro stock sin pasar una revisión exhaustiva. Tú solo eliges el que más te gusta.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Search, text: "Selección de vehículos verificados" },
                { icon: ShieldCheck, text: "Garantía mecánica incluida en todos los coches" },
                { icon: Banknote, text: "Precios transparentes, sin letra pequeña" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-brand-600" />
                  </div>
                  <p className="text-slate-600">{text}</p>
                </div>
              ))}
            </div>

            <Link href="/coches">
              <Button variant="primary" size="lg">
                Ver coches disponibles
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
