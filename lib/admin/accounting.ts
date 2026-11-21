/**
 * Libro diario en la base de datos: se sustituye entero cada vez que se sube el Excel (el Excel es la fuente).
 * Aparte (tabla acc_links, que NO se toca al subir el Excel) van los enlaces matrícula → coche de la web y los
 * coches en gestión de venta con su precio acordado.
 */
import { dbQuery, ensureReady } from "@/lib/db/schema";
import { withTransaction } from "@/lib/db";
import { logAction } from "@/lib/admin/audit";
import { listAdminCars } from "@/lib/admin/cars";
import { normPlate, PLATE_RE } from "@/lib/admin/plate";
import type { LedgerEntry, LedgerVehicle } from "@/lib/admin/accounting-import";
import type { Link, WebCar } from "@/lib/admin/accounting-calc";

export interface ImportInfo {
  at: string;
  filename: string;
  entries: number;
  cars: number;
  by: string;
}

export async function replaceLedger(
  entries: LedgerEntry[],
  vehicles: LedgerVehicle[],
  meta: { filename: string; by: string; cars: number }
): Promise<void> {
  await ensureReady(); // crea las tablas de contabilidad si la base de datos aún está en la versión anterior
  await withTransaction(async (q) => {
    await q("delete from acc_entries");
    await q("delete from acc_vehicles");

    for (let i = 0; i < entries.length; i += 100) {
      const chunk = entries.slice(i, i + 100);
      const params: unknown[] = [];
      const rows = chunk.map((e, k) => {
        const b = params.length;
        params.push(i + k, e.num, e.fecha, e.concepto, e.coche, e.categoria, e.tipo, e.quien, e.importe, e.observaciones);
        return `($${b + 1}, $${b + 2}, $${b + 3}::date, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8}, $${b + 9}, $${b + 10})`;
      });
      await q(
        `insert into acc_entries (position, num, fecha, concepto, coche, categoria, tipo, quien, importe, observaciones)
         values ${rows.join(", ")}`,
        params
      );
    }

    for (const v of vehicles) {
      await q(
        `insert into acc_vehicles (plate, nombre, fecha_compra) values ($1, $2, $3::date)
         on conflict (plate) do update set nombre = excluded.nombre, fecha_compra = excluded.fecha_compra`,
        [v.plate, v.nombre, v.fechaCompra]
      );
    }

    const info: ImportInfo = {
      at: new Date().toISOString(),
      filename: meta.filename,
      entries: entries.length,
      cars: meta.cars,
      by: meta.by,
    };
    await q(
      `insert into app_meta (key, value) values ('accounting_import', $1::jsonb)
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [JSON.stringify(info)]
    );
  });
}

export async function loadLedger(): Promise<{ entries: LedgerEntry[]; vehicles: LedgerVehicle[]; info: ImportInfo | null }> {
  const [entries, vehicles, meta] = await Promise.all([
    dbQuery<LedgerEntry>(
      `select num, fecha::text as fecha, concepto, coche, categoria, tipo, quien, importe::float8 as importe, observaciones
         from acc_entries order by fecha, position`
    ),
    dbQuery<{ plate: string; nombre: string; fechaCompra: string | null }>(
      `select plate, nombre, fecha_compra::text as "fechaCompra" from acc_vehicles`
    ),
    dbQuery<{ value: ImportInfo }>("select value from app_meta where key = 'accounting_import'"),
  ]);
  return { entries, vehicles, info: meta[0]?.value ?? null };
}

// ---------- enlaces con la web y coches en gestión ----------

type Result = { ok: true } | { ok: false; error: string };

/** Importe escrito a mano: «6000», «6.000», «6000,50», «6.000,50 €». */
export function parseAmount(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v ?? "").replace(/[€\s]/g, "");
  if (s === "") return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Coches de la web con su precio de venta actual (para el desplegable y para el beneficio bruto previsto). */
export async function loadWebCars(): Promise<WebCar[]> {
  const cars = await listAdminCars();
  return cars.map((c) => ({
    id: c.id,
    nombre: `${c.marca} ${c.modelo} ${c.año}`,
    km: c.kilometraje,
    precio: c.precio,
    estado: c.estado,
    slug: c.slug,
  }));
}

export async function loadLinks(): Promise<Link[]> {
  return dbQuery<Link>(`select plate, car_id as "carId", kind, agreed_price::float8 as agreed from acc_links`);
}

/** Enlaza una matrícula del Excel con un coche de la web (o quita el enlace si carId va vacío). */
export async function linkWebCar(plate: string, carId: string, adminEmail: string): Promise<Result> {
  const p = normPlate(plate);
  if (!PLATE_RE.test(p)) return { ok: false, error: "Matrícula no válida." };
  if (carId) {
    const car = await dbQuery<{ data: { marca: string; modelo: string; año: number } }>("select data from cars where id = $1", [carId]);
    if (!car[0]) return { ok: false, error: "Ese coche de la web ya no existe." };
    await dbQuery(
      `insert into acc_links (plate, car_id) values ($1, $2)
       on conflict (plate) do update set car_id = excluded.car_id, updated_at = now()`,
      [p, carId]
    );
    const c = car[0].data;
    await logAction(adminEmail, "enlazar coche", "contabilidad", p, `${p} = ${c.marca} ${c.modelo} ${c.año}`);
  } else {
    await dbQuery("update acc_links set car_id = null, updated_at = now() where plate = $1", [p]);
    await dbQuery("delete from acc_links where plate = $1 and car_id is null and kind = '' and agreed_price is null", [p]);
    await logAction(adminEmail, "quitar enlace", "contabilidad", p, p);
  }
  return { ok: true };
}

/** Da de alta (o corrige) un coche en gestión de venta: coche de la web, matrícula y precio acordado con el dueño. */
export async function saveGestionCar(
  raw: { plate?: string; carId?: string; agreed?: number | string },
  adminEmail: string
): Promise<Result> {
  const plate = normPlate(raw.plate ?? "");
  if (!PLATE_RE.test(plate)) return { ok: false, error: "Escribe la matrícula (por ejemplo 1234ABC)." };
  const carId = String(raw.carId ?? "");
  if (!carId) return { ok: false, error: "Elige el coche de la web." };
  const agreed = parseAmount(raw.agreed);
  if (agreed === null || agreed < 0 || agreed > 1_000_000) {
    return { ok: false, error: "Escribe el precio acordado con el dueño, en euros (por ejemplo 6000)." };
  }
  const car = await dbQuery<{ data: { marca: string; modelo: string; año: number } }>("select data from cars where id = $1", [carId]);
  if (!car[0]) return { ok: false, error: "Ese coche de la web ya no existe." };

  await dbQuery(
    `insert into acc_links (plate, car_id, kind, agreed_price) values ($1, $2, 'gestion', $3)
     on conflict (plate) do update
       set car_id = excluded.car_id, kind = 'gestion', agreed_price = excluded.agreed_price, updated_at = now()`,
    [plate, carId, Math.round(agreed * 100) / 100]
  );
  const c = car[0].data;
  await logAction(adminEmail, "coche en gestión", "contabilidad", plate, `${plate} = ${c.marca} ${c.modelo} ${c.año}, acordado ${agreed} €`);
  return { ok: true };
}

/** Quita un coche en gestión dado de alta a mano (no toca el Excel). */
export async function removeGestionCar(plate: string, adminEmail: string): Promise<Result> {
  const p = normPlate(plate);
  if (!PLATE_RE.test(p)) return { ok: false, error: "Matrícula no válida." };
  await dbQuery("delete from acc_links where plate = $1 and kind = 'gestion'", [p]);
  await logAction(adminEmail, "quitar coche en gestión", "contabilidad", p, p);
  return { ok: true };
}
