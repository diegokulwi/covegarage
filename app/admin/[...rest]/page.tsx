import { notFound } from "next/navigation";

// Cualquier dirección del panel que no exista muestra la página "no encontrada" del panel
// (y no la de la web pública).
export default function AdminCatchAll() {
  notFound();
}
