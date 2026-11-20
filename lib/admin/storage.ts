/**
 * Almacén de las fotos subidas desde el panel (solo servidor). Por orden de preferencia:
 *  1. Supabase Storage (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY; el almacén «coches» se crea solo la primera vez).
 *  2. Vercel Blob (BLOB_READ_WRITE_TOKEN).
 *  3. Solo en desarrollo: la carpeta public/uploads (no va a git).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

const supabaseUrl = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const supabaseKey = () => (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").trim();
const bucket = () => (process.env.SUPABASE_STORAGE_BUCKET || "coches").trim();

export const supabaseStorageConfigured = () => supabaseUrl() !== "" && supabaseKey() !== "";

// Clave antigua (service_role, un JWT) va también en Authorization; las nuevas («sb_secret_…») van solo en apikey.
function authHeaders(): Record<string, string> {
  const key = supabaseKey();
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}

async function ensureBucket(): Promise<void> {
  const res = await fetch(`${supabaseUrl()}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ id: bucket(), name: bucket(), public: true }),
  });
  if (!res.ok && res.status !== 400 && res.status !== 409) {
    throw new Error(`no se pudo crear el almacén (${res.status}): ${await res.text()}`);
  }
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string; status: number };

export async function uploadImage(file: File, folder: string, name: string): Promise<UploadResult> {
  if (supabaseStorageConfigured()) {
    try {
      const objectPath = `${folder}/${name}`;
      const body = Buffer.from(await file.arrayBuffer());
      const send = () =>
        fetch(`${supabaseUrl()}/storage/v1/object/${bucket()}/${objectPath}`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": file.type, "Cache-Control": "max-age=31536000", "x-upsert": "false" },
          body,
        });
      let res = await send();
      if (!res.ok && /bucket not found/i.test(await res.clone().text())) {
        await ensureBucket(); // la primera vez no existe el almacén
        res = await send();
      }
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return { ok: true, url: `${supabaseUrl()}/storage/v1/object/public/${bucket()}/${objectPath}` };
    } catch (e) {
      console.error("[upload] supabase:", e);
      return { ok: false, error: "No se pudo guardar la foto en Supabase. Revisa la dirección y la clave del proyecto.", status: 502 };
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`coches/${folder}/${name}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
      return { ok: true, url: blob.url };
    } catch (e) {
      console.error("[upload] blob:", e);
      return { ok: false, error: "No se pudo guardar la foto. Inténtalo de nuevo.", status: 502 };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return { ok: true, url: `/uploads/${folder}/${name}` };
  }

  return { ok: false, error: "Falta configurar el almacén de fotos (Supabase Storage) en el proyecto.", status: 503 };
}

const isBlobUrl = (u: string) => /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(u);

/** Ruta dentro del almacén de Supabase si la dirección es una foto de nuestro almacén; si no, null. */
function supabaseObjectPath(u: string): string | null {
  const prefix = `${supabaseUrl()}/storage/v1/object/public/${bucket()}/`;
  return supabaseUrl() && u.startsWith(prefix) ? decodeURIComponent(u.slice(prefix.length)) : null;
}

/** Borra del almacén las fotos que ya no se usan. Nunca debe romper la acción principal. */
export async function deleteImages(urls: string[]): Promise<void> {
  try {
    const supa = urls.map(supabaseObjectPath).filter((p): p is string => !!p);
    if (supa.length > 0 && supabaseStorageConfigured()) {
      await fetch(`${supabaseUrl()}/storage/v1/object/${bucket()}`, {
        method: "DELETE",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: supa }),
      });
    }
    const blobs = urls.filter(isBlobUrl);
    if (blobs.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) await del(blobs);
  } catch (e) {
    console.error("[storage] no se pudieron borrar fotos antiguas:", e);
  }
}
