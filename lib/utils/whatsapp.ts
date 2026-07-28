import { siteSettings } from "@/lib/data/mockSettings";

export function generateWhatsAppUrl(message?: string): string {
  const phone = siteSettings.whatsapp;
  const encodedMessage = message
    ? encodeURIComponent(message)
    : encodeURIComponent(
        `Hola, me gustaría recibir más información sobre sus coches disponibles.`
      );
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function generateCarWhatsAppUrl(
  marca: string,
  modelo: string,
  año: number
): string {
  const message = `Hola, estoy interesado/a en el ${marca} ${modelo} ${año} que vi en vuestra web. ¿Podéis darme más información?`;
  return generateWhatsAppUrl(message);
}
