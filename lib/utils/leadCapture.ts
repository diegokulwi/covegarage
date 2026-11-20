import type { WebLeadInput } from "@/types/lead";

/**
 * Manda una copia de la consulta al panel de administración (/api/leads).
 * Va aparte del envío por Formspree y nunca debe molestar al visitante: si falla, no pasa nada.
 */
export function captureLead(lead: WebLeadInput) {
  try {
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // el panel nunca debe romper un formulario
  }
}
