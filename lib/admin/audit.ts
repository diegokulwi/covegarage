import { dbQuery } from "@/lib/db/schema";

/** Anota en el historial del panel qué se ha hecho (quién, cuándo y qué). Nunca debe romper la acción principal. */
export async function logAction(
  userEmail: string,
  action: string,
  entity: string,
  entityId: string | number,
  summary: string
): Promise<void> {
  try {
    await dbQuery(
      "insert into audit_log (user_email, action, entity, entity_id, summary) values ($1, $2, $3, $4, $5)",
      [userEmail, action, entity, String(entityId), summary.slice(0, 500)]
    );
  } catch (e) {
    console.error("[audit] no se pudo anotar:", e);
  }
}

export interface AuditRow {
  id: number;
  at: Date;
  user_email: string;
  action: string;
  entity: string;
  entity_id: string;
  summary: string;
}

export async function recentActivity(limit = 12): Promise<AuditRow[]> {
  return dbQuery<AuditRow>("select * from audit_log order by at desc, id desc limit $1", [limit]);
}
