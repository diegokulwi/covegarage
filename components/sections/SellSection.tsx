import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, TrendingUp, Truck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SellSection() {
  return (
    <section className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3">
              Vende tu coche
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 leading-tight">
              Compramos tu coche al mejor precio del mercado
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Sin perder el tiempo con particulares ni esperar meses. Te damos una tasación honesta y pago al firmar.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Clock, text: "Tasación gratuita y pago al firmar" },
                { icon: TrendingUp, text: "Precios competitivos basados en el mercado actual" },
                { icon: Truck, text: "Recogemos el coche donde tú estés" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-600/20 border border-brand-600/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <p className="text-slate-300">{text}</p>
                </div>
              ))}
            </div>

            <Link href="/vender-coche">
              <Button variant="primary" size="lg">
                Solicitar tasación gratuita
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
              alt="Vende tu coche"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-dark-800/95 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-1">Sin complicaciones</p>
                <p className="text-2xl font-black text-white">Pago al firmar</p>
                <p className="text-xs text-brand-400 font-medium">Trato directo, sin intermediarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
