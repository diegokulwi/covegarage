import { queryOne, query } from "@/lib/db";
import { ensureReady } from "@/lib/db/schema";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { logAction } from "@/lib/admin/audit";

export async function changePassword(
  adminId: number,
  email: string,
  current: string,
  next: string
): Promise<{ ok: true; password_hash: string } | { ok: false; error: string }> {
  await ensureReady();
  const row = await queryOne<{ password_hash: string }>("select password_hash from admin_users where id = $1", [adminId]);
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return { ok: false, error: "La contraseña actual no es correcta." };
  }
  const problem = passwordProblem(next);
  if (problem) return { ok: false, error: problem };
  if (next === current) return { ok: false, error: "La nueva contraseña debe ser distinta de la actual." };
  const password_hash = await hashPassword(next);
  await query("update admin_users set password_hash = $2 where id = $1", [adminId, password_hash]);
  await logAction(email, "cambiar contraseña", "cuenta", adminId, "");
  return { ok: true, password_hash };
}
