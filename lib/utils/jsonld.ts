/**
 * JSON para meter dentro de un <script type="application/ld+json">. Se escapa "<" para que un texto con
 * "</script>" (por ejemplo, en una pregunta frecuente editada desde el panel) nunca pueda cerrar la etiqueta.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
