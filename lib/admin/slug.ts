/** Direcciones de las fichas ("vw-polo-16-tdi-90cv-2011"). Función pura, sirve en navegador y servidor. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

const ABREVIATURAS: Record<string, string> = { Volkswagen: "vw", "Mercedes-Benz": "mercedes" };

/** Propone la dirección de una ficha como las de siempre: marca-modelo-motor-potencia-año. */
export function suggestSlug(d: { marca: string; modelo: string; version: string; potencia: string; año: string }): string {
  const marca = ABREVIATURAS[d.marca] ?? d.marca;
  const motor = (d.version.match(/\d[.,]\d\s*[A-Za-z][A-Za-z]*/)?.[0] ?? "").replace(/[.,]/g, "");
  const cv = d.potencia ? `${d.potencia}cv` : "";
  return slugify([marca, d.modelo, motor, cv, d.año].filter(Boolean).join(" "));
}
