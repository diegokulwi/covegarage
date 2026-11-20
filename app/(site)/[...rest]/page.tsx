import { notFound } from "next/navigation";

// Recoge cualquier dirección que no exista en la web pública para que la página "no encontrada"
// salga con la cabecera y el pie de siempre (si no, Next pinta una 404 sin el marco de la web).
export default function CatchAll() {
  notFound();
}
