/**
 * Conexión a la base de datos (Postgres).
 * Solo se usa desde código de servidor (páginas, acciones y rutas API); nunca desde componentes "use client".
 *
 * Variables de entorno: DATABASE_URL (o POSTGRES_URL). Con Supabase: la cadena del «Transaction pooler».
 * Si no hay ninguna, la web pública sigue funcionando con los datos de lib/data/* y el panel avisa de que falta la base de datos.
 */
import { Pool } from "pg";
import { poolSettings } from "@/lib/db/config";

declare global {
  // eslint-disable-next-line no-var
  var __cgPool: Pool | undefined;
}

export function dbUrl(): string {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function isDbConfigured(): boolean {
  return dbUrl() !== "";
}

function pool(): Pool {
  if (!globalThis.__cgPool) {
    const settings = poolSettings(dbUrl());
    const p = new Pool({
      connectionString: settings.connectionString,
      ssl: settings.ssl,
      // En serverless cada instancia abre pocas conexiones y las suelta pronto. Al construir la web hay varios
      // procesos a la vez, así que se usan aún menos para no saturar la base de datos.
      max: process.env.NEXT_PHASE === "phase-production-build" ? 2 : Number(process.env.DB_POOL_MAX || 3),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 20_000,
    });
    p.on("error", (e) => console.error("[db] error en conexión inactiva:", e.message));
    globalThis.__cgPool = p;
  }
  return globalThis.__cgPool;
}

export type Row = Record<string, any>;

/**
 * Errores que ocurren ANTES de ejecutar nada (la base de datos está saturada o arrancando): se reintenta con una
 * pequeña espera. Los fallos durante una consulta no se reintentan para no repetir escrituras.
 */
function isBusyError(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return (
    err?.code === "53300" || // demasiadas conexiones
    err?.code === "57P03" || // la base de datos está arrancando
    err?.code === "ECONNREFUSED" ||
    /timeout exceeded when trying to connect/i.test(err?.message ?? "")
  );
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= 4 || !isBusyError(e)) throw e;
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt + Math.random() * 250));
    }
  }
}

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await withRetry(() => pool().query(text, params as any[]));
  return res.rows as T[];
}

export async function queryOne<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Ejecuta varias consultas dentro de una transacción. */
export async function withTransaction<T>(fn: (q: typeof query) => Promise<T>): Promise<T> {
  const client = await withRetry(() => pool().connect());
  try {
    await client.query("begin");
    const q = async <R extends Row = Row>(text: string, params: unknown[] = []) =>
      (await client.query(text, params as any[])).rows as R[];
    const out = await fn(q as typeof query);
    await client.query("commit");
    return out;
  } catch (e) {
    try {
      await client.query("rollback");
    } catch {
      /* ya se cerró */
    }
    throw e;
  } finally {
    client.release();
  }
}
