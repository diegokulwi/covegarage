"use client";

import { Phone } from "lucide-react";
import { Car } from "@/types/car";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { formatCarTitle, formatPrice } from "@/lib/utils/formatters";
import { generateCarWhatsAppUrl } from "@/lib/utils/whatsapp";
import { siteSettings } from "@/lib/data/mockSettings";

// Barra fija inferior solo en móvil: WhatsApp y llamada siempre a mano en la ficha.
// Es "sticky" dentro de la ficha, así que no tapa el pie de página al llegar al final.
export default function MobileContactBar({ car }: { car: Car }) {
  if (car.estado !== "disponible") return null;

  const carName = formatCarTitle(car.marca, car.modelo, car.año);
  const whatsappUrl = generateCarWhatsAppUrl(car.marca, car.modelo, car.año, car.precio, car.slug);

  return (
    <div className="lg:hidden sticky bottom-0 z-40 bg-dark-900/95 backdrop-blur border-t border-dark-700 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2">
        <div className="shrink-0 pr-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 leading-none">Precio</p>
          <p className="text-lg font-black text-white leading-tight">{formatPrice(car.precio)}</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-track-placement="barra_movil"
          data-track-car={carName}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-bold text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <WhatsAppIcon />
          WhatsApp
        </a>
        <a
          href={`tel:${siteSettings.telefono}`}
          data-track-placement="barra_movil"
          data-track-car={carName}
          aria-label="Llamar"
          className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border border-white/20 text-white"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
