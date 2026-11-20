/**
 * Contenido editable de la web (preguntas frecuentes y reseñas), solo en el servidor.
 * Con base de datos lee de ahí (lo que edita el panel); sin ella, de lib/data/*.
 */
import { isDbConfigured } from "@/lib/db";
import { dbQuery } from "@/lib/db/schema";
import { faqs as defaultFaqs, FAQ } from "@/lib/data/faqs";
import { siteContent } from "@/lib/data/mockSettings";
import { SiteContent } from "@/types/settings";

export type Testimonio = SiteContent["testimonios"][number];

export async function getFaqs(): Promise<FAQ[]> {
  if (!isDbConfigured()) return defaultFaqs;
  const rows = await dbQuery<{ question: string; answer: string }>(
    "select question, answer from faqs where published order by position, id"
  );
  return rows.map((r) => ({ pregunta: r.question, respuesta: r.answer }));
}

export async function getTestimonios(): Promise<Testimonio[]> {
  if (!isDbConfigured()) return siteContent.testimonios;
  const rows = await dbQuery<{ name: string; text: string; rating: number; date_label: string }>(
    "select name, text, rating, date_label from testimonials where published order by position, id"
  );
  return rows.map((r) => ({ nombre: r.name, texto: r.text, puntuacion: r.rating, fecha: r.date_label }));
}
