import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured, query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * La llama una vez al día el cron de Vercel (vercel.json) con una consulta mínima, para que la base de datos de
 * Supabase (plan gratuito) no se «duerma» por inactividad. Si hay CRON_SECRET, lo exige; si no, solo acepta al cron de Vercel.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const allowed = secret
    ? req.headers.get("authorization") === `Bearer ${secret}`
    : (req.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (!allowed) return NextResponse.json({ ok: false }, { status: 401 });

  if (!isDbConfigured()) return NextResponse.json({ ok: true, db: false });
  try {
    await query("select 1");
    return NextResponse.json({ ok: true, db: true });
  } catch (e) {
    console.error("[keepalive] la base de datos no responde:", e);
    return NextResponse.json({ ok: false, db: false }, { status: 500 });
  }
}
