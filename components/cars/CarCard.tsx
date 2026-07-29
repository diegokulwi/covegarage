import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Calendar, Settings2 } from "lucide-react";
import { Car } from "@/types/car";
import { StatusBadge } from "@/components/ui/Badge";
import EtiquetaBadge from "@/components/ui/EtiquetaBadge";
import { formatPrice, formatKm } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface CarCardProps {
  car: Car;
  className?: string;
}

export default function CarCard({ car, className }: CarCardProps) {
  const isAvailable = car.estado === "disponible";

  return (
    <Link href={`/coches/${car.slug}`} className={cn("group block", className)}>
      <article className="bg-dark-800 rounded-xl overflow-hidden border border-dark-600 hover:border-[#7DC832]/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-dark-700">
          {car.imagenes[0] ? (
            <Image
              src={car.imagenes[0]}
              alt={`${car.marca} ${car.modelo} ${car.año}`}
              fill
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-105",
                !isAvailable && "grayscale-[40%]"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dark-500">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <StatusBadge status={car.estado} />
          </div>

          {/* Overlay reservado / vendido */}
          {car.estado !== "disponible" && (
            <div className={`absolute inset-0 flex items-center justify-center ${car.estado === "vendido" ? "bg-black/50" : "bg-black/35"}`}>
              <span className={`px-5 py-2 rounded-lg text-white font-black text-xl uppercase tracking-widest rotate-[-15deg] border-4 ${
                car.estado === "vendido"
                  ? "border-red-500 text-red-400 bg-black/60"
                  : "border-amber-400 text-amber-300 bg-black/60"
              }`}>
                {car.estado === "vendido" ? "Vendido" : "Reservado"}
              </span>
            </div>
          )}

        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#7DC832" }}>
              {car.marca}
            </p>
            <h3 className="font-heading text-xl font-bold text-white leading-tight group-hover:text-[#7DC832] transition-colors">
              {car.modelo}
              {car.version && (
                <span className="text-slate-500 font-normal text-base ml-1 normal-case">{car.version}</span>
              )}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{car.año}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Gauge className="w-3.5 h-3.5 shrink-0" />
              <span>{formatKm(car.kilometraje)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs capitalize">
              <Fuel className="w-3.5 h-3.5 shrink-0" />
              <span>{car.combustible}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs capitalize">
              <Settings2 className="w-3.5 h-3.5 shrink-0" />
              <span>{car.transmision}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-dark-600">
            <p className="font-heading text-2xl font-bold text-white">
              {car.estado === "vendido" ? "Vendido" : formatPrice(car.precio)}
            </p>
            <span className="text-xs font-bold uppercase tracking-wider group-hover:underline" style={{ color: "#7DC832" }}>
              Ver ficha →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
