import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { recordWebLead } from "@/lib/services/leads";

export const dynamic = "force-dynamic";

/**
 * Recibe las consultas de los formularios de la web y las guarda para el panel de administración.
 * Es una copia de seguridad "en segundo plano": los formularios siguen enviando el correo por Formspree,
 * así que si esto falla el visitante no se entera y no pierde nada.
 */
export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ ok: false, error: "sin base de datos" }, { status: 503 });

  // Solo desde la propia web (mismo origen).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ ok: false }, { status: 403 });
    } catch {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 20_000) return NextResponse.json({ ok: false }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "json no válido" }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";

  try {
    const r = await recordWebLead(body, ip);
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[leads] error al guardar:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
