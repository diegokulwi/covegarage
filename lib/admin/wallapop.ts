/**
 * Texto de anuncio para Wallapop con la plantilla fija del negocio (apertura sin año ni km, viñetas estándar,
 * ITV, garantía, "Se puede ver y probar" y bloque de WhatsApp y llamadas). Funciones puras: sirven en el navegador.
 */
import type { Car } from "@/types/car";

const TELEFONOS = ["675 553 353", "647 138 383"];

const MARCA_CORTA: Record<string, string> = { Volkswagen: "VW", "Mercedes-Benz": "Mercedes" };
const marcaCorta = (m: string) => MARCA_CORTA[m] ?? m;

/** "1.2 TDI" a partir de una versión como "1.2 TDI Advance (75 CV)". */
function motor(version?: string): string {
  const m = (version ?? "").match(/\d[.,]\d\s*[A-Za-z][A-Za-z]*/);
  return m ? m[0].replace(",", ".").replace(/\s+/g, " ").toUpperCase() : "";
}

export function wallapopTitle(car: Car): string {
  const km = car.kilometraje.toLocaleString("es-ES");
  return [`${marcaCorta(car.marca)} ${car.modelo} ${motor(car.version)}`.replace(/\s+/g, " ").trim(), `${car.año}`, `${km} KM ITV`]
    .join(" · ")
    .toUpperCase();
}

// Cosas que la plantilla ya lleva siempre: no se repiten como viñetas propias del coche.
const ESTANDAR = /aire|climatizador|crucero|elevalunas|retrovisor|ordenador|etiqueta|mantenimiento|itv|garant/i;

export function wallapopDescription(car: Car, itv?: string): string {
  const nombre = [marcaCorta(car.marca), car.modelo, car.version?.replace(/\s*\([^)]*\)\s*/g, " ").trim()]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
  const cv = car.potencia ? ` de ${car.potencia} CV` : "";
  const apertura = `${nombre} en muy buen estado general, con mantenimiento al día y listo para disfrutar. Motor ${car.combustible}${cv}, muy económico y fiable.`;

  const propias = [
    ...car.extras?.map((e) => e.charAt(0).toUpperCase() + e.slice(1)) ?? [],
    ...(car.equipamiento ?? []).filter((e) => !ESTANDAR.test(e)),
    ...(car.segundoPropietario ? ["Segundo propietario"] : car.unicoPropietario ? ["Único propietario"] : []),
  ];
  const vistas = new Set<string>();
  const extra = propias.filter((p) => {
    const k = p.toLowerCase();
    if (vistas.has(k)) return false;
    vistas.add(k);
    return true;
  });

  const viñetas = [
    "Aire acondicionado",
    "Control crucero",
    "Elevalunas eléctricos delanteros",
    "Retrovisores eléctricos y calefactables",
    "Ordenador de a bordo",
    ...extra,
    car.etiqueta ? `Etiqueta medioambiental ${car.etiqueta}` : "Etiqueta medioambiental",
    "Mantenimiento al día",
    `ITV hasta ${itv?.trim() || "__/____"}`,
    "12 meses de garantía legal incluidos con posibilidad de ampliación a garantía premium disponible.",
  ];

  return [
    apertura,
    "",
    "🌟 Equipamiento destacado",
    "",
    ...viñetas.map((v) => `● ${v}`),
    "",
    "Se puede ver y probar en Barcelona. Se acepta revisión mecánica en taller para total tranquilidad del comprador.",
    "",
    "WhatsApp y llamadas:",
    "",
    ...TELEFONOS.map((t) => `📞 ${t}`),
  ].join("\n");
}
