/** Clientes y consultas del panel (CRM sencillo): listar, crear, editar, anotar contactos y borrar. */
import { dbQuery } from "@/lib/db/schema";
import { withTransaction } from "@/lib/db";
import { logAction } from "@/lib/admin/audit";
import { normEmail, normPhone } from "@/lib/utils/contact";
import { CLIENT_STATUSES, ClientStatus, InquiryKind, MANUAL_INQUIRY_KINDS } from "@/types/lead";

export interface ClientRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: ClientStatus;
  source: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
  inquiry_count?: number;
  unread_count?: number;
  last_contact?: Date | null;
}

export interface InquiryRow {
  id: number;
  client_id: number;
  kind: InquiryKind;
  car_id: string | null;
  car_label: string;
  message: string;
  payload: Record<string, string>;
  source: string;
  is_new: boolean;
  created_at: Date;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
}

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function countUnreadInquiries(): Promise<number> {
  const r = await dbQuery<{ n: number }>("select count(*)::int as n from inquiries where is_new");
  return r[0]?.n ?? 0;
}

export async function listClients(opts: { q?: string; status?: string } = {}): Promise<ClientRow[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    params.push(`%${opts.q.toLowerCase()}%`);
    const digits = normPhone(opts.q);
    params.push(digits ? `%${digits}%` : "§sin-telefono§");
    where.push(`(lower(c.name) like $1 or c.email_norm like $1 or c.phone_norm like $2 or lower(c.notes) like $1)`);
  }
  if (opts.status && CLIENT_STATUSES.some((s) => s.value === opts.status)) {
    params.push(opts.status);
    where.push(`c.status = $${params.length}`);
  }
  return dbQuery<ClientRow>(
    `select c.*,
            (select count(*)::int from inquiries i where i.client_id = c.id) as inquiry_count,
            (select count(*)::int from inquiries i where i.client_id = c.id and i.is_new) as unread_count,
            (select max(i.created_at) from inquiries i where i.client_id = c.id) as last_contact
       from clients c
      ${where.length ? "where " + where.join(" and ") : ""}
      order by coalesce((select max(i.created_at) from inquiries i where i.client_id = c.id), c.created_at) desc, c.id desc
      limit 500`,
    params
  );
}

export async function getClient(id: number): Promise<ClientRow | null> {
  const r = await dbQuery<ClientRow>("select * from clients where id = $1", [id]);
  return r[0] ?? null;
}

export async function listClientInquiries(clientId: number): Promise<InquiryRow[]> {
  return dbQuery<InquiryRow>("select * from inquiries where client_id = $1 order by created_at desc, id desc", [clientId]);
}

/** Bandeja: consultas de todos los clientes, las nuevas primero. */
export async function listInbox(opts: { onlyNew?: boolean; limit?: number } = {}): Promise<InquiryRow[]> {
  return dbQuery<InquiryRow>(
    `select i.*, c.name as client_name, c.phone as client_phone, c.email as client_email
       from inquiries i join clients c on c.id = i.client_id
      ${opts.onlyNew ? "where i.is_new" : ""}
      order by i.is_new desc, i.created_at desc, i.id desc
      limit $1`,
    [opts.limit ?? 200]
  );
}

export async function markInquiryRead(id: number, isNew: boolean): Promise<void> {
  await dbQuery("update inquiries set is_new = $2 where id = $1", [id, isNew]);
}

export async function markClientInquiriesRead(clientId: number): Promise<void> {
  await dbQuery("update inquiries set is_new = false where client_id = $1 and is_new", [clientId]);
}

export async function markAllRead(): Promise<void> {
  await dbQuery("update inquiries set is_new = false where is_new");
}

export interface ClientInput {
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  source?: string;
  notes?: string;
}

function parseClient(raw: ClientInput) {
  const name = clip(raw.name, 120);
  const phone = clip(raw.phone, 40);
  const email = clip(raw.email, 200);
  const status = CLIENT_STATUSES.some((s) => s.value === raw.status) ? (raw.status as ClientStatus) : "nuevo";
  const source = clip(raw.source, 30) || "manual";
  const notes = clip(raw.notes, 8000);
  return { name, phone, email, status, source, notes, phoneNorm: normPhone(phone), emailNorm: normEmail(email) };
}

