import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { adminFromRequest } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4_000_000; // el límite de una petición en Vercel es 4,5 MB: las fotos se reducen en el navegador antes de subirlas
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/** Sube una foto de un coche. Solo con sesión del panel. */
export async function POST(req: NextRequest) {
  const admin = await adminFromRequest();
  if (!admin) return fail("Sesión caducada. Vuelve a entrar.", 401);

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return fail("Origen no permitido.", 403);
    } catch {
      return fail("Origen no permitido.", 403);
    }
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("No se pudo leer la foto.", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail("Falta la foto.", 400);
  const ext = TYPES[file.type];
  if (!ext) return fail("Solo se admiten fotos JPG, PNG o WebP.", 400);
  if (file.size > MAX_BYTES) return fail("La foto pesa demasiado (máximo 4 MB).", 413);

  const folder = String(form.get("folder") ?? "coches")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "coches";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`coches/${folder}/${name}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      return NextResponse.json({ ok: true, url: blob.url });
    } catch (e) {
      console.error("[upload] blob:", e);
      return fail("No se pudo guardar la foto. Inténtalo de nuevo.", 502);
    }
  }

  // Solo en desarrollo (sin almacén de fotos configurado): se guarda en public/uploads.
  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true, url: `/uploads/${folder}/${name}` });
  }

  return fail("Falta configurar el almacén de fotos (Vercel Blob) en el proyecto.", 503);
}
