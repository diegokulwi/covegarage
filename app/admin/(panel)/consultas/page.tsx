import Link from "next/link";
import { listInbox } from "@/lib/admin/clients";
import { Badge, Card, Empty, PageHeader, dateTime } from "@/components/admin/ui";
import { InquiryActions, MarkAllRead } from "@/components/admin/InquiryTools";
import { INQUIRY_LABELS } from "@/types/lead";

export const dynamic = "force-dynamic";
export const metadata = { title: "Consultas" };

export default async function ConsultasPage({ searchParams }: { searchParams: { ver?: string } }) {
  const soloNuevas = searchParams.ver === "nuevas";
  const items = await listInbox({ onlyNew: soloNuevas, limit: 300 });
  const nuevas = items.filter((i) => i.is_new).length;

  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`h-9 px-3 inline-flex items-center rounded-lg text-sm font-medium ${
        active ? "bg-dark-900 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Consultas"
        subtitle="Lo que la gente te escribe desde los formularios de la web. Cada una crea o actualiza su ficha de cliente."
        actions={<MarkAllRead count={nuevas} />}
      />
      <div className="flex gap-2 mb-4">
        {tab("/consultas", "Todas", !soloNuevas)}
        {tab("/consultas?ver=nuevas", "Solo nuevas", soloNuevas)}
      </div>

      <Card>
        {items.length === 0 ? (
          <Empty
            title={soloNuevas ? "No hay consultas nuevas" : "Aún no hay consultas"}
            text="Cuando alguien rellene un formulario de la web, aparecerá aquí al momento (y te seguirá llegando el correo de siempre)."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((i) => (
              <li key={i.id} className={`flex items-start gap-3 px-4 sm:px-5 py-4 ${i.is_new ? "bg-emerald-50/40" : ""}`}>
                <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${i.is_new ? "bg-brand-500" : "bg-slate-200"}`} />
                <Link href={`/clientes/${i.client_id}`} className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{i.client_name || i.client_phone || i.client_email || "Sin nombre"}</span>
                    <Badge tone={i.source === "web" ? "blue" : "slate"}>{INQUIRY_LABELS[i.kind]}</Badge>
                    {i.car_label && <span className="text-sm text-slate-600">{i.car_label}</span>}
                  </span>
                  {i.message && <span className="block text-sm text-slate-600 mt-1 line-clamp-2 whitespace-pre-wrap">{i.message}</span>}
                  <span className="block text-xs text-slate-400 mt-1">
                    {[i.client_phone, i.client_email].filter(Boolean).join(" · ")}
                    {i.client_phone || i.client_email ? " · " : ""}
                    {dateTime(i.created_at)}
                  </span>
                </Link>
                <InquiryActions id={i.id} isNew={i.is_new} canDelete={false} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