export async function createClient(
  raw: ClientInput,
  adminEmail: string
): Promise<{ ok: true; id: number } | { ok: false; error: string; existingId?: number }> {
  const c = parseClient(raw);
  if (!c.name && !c.phone && !c.email) return { ok: false, error: "Pon al menos un nombre, un teléfono o un email." };
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return { ok: false, error: "El email no parece válido." };

  const dup = await dbQuery<{ id: number; name: string }>(
    `select id, name from clients
      where (phone_norm <> '' and phone_norm = $1) or (email_norm <> '' and email_norm = $2) limit 1`,
    [c.phoneNorm, c.emailNorm]
  );
  if (dup[0]) {
    return {
      ok: false,
      error: `Ya existe un cliente con ese teléfono o email${dup[0].name ? `: ${dup[0].name}` : ""}.`,
      existingId: dup[0].id,
    };
  }
  const r = await dbQuery<{ id: number }>(
    `insert into clients (name, phone, phone_norm, email, email_norm, status, source, notes)
     values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
    [c.name, c.phone, c.phoneNorm, c.email, c.emailNorm, c.status, c.source, c.notes]
  );
  await logAction(adminEmail, "crear", "cliente", r[0].id, c.name || c.phone || c.email);
  return { ok: true, id: r[0].id };
}

export async function updateClient(id: number, raw: ClientInput, adminEmail: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = parseClient(raw);
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return { ok: false, error: "El email no parece válido." };
  const clash = await dbQuery<{ id: number }>(
    `select id from clients
      where id <> $1 and ((phone_norm <> '' and phone_norm = $2) or (email_norm <> '' and email_norm = $3)) limit 1`,
    [id, c.phoneNorm, c.emailNorm]
  );
  if (clash[0]) return { ok: false, error: "Otro cliente ya tiene ese teléfono o email." };
  await dbQuery(
    `update clients set name = $2, phone = $3, phone_norm = $4, email = $5, email_norm = $6,
            status = $7, source = $8, notes = $9, updated_at = now() where id = $1`,
    [id, c.name, c.phone, c.phoneNorm, c.email, c.emailNorm, c.status, c.source, c.notes]
  );
  await logAction(adminEmail, "editar", "cliente", id, c.name || c.phone || c.email);
  return { ok: true };
}

export async function deleteClient(id: number, adminEmail: string): Promise<void> {
  const c = await getClient(id);
  await withTransaction(async (q) => {
    await q("update cars set sold_client_id = null where sold_client_id = $1", [id]);
    await q("delete from clients where id = $1", [id]);
  });
  await logAction(adminEmail, "borrar", "cliente", id, c ? c.name || c.phone || c.email : "");
}

/** Anota un contacto a mano (llamada, WhatsApp, visita, nota…). */
export async function addManualInquiry(
  clientId: number,
  raw: { kind?: string; message?: string; carId?: string | null },
  adminEmail: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const kind = MANUAL_INQUIRY_KINDS.includes(raw.kind as InquiryKind) ? (raw.kind as InquiryKind) : "nota";
  const message = clip(raw.message, 4000);
  if (!message) return { ok: false, error: "Escribe qué ha pasado." };
  let carId: string | null = null;
  let carLabel = "";
  if (raw.carId) {
    const c = await dbQuery<{ id: string; data: { marca: string; modelo: string; año: number } }>(
      "select id, data from cars where id = $1",
      [raw.carId]
    );
    if (c[0]) {
      carId = c[0].id;
      carLabel = `${c[0].data.marca} ${c[0].data.modelo} ${c[0].data.año}`;
    }
  }
  await dbQuery(
    `insert into inquiries (client_id, kind, car_id, car_label, message, source, is_new) values ($1, $2, $3, $4, $5, 'manual', false)`,
    [clientId, kind, carId, carLabel, message]
  );
  await dbQuery("update clients set updated_at = now() where id = $1", [clientId]);
  await logAction(adminEmail, "anotar", "cliente", clientId, `${kind}: ${message.slice(0, 80)}`);
  return { ok: true };
}

export async function deleteInquiry(id: number): Promise<void> {
  await dbQuery("delete from inquiries where id = $1", [id]);
}
