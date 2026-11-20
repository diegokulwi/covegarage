/** Normalización de teléfonos y emails para reconocer a un mismo cliente aunque lo escriba distinto. */

/** Solo dígitos, sin el prefijo de España (+34 / 0034 / 34 delante de un número de 9 cifras). */
export function normPhone(phone: string): string {
  let d = (phone || "").replace(/\D/g, "");
  if (d.startsWith("0034")) d = d.slice(4);
  else if (d.length === 11 && d.startsWith("34")) d = d.slice(2);
  return d.length >= 6 ? d : "";
}

export function normEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

/** Número para wa.me: con prefijo de país (España por defecto si son 9 cifras). */
export function whatsappNumber(phone: string): string {
  const d = (phone || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) return d.slice(2);
  if (d.length === 9) return `34${d}`;
  return d;
}
