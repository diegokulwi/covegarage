import { notFound } from "next/navigation";
import { getClient, listClientInquiries } from "@/lib/admin/clients";
import { listAdminCars } from "@/lib/admin/cars";
import { Badge, Card, CardTitle, Empty, PageHeader, dateTime } from "@/components/admin/ui";
import ClientForm from "@/components/admin/ClientForm";
import { InquiryActions, InquiryComposer, MarkRead } from "@/components/admin/InquiryTools";
import { INQUIRY_LABELS } from "@/types/lead";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cliente" };

export default async function ClientePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const client = await getClient(id);
  if (!client) notFound();
  const [inquiries, cars] = await Promise.all([listClientInquiries(id), listAdminCars()]);

  return (
    <>
      <MarkRead clientId={id} hasNew={inquiries.some((i) => i.is_new)} />
      <PageHeader
        title={client.name || client.phone || client.email || "Cliente sin datos"}
        subtitle={`Cliente desde ${dateTime(client.created_at)}`}
      />
      <div className="grid xl:grid-cols-5 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <ClientForm client={client} />
          <InquiryComposer clientId={id} cars={cars.map((c) => ({ id: c.id, label: `${c.marca} ${c.modelo} ${c.año}` }))} />
        </div>

        <Card className="xl:col-span-3">
          <CardTitle>Historial ({inquiries.length})</CardTitle>
          {inquiries.length === 0 ? (
            <Empty title="Sin historial" text="Aquí aparecerán sus mensajes de la web y lo que anotes tú." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {inquiries.map((i) => (
                <li key={i.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <Badge tone={i.source === "web" ? "blue" : "slate"}>{INQUIRY_LABELS[i.kind]}</Badge>
                      {i.is_new && <Badge tone="green">Nueva</Badge>}
                      {i.car_label && <span className="text-sm font-medium text-slate-700">{i.car_label}</span>}
                    </div>
                    <InquiryActions id={i.id} isNew={i.is_new} />
                  </div>
                  {i.message && <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{i.message}</p>}
                  {Object.keys(i.payload ?? {}).length > 0 && (
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {Object.entries(i.payload).map(([k, v]) => (
                        <div key={k} className="flex gap-1.5">
                          <dt className="text-slate-400">{k}:</dt>
                          <dd className="text-slate-700">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{dateTime(i.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
