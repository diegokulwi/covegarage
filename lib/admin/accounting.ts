/** Libro diario en la base de datos: se sustituye entero cada vez que se sube el Excel (el Excel es la fuente). */
import { dbQuery, ensureReady } from "@/lib/db/schema";
import { withTransaction } from "@/lib/db";
import type { LedgerEntry, LedgerVehicle } from "@/lib/admin/accounting-import";

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
