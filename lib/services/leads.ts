/**
 * Captura de consultas que llegan desde los formularios de la web (solo servidor).
 * Cada envío crea (o reconoce) al cliente por teléfono/email y guarda la consulta en la bandeja del panel.
 * Los formularios siguen mandando también el correo por Formspree; esto es la copia para el panel.
 */
import { createHash } from "node:crypto";
import { dbQuery } from "@/lib/db/schema";
import { query, withTransaction } from "@/lib/db";
import { normEmail, normPhone } from "@/lib/utils/contact";
import { WEB_LEAD_KINDS, WebLeadInput } from "@/types/lead";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function hashKey(value: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET || "cove-garage";
  return createHash("sha256").update(`${salt}|${value}`).digest("hex").slice(0, 32);
}

/** Cuenta cuántas veces se ha usado un cubo (bucket) con esa clave en los últimos `seconds` segundos. */
export async function countRecent(bucket: string, key: string, seconds: number): Promise<number> {
  const rows = await dbQuery<{ n: number }>(
    `select count(*)::int as n from rate_events where bucket = $1 and key = $2 and at > now() - ($3 || ' seconds')::interval`,
    [bucket, key, String(seconds)]
  );
  return rows[0]?.n ?? 0;
}

export async function addRateEvent(bucket: string, key: string): Promise<void> {
  await dbQuery("insert into rate_events (bucket, key) values ($1, $2)", [bucket, key]);
  // limpieza ocasional de eventos viejos
  if (Math.random() < 0.02) await query("delete from rate_events where at < now() - interval '2 days'");
}

export type LeadResult = { ok: true } | { ok: false; status: number; error: string };

export async function recordWebLead(raw: unknown, ip: string): Promise<LeadResult> {
  if (!raw || typeof raw !== "object") return { ok: false, status: 400, error: "datos no válidos" };
  const r = raw as Record<string, unknown>;

  const kind = r.kind as WebLeadInput["kind"];
  if (!WEB_LEAD_KINDS.includes(kind)) return { ok: false, status: 400, error: "tipo no válido" };

  const nombre = clip(r.nombre, 120);
  const email = clip(r.email, 200);
  const telefono = clip(r.telefono, 40);
  const mensaje = clip(r.mensaje, 4000);
  const carSlug = clip(r.carSlug, 200);
  const carLabel = clip(r.carLabel, 200);

  const extra: Record<string, string> = {};
  if (r.extra && typeof r.extra === "object") {
    for (const [k, v] of Object.entries(r.extra as Record<string, unknown>).slice(0, 20)) {
      const val = clip(v, 300);
      if (val) extra[clip(k, 60)] = val;
    }
  }

  const phoneNorm = normPhone(telefono);
  const emailNorm = normEmail(email);
  if (!phoneNorm && !emailNorm) return { ok: false, status: 400, error: "falta teléfono o email" };

  // Límite por IP: evita que alguien llene la bandeja de basura.
  const key = hashKey(ip || "desconocida");
  if ((await countRecent("lead", key, 600)) >= 8 || (await countRecent("lead", key, 86400)) >= 40) {
    return { ok: false, status: 429, error: "demasiados envíos" };
  }
  await addRateEvent("lead", key);

  await withTransaction(async (q) => {
    // Coche al que se refiere (si la dirección existe)
    let carId: string | null = null;
    if (carSlug) {
      const c = await q<{ id: string }>("select id from cars where slug = $1", [carSlug]);
      carId = c[0]?.id ?? null;
    }

    // ¿Ya conocemos a este cliente?
    const found = await q<{ id: number; name: string; phone: string; email: string }>(
      `select id, name, phone, email from clients
        where (phone_norm <> '' and phone_norm = $1) or (email_norm <> '' and email_norm = $2)
        order by id limit 1`,
      [phoneNorm, emailNorm]
    );

    let clientId: number;
    if (found[0]) {
      clientId = found[0].id;
      await q(
        `update clients set
           name = case when name = '' then $2 else name end,
           phone = case when phone = '' then $3 else phone end,
           phone_norm = case when phone_norm = '' then $4 else phone_norm end,
           email = case when email = '' then $5 else email end,
           email_norm = case when email_norm = '' then $6 else email_norm end,
           updated_at = now()
         where id = $1`,
        [clientId, nombre, telefono, phoneNorm, email, emailNorm]
      );
    } else {
      const ins = await q<{ id: number }>(
        `insert into clients (name, phone, phone_norm, email, email_norm, status, source)
         values ($1, $2, $3, $4, $5, 'nuevo', 'web') returning id`,
        [nombre, telefono, phoneNorm, email, emailNorm]
      );
      clientId = ins[0].id;
    }

    // Si es un reenvío idéntico (por ejemplo, el visitante reintentó), no se duplica.
    const dup = await q(
      `select 1 from inquiries
        where client_id = $1 and kind = $2 and coalesce(car_id, '') = $3 and message = $4
          and created_at > now() - interval '10 minutes' limit 1`,
      [clientId, kind, carId ?? "", mensaje]
    );
    if (dup.length > 0) return;

    await q(
      `insert into inquiries (client_id, kind, car_id, car_label, message, payload, source, is_new)
       values ($1, $2, $3, $4, $5, $6::jsonb, 'web', true)`,
      [clientId, kind, carId, carLabel, mensaje, JSON.stringify(extra)]
    );
  });

  return { ok: true };
}
