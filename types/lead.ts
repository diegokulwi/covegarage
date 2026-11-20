/** Tipos y etiquetas de clientes y consultas (compartidos entre la web, la API y el panel). */

/** De qué formulario o canal viene una consulta. */
export type InquiryKind =
  | "interes_coche"
  | "contacto"
  | "vender_coche"
  | "busqueda_coche"
  | "nota"
  | "llamada"
  | "whatsapp"
  | "visita"
  | "wallapop";

/** Formularios de la web que guardan consultas. */
export type WebLeadKind = "interes_coche" | "contacto" | "vender_coche" | "busqueda_coche";

export const WEB_LEAD_KINDS: WebLeadKind[] = ["interes_coche", "contacto", "vender_coche", "busqueda_coche"];

export const INQUIRY_LABELS: Record<InquiryKind, string> = {
  interes_coche: "Interés en un coche",
  contacto: "Formulario de contacto",
  vender_coche: "Quiere vender su coche",
  busqueda_coche: "Busca un coche",
  nota: "Nota",
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  visita: "Visita",
  wallapop: "Wallapop",
};

/** Tipos que se pueden anotar a mano desde el panel. */
export const MANUAL_INQUIRY_KINDS: InquiryKind[] = ["nota", "llamada", "whatsapp", "visita", "wallapop"];

export type ClientStatus = "nuevo" | "contactado" | "negociando" | "cliente" | "descartado";

export const CLIENT_STATUSES: { value: ClientStatus; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "negociando", label: "Negociando" },
  { value: "cliente", label: "Ha comprado" },
  { value: "descartado", label: "Descartado" },
];

export const CLIENT_SOURCES = ["web", "wallapop", "whatsapp", "telefono", "visita", "otro"] as const;
export type ClientSource = (typeof CLIENT_SOURCES)[number];

export const SOURCE_LABELS: Record<string, string> = {
  web: "Web",
  wallapop: "Wallapop",
  whatsapp: "WhatsApp",
  telefono: "Teléfono",
  visita: "Visita",
  manual: "Manual",
  otro: "Otro",
};

/** Lo que envían los formularios de la web a /api/leads. */
export interface WebLeadInput {
  kind: WebLeadKind;
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  carSlug?: string;
  carLabel?: string;
  extra?: Record<string, string>;
}
