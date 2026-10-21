import { Clock, ShieldCheck, Star } from "lucide-react";
import { GOOGLE_REVIEWS_URL } from "@/lib/data/links";

// Línea de confianza junto a los botones de contacto.
export default function TrustRow({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 ${className}`}>
      <li>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#5a9a1a] transition-colors"
        >
          <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#7DC832" }} />
          5,0 en Google
        </a>
      </li>
      <li className="inline-flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#7DC832" }} />
        Garantía de 12 meses
      </li>
      <li className="inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" style={{ color: "#7DC832" }} />
        Respuesta en menos de 2 h
      </li>
    </ul>
  );
}
