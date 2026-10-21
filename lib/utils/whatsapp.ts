import { siteSettings } from "@/lib/data/mockSettings";
import { trackEvent } from "@/lib/utils/analytics";
import { formatPrice } from "@/lib/utils/formatters";

const SITE_URL = "https://www.covegarage.com";

export function generateWhatsAppUrl(message?: string): string {
  const phone = siteSettings.whatsapp;
  const encodedMessage = message
    ? encodeURIComponent(message)
    : encodeURIComponent(
        `Hola, me gustaría recibir más información sobre sus coches disponibles.`
      );
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// Mensaje con el coche, el precio y el enlace a la ficha, para que se sepa
// de qué coche se habla y se proponga el siguiente paso (verlo).
export function generateCarWhatsAppUrl(
  marca: string,
  modelo: string,
  año: number,
  precio?: number,
  slug?: string
): string {
  const coche = `${marca} ${modelo} ${año}${precio ? ` (${formatPrice(precio)})` : ""}`;
  const enlace = slug ? `\n\n${SITE_URL}/coches/${slug}` : "";
  const message = `Hola, me interesa el ${coche} que vi en vuestra web. ¿Sigue disponible? ¿Podría verlo esta semana?${enlace}`;
  return generateWhatsAppUrl(message);
}

export function generateCarVideoWhatsAppUrl(
  marca: string,
  modelo: string,
  año: number,
  precio?: number,
  slug?: string
): string {
  const coche = `${marca} ${modelo} ${año}${precio ? ` (${formatPrice(precio)})` : ""}`;
  const enlace = slug ? `\n\n${SITE_URL}/coches/${slug}` : "";
  const message = `Hola, me interesa el ${coche}. ¿Me podéis enviar un vídeo del estado del coche?${enlace}`;
  return generateWhatsAppUrl(message);
}

// Abre WhatsApp y registra el clic en Analytics (placement = desde qué botón).
export function openWhatsApp(opts: { url?: string; placement: string; car?: string }) {
  trackEvent("whatsapp_click", { placement: opts.placement, car: opts.car });
  window.open(opts.url ?? generateWhatsAppUrl(), "_blank", "noopener,noreferrer");
}
