"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/utils/analytics";

// Registra en Analytics los clics en enlaces de WhatsApp (wa.me) y de teléfono (tel:)
// de toda la web, sin tocar cada botón. Los enlaces pueden indicar desde dónde se
// pulsan con data-track-placement y de qué coche con data-track-car.
export default function ContactTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const params = {
        placement: link.dataset.trackPlacement ?? "enlace",
        car: link.dataset.trackCar,
      };
      if (href.startsWith("https://wa.me/")) trackEvent("whatsapp_click", params);
      else if (href.startsWith("tel:")) trackEvent("phone_click", params);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
