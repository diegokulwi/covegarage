/**
 * Conexión a la base de datos (Postgres).
 * Solo se usa desde código de servidor (páginas, acciones y rutas API); nunca desde componentes "use client".
 *
 * Variables de entorno: DATABASE_URL (o POSTGRES_URL, que es el nombre que pone la integración de Neon en Vercel).
 * Si no hay ninguna, la web pública sigue funcionando con los datos de lib/data/* y el panel avisa de que falta la base de datos.
 */
import { Pool } from "pg";

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
    const p = new Pool({
      connectionString: dbUrl(),
      // En serverless cada instancia abre pocas conexiones y las suelta pronto.
      max: Number(process.env.DB_POOL_MAX || 4),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 20_000,
    });
    p.on("error", (e) => console.error("[db] error en conexión inactiva:", e.message));
    globalThis.__cgPool = p;
  }
  return globalThis.__cgPool;
}

export type Row = Record<string, any>;

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(text, params as any[]);
  return res.rows as T[];
}

export async function queryOne<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Ejecuta varias consultas dentro de una transacción. */
export async function withTransaction<T>(fn: (q: typeof query) => Promise<T>): Promise<T> {
  const client = await pool().connect();
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
