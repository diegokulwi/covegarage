/**
 * Ajustes de la conexión a Postgres a partir de DATABASE_URL (sin imports: se puede probar suelta).
 *
 *  - En local (127.0.0.1 / localhost): sin SSL.
 *  - Supabase: SSL cifrado, pero sin comprobar la cadena de certificados (la firma una CA propia de Supabase que Node
 *    no conoce y haría fallar la conexión desde Vercel).
 *  - Cualquier otro servidor (Neon, etc.): SSL con comprobación completa.
 *
 * Se quitan sslmode/ssl… del texto de conexión porque `pg` da prioridad a lo que venga en la URL sobre el resto.
 */
export interface PoolSettings {
  connectionString: string;
  ssl: false | { rejectUnauthorized: boolean };
}

export function poolSettings(rawUrl: string): PoolSettings {
  let host = "";
  let connectionString = rawUrl;
  try {
    const u = new URL(rawUrl);
    host = u.hostname.toLowerCase();
    for (const k of ["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert", "uselibpqcompat"]) u.searchParams.delete(k);
    connectionString = u.toString();
  } catch {
    // dirección rara: se usa tal cual
  }

  const local = host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  if (local) return { connectionString, ssl: false };

  const supabase = host.endsWith(".supabase.com") || host.endsWith(".supabase.co") || host.endsWith(".supabase.net");
  return { connectionString, ssl: { rejectUnauthorized: !supabase } };
}
