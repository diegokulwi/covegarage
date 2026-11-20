/** Reseñas y preguntas frecuentes editables desde el panel. Cada cambio refresca la web al momento. */
import { revalidatePath } from "next/cache";
import { dbQuery } from "@/lib/db/schema";
import { withTransaction } from "@/lib/db";
import { logAction } from "@/lib/admin/audit";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const refresh = () => revalidatePath("/", "layout"); // reseñas y preguntas no afectan al sitemap

export interface TestimonialRow {
  id: number;
  position: number;
  name: string;
  text: string;
  rating: number;
  date_label: string;
  published: boolean;
}

export interface FaqRow {
  id: number;
  position: number;
  question: string;
  answer: string;
  published: boolean;
}

type Ok = { ok: true } | { ok: false; error: string };

// ---------- reseñas ----------

export const listTestimonials = () =>
  dbQuery<TestimonialRow>("select * from testimonials order by position, id");

export async function saveTestimonial(
  raw: { id?: number; name?: string; text?: string; rating?: number; date_label?: string; published?: boolean },
  adminEmail: string
): Promise<Ok> {
  const name = clip(raw.name, 80);
  const text = clip(raw.text, 1200);
  const rating = Math.min(5, Math.max(1, Math.round(Number(raw.rating ?? 5)) || 5));
  if (!name) return { ok: false, error: "Falta el nombre." };
  if (!text) return { ok: false, error: "Falta el comentario." };
  const date_label = clip(raw.date_label, 40);
  const published = raw.published !== false;

  if (raw.id) {
    await dbQuery(
      "update testimonials set name = $2, text = $3, rating = $4, date_label = $5, published = $6 where id = $1",
      [raw.id, name, text, rating, date_label, published]
    );
  } else {
    await dbQuery(
      `insert into testimonials (position, name, text, rating, date_label, published)
       values ((select coalesce(max(position), -1) + 1 from testimonials), $1, $2, $3, $4, $5)`,
      [name, text, rating, date_label, published]
    );
  }
  await logAction(adminEmail, raw.id ? "editar" : "crear", "reseña", raw.id ?? "", name);
  refresh();
  return { ok: true };
}

export async function deleteTestimonial(id: number, adminEmail: string): Promise<void> {
  await dbQuery("delete from testimonials where id = $1", [id]);
  await logAction(adminEmail, "borrar", "reseña", id, "");
  refresh();
}

// ---------- preguntas frecuentes ----------

export const listFaqs = () => dbQuery<FaqRow>("select * from faqs order by position, id");

export async function saveFaq(
  raw: { id?: number; question?: string; answer?: string; published?: boolean },
  adminEmail: string
): Promise<Ok> {
  const question = clip(raw.question, 300);
  const answer = clip(raw.answer, 3000);
  if (!question) return { ok: false, error: "Falta la pregunta." };
  if (!answer) return { ok: false, error: "Falta la respuesta." };
  const published = raw.published !== false;

  if (raw.id) {
    await dbQuery("update faqs set question = $2, answer = $3, published = $4 where id = $1", [
      raw.id,
      question,
      answer,
      published,
    ]);
  } else {
    await dbQuery(
      `insert into faqs (position, question, answer, published)
       values ((select coalesce(max(position), -1) + 1 from faqs), $1, $2, $3)`,
      [question, answer, published]
    );
  }
  await logAction(adminEmail, raw.id ? "editar" : "crear", "pregunta", raw.id ?? "", question);
  refresh();
  return { ok: true };
}

export async function deleteFaq(id: number, adminEmail: string): Promise<void> {
  await dbQuery("delete from faqs where id = $1", [id]);
  await logAction(adminEmail, "borrar", "pregunta", id, "");
  refresh();
}

/** Sube o baja un elemento de la lista (se renumera todo para que el orden quede limpio). */
export async function moveItem(table: "faqs" | "testimonials", id: number, dir: "up" | "down"): Promise<void> {
  await withTransaction(async (q) => {
    const rows = await q<{ id: number }>(`select id from ${table} order by position, id`);
    const i = rows.findIndex((r) => r.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (let k = 0; k < rows.length; k++) {
      await q(`update ${table} set position = $2 where id = $1`, [rows[k].id, k]);
    }
  });
  refresh();
}
