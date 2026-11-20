/** Contraseñas con scrypt (incluido en Node, sin dependencias). Formato: scrypt$N$r$p$sal$hash (base64). */
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, { N: n, r, p, maxmem: 128 * n * r * 2 }, (err, key) =>
      err ? reject(err) : resolve(key as Buffer)
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P, KEYLEN);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [alg, n, r, p, saltB64, hashB64] = stored.split("$");
    if (alg !== "scrypt") return false;
    const expected = Buffer.from(hashB64, "base64");
    const key = await derive(password, Buffer.from(saltB64, "base64"), Number(n), Number(r), Number(p), expected.length);
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

// Hash de relleno para gastar el mismo tiempo cuando el email no existe (no revela qué emails hay).
let dummy: Promise<string> | null = null;
export function dummyHash(): Promise<string> {
  return (dummy ??= hashPassword("relleno-sin-uso-" + randomBytes(8).toString("hex")));
}

/** Reglas mínimas para la contraseña del panel. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 12) return "La contraseña debe tener al menos 12 caracteres.";
  if (pw.length > 200) return "La contraseña es demasiado larga.";
  if (/^(.)\1+$/.test(pw)) return "Elige una contraseña menos repetitiva.";
  return null;
}
