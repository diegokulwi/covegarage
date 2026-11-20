"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { isDbConfigured, query, queryOne, withTransaction } from "@/lib/db";
import { ensureReady } from "@/lib/db/schema";
import { dummyHash, hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { sessionConfigured, startSession } from "@/lib/auth/session";
import { addRateEvent, countRecent, hashKey } from "@/lib/services/leads";
import { logAction } from "@/lib/admin/audit";

type Result = { ok: true } | { ok: false; error: string };

const clientIp = () => {
  const h = headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "desconocida";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(emailRaw: string, password: string): Promise<Result> {
  if (!isDbConfigured()) return { ok: false, error: "Falta configurar la base de datos." };
  if (!sessionConfigured()) return { ok: false, error: "Falta configurar la clave de sesión del panel." };
  await ensureReady();

  const email = String(emailRaw ?? "").trim().toLowerCase().slice(0, 200);
  const ipKey = hashKey("ip|" + clientIp());
  const emailKey = hashKey("em|" + email);

  // Freno a la fuerza bruta: pocos fallos por IP y por email.
  if ((await countRecent("login_fail_ip", ipKey, 900)) >= 8 || (await countRecent("login_fail_email", emailKey, 3600)) >= 10) {
    return { ok: false, error: "Demasiados intentos. Espera unos minutos y vuelve a probar." };
  }

  const user = await queryOne<{ id: number; email: string; password_hash: string }>(
    "select id, email, password_hash from admin_users where email = $1",
    [email]
  );
  // Siempre se calcula un hash (aunque el email no exista) para no delatar qué emails hay.
  const good = await verifyPassword(String(password ?? "").slice(0, 300), user?.password_hash ?? (await dummyHash()));
  if (!user || !good) {
    await addRateEvent("login_fail_ip", ipKey);
    await addRateEvent("login_fail_email", emailKey);
    return { ok: false, error: "Email o contraseña incorrectos." };
  }

  await query("update admin_users set last_login_at = now() where id = $1", [user.id]);
  await startSession(user);
  await logAction(user.email, "entrar", "sesión", user.id, "");
  return { ok: true };
}

const sha = (s: string) => createHash("sha256").update(s).digest();

/** Primer acceso: solo funciona mientras no exista ningún usuario y con el código de instalación del servidor. */
export async function setupAction(input: { email: string; password: string; confirm: string; token: string }): Promise<Result> {
  if (!isDbConfigured()) return { ok: false, error: "Falta configurar la base de datos." };
  if (!sessionConfigured()) return { ok: false, error: "Falta configurar la clave de sesión del panel." };
  await ensureReady();

  const expected = process.env.ADMIN_SETUP_TOKEN || "";
  if (expected.length < 16) return { ok: false, error: "Falta configurar el código de instalación en el servidor." };

  const ipKey = hashKey("ip|" + clientIp());
  if ((await countRecent("setup_fail", ipKey, 900)) >= 6) {
    return { ok: false, error: "Demasiados intentos. Espera unos minutos." };
  }
  if (!timingSafeEqual(sha(String(input.token ?? "").trim()), sha(expected))) {
    await addRateEvent("setup_fail", ipKey);
    return { ok: false, error: "El código de instalación no es correcto." };
  }

  const email = String(input.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "El email no parece válido." };
  if (input.password !== input.confirm) return { ok: false, error: "Las dos contraseñas no coinciden." };
  const problem = passwordProblem(String(input.password ?? ""));
  if (problem) return { ok: false, error: problem };

  const hash = await hashPassword(input.password);
  const created = await withTransaction(async (q) => {
    await q("select pg_advisory_xact_lock(727002)");
    const n = await q<{ n: number }>("select count(*)::int as n from admin_users");
    if ((n[0]?.n ?? 0) > 0) return null;
    const r = await q<{ id: number }>("insert into admin_users (email, password_hash) values ($1, $2) returning id", [
      email,
      hash,
    ]);
    return r[0].id;
  });
  if (created === null) return { ok: false, error: "Ya hay un acceso creado. Entra con tu email y contraseña." };

  await startSession({ id: created, password_hash: hash });
  await logAction(email, "crear acceso", "cuenta", created, "primer acceso");
  return { ok: true };
}
