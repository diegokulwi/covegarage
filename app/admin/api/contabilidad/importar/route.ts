import { NextRequest, NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/auth/session";
import { parseAccountingWorkbook } from "@/lib/admin/accounting-import";
import { replaceLedger } from "@/lib/admin/accounting";
import { summarize } from "@/lib/admin/accounting-calc";
import { logAction } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4_000_000; // el límite de una petición en Vercel es 4,5 MB

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/** Importa el Excel de compra-venta: sustituye el libro diario guardado por el del archivo. Solo con sesión del panel. */
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
    return fail("No se pudo leer el archivo.", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail("Falta el archivo.", 400);
  if (!/\.xlsx$/i.test(file.name)) return fail("Sube el Excel en formato .xlsx.", 400);
  if (file.size > MAX_BYTES) return fail("El archivo pesa demasiado (máximo 4 MB).", 413);

  let parsed;
  try {
    parsed = await parseAccountingWorkbook(Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    console.error("[contabilidad] no se pudo leer el Excel:", e);
    return fail("No se pudo leer el Excel. ¿Está guardado como .xlsx y sin contraseña?", 400);
  }
  if (parsed.entries.length === 0) {
    return fail(parsed.warnings[0] ?? "No encontré movimientos en la hoja LIBRO DIARIO.", 400);
  }

  const cars = summarize(parsed.entries, parsed.vehicles).cars.length;
  await replaceLedger(parsed.entries, parsed.vehicles, { filename: file.name.slice(0, 120), by: admin.email, cars });
  await logAction(admin.email, "importar", "contabilidad", "", `${file.name.slice(0, 80)}: ${parsed.entries.length} movimientos`);
  return NextResponse.json({
    ok: true,
    entries: parsed.entries.length,
    cars,
    warnings: parsed.warnings,
  });
}
