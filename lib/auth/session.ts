/**
 * Sesión del panel: cookie firmada (HMAC) con el usuario y una huella de su contraseña.
 * Al cambiar la contraseña la huella cambia y las demás sesiones abiertas dejan de valer.
 * La comprobación se hace en cada página y acción (no solo en el middleware).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dbUrl, isDbConfigured, queryOne } from "@/lib/db";
import { ensureReady } from "@/lib/db/schema";

const MAX_AGE_SECONDS = 14 * 24 * 60 * 60; // 14 días
const IS_PROD = process.env.NODE_ENV === "production";
// En producción la cookie lleva el prefijo __Host- (solo para este dominio, solo https).
export const COOKIE_NAME = IS_PROD ? "__Host-cg_admin" : "cg_admin";

export interface AdminUser {
  id: number;
  email: string;
}

/**
 * Clave con la que se firman las sesiones. Si no se pone ADMIN_SESSION_SECRET (32+ caracteres), se deriva de la
 * conexión a la base de datos, que ya es un secreto largo y único: quien la tuviera ya podría tocar la base de datos.
 */
function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || "";
  if (s.length >= 32) return s;
  const db = dbUrl();
  if (db) return createHmac("sha256", "cove-garage-admin-session").update(db).digest("hex");
  throw new Error("Falta ADMIN_SESSION_SECRET o la conexión a la base de datos.");
}

export function sessionConfigured(): boolean {
  return (process.env.ADMIN_SESSION_SECRET || "").length >= 32 || isDbConfigured();
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (data: string) => createHmac("sha256", secret()).update(data).digest();

/** Huella de la contraseña guardada: cambia al cambiar la contraseña. */
function pwFingerprint(passwordHash: string): string {
  return createHmac("sha256", secret()).update("pw|" + passwordHash).digest("base64url").slice(0, 16);
}

function sign(payload: { uid: number; pwv: string; exp: number }): string {
  const body = b64u(JSON.stringify(payload));
  return `${body}.${b64u(mac(body))}`;
}

function verify(token: string): { uid: number; pwv: string; exp: number } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = mac(body);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof p.uid !== "number" || typeof p.pwv !== "string" || typeof p.exp !== "number") return null;
    if (p.exp < Date.now() / 1000) return null;
    return p;
  } catch {
    return null;
  }
}

export async function startSession(user: { id: number; password_hash: string }): Promise<void> {
  const token = sign({
    uid: user.id,
    pwv: pwFingerprint(user.password_hash),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function endSession(): void {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, secure: IS_PROD, sameSite: "lax", path: "/", maxAge: 0 });
}

/** Usuario con sesión válida, o null. */
export async function getAdmin(): Promise<AdminUser | null> {
  if (!sessionConfigured() || !isDbConfigured()) return null;
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const p = verify(token);
  if (!p) return null;
  await ensureReady();
  const u = await queryOne<{ id: number; email: string; password_hash: string }>(
    "select id, email, password_hash from admin_users where id = $1",
    [p.uid]
  );
  if (!u || pwFingerprint(u.password_hash) !== p.pwv) return null;
  return { id: u.id, email: u.email };
}

/** Para páginas y acciones del panel: sin sesión válida, manda al login. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return admin;
}

/** Para rutas API: devuelve el usuario o null (la ruta responde 401). */
export async function adminFromRequest(): Promise<AdminUser | null> {
  try {
    return await getAdmin();
  } catch {
    return null;
  }
}
