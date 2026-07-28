import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Car } from "@/types/car";
import CarGrid from "@/components/cars/CarGrid";

interface FeaturedCarsProps {
  cars: Car[];
}

export default function FeaturedCars({ cars }: FeaturedCarsProps) {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
              Selección premium
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-dark-900">
              Coches destacados
            </h2>
            <p className="text-slate-500 mt-2">
              Los vehículos más solicitados de nuestra selección actual.
            </p>
          </div>
          <Link
            href="/coches"
            className="flex items-center gap-2 font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            Ver todos los coches
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CarGrid cars={cars} />
      </div>
    </section>
  );
}
