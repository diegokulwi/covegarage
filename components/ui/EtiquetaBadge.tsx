import Image from "next/image";
import { EtiquetaType } from "@/types/car";

const ETIQUETA_IMG: Record<EtiquetaType, string | null> = {
  "0":            "/ETIQUETAS/CERO.jpg",
  "ECO":          "/ETIQUETAS/ECO.jpg",
  "C":            "/ETIQUETAS/C.jpg",
  "B":            "/ETIQUETAS/B.jpg",
  "Sin etiqueta": null,
};

const SIZES = { xs: 28, sm: 82, md: 106, lg: 140 };

interface EtiquetaBadgeProps {
  etiqueta: EtiquetaType;
  size?: "xs" | "sm" | "md" | "lg";
}

export default function EtiquetaBadge({ etiqueta, size = "sm" }: EtiquetaBadgeProps) {
  const src = ETIQUETA_IMG[etiqueta];
  const px = SIZES[size];

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={`Etiqueta medioambiental ${etiqueta}`}
      width={px}
      height={px}
      className="rounded-full object-cover"
      title={`Etiqueta medioambiental ${etiqueta}`}
    />
  );
}
