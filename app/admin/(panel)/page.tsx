import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { dashboardStats } from "@/lib/admin/stats";
import { listInbox } from "@/lib/admin/clients";
import { recentActivity } from "@/lib/admin/audit";
import { Badge, Card, CardTitle, Empty, PageHeader, dateTime, money } from "@/components/admin/ui";
import { INQUIRY_LABELS } from "@/types/lead";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resumen" };

function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: string; href?: string }) {
  const body = (
    <Card className="p-4 h-full hover:border-slate-300 transition-colors">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function DashboardPage() {
  const [s, inbox, activity] = await Promise.all([dashboardStats(), listInbox({ limit: 6 }), recentActivity(8)]);
  const fecha = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date());
  const hoy = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  return (
    <>
      <PageHeader title="Resumen" subtitle={hoy} />

      {(s.consultasNuevas > 0 || s.sinFotos > 0) && (
        <div className="space-y-2 mb-6">
          {s.consultasNuevas > 0 && (
            <Link
              href="/consultas"
              className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 hover:bg-emerald-100 transition-colors"
            >
              <span className="font-semibold">
                {s.consultasNuevas === 1 ? "Tienes 1 consulta nueva" : `Tienes ${s.consultasNuevas} consultas nuevas`}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          )}
          {s.sinFotos > 0 && (
            <Link
              href="/coches"
              className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>
                {s.sinFotos === 1 ? "1 coche a la venta no tiene fotos" : `${s.sinFotos} coches a la venta no tienen fotos`}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Stat label="Disponibles" value={s.disponibles} href="/coches?estado=disponible" />
        <Stat label="Reservados" value={s.reservados} href="/coches?estado=reservado" />
        <Stat label="Vendidos este año" value={s.vendidosAnio.n} hint={s.vendidosAnio.n ? money(s.vendidosAnio.total) : undefined} />
        <Stat label="Vendidos este mes" value={s.vendidosMes.n} hint={s.vendidosMes.n ? money(s.vendidosMes.total) : undefined} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Valor del stock" value={money(s.valorStock)} hint="Disponibles y reservados" />
        <Stat label="Consultas nuevas" value={s.consultasNuevas} href="/consultas" />
        <Stat label="Clientes" value={s.clientes} href="/clientes" />
        <Stat label="Coches vendidos (total)" value={s.vendidos} href="/coches?estado=vendido" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle
            action={
              <Link href="/consultas" className="text-xs font-semibold text-brand-700 hover:underline">
                Ver todas
              </Link>
            }
          >
            Últimas consultas
          </CardTitle>
          {inbox.length === 0 ? (
            <Empty title="Aún no hay consultas" text="Cuando alguien rellene un formulario de la web, aparecerá aquí." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {inbox.map((i) => (
                <li key={i.id}>
                  <Link href={`/clientes/${i.client_id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${i.is_new ? "bg-brand-500" : "bg-slate-200"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900 truncate">
                        {i.client_name || i.client_phone || i.client_email || "Sin nombre"}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {INQUIRY_LABELS[i.kind]}
                        {i.car_label ? ` · ${i.car_label}` : ""}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">{dateTime(i.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Actividad reciente</CardTitle>
          {activity.length === 0 ? (
            <Empty title="Sin actividad todavía" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge>{a.action}</Badge>
                    <span className="text-sm text-slate-700 truncate">
                      {a.entity}
                      {a.summary ? ` · ${a.summary}` : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {dateTime(a.at)} · {a.user_email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
