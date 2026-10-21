type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Envía un evento a Google Analytics 4. Si GA no está cargado, no hace nada. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  try {
    window.gtag("event", name, clean);
  } catch {
    // la analítica nunca debe romper la web
  }
}

/** Un formulario enviado con éxito cuenta como un contacto (lead). */
export function trackLead(form: string, params: EventParams = {}) {
  trackEvent("generate_lead", { form_name: form, ...params });
}
