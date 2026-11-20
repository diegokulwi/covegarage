import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { listClients } from "@/lib/admin/clients";
import { Badge, Card, Empty, LinkBtn, PageHeader, dateOnly, inputClass } from "@/components/admin/ui";
import { CLIENT_STATUSES, SOURCE_LABELS } from "@/types/lead";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes" };

const tone = { nuevo: "blue", contactado: "amber", negociando: "violet", cliente: "green", descartado: "slate" } as const;

export default async function ClientesPage({ searchParams }: { searchParams: { q?: string; estado?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const estado = searchParams.estado ?? "";
  const clients = await listClients({ q, status: estado });

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Quien te escribe por la web se guarda solo. También puedes añadir a mano a quien te contacta por Wallapop, WhatsApp o teléfono."
        actions={
          <LinkBtn href="/clientes/nuevo">
            <Plus className="w-4 h-4" /> Añadir cliente
          </LinkBtn>
        }
      />

      <form className="flex flex-col sm:flex-row gap-3 mb-4" action="/clientes">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input name="q" defaultValue={q} className={inputClass + " pl-9"} placeholder="Buscar por nombre, teléfono, email o notas…" />
        </div>
        <select name="estado" defaultValue={estado} className={inputClass + " sm:w-48"}>
          <option value="">Todos los estados</option>
          {CLIENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="h-10 px-4 rounded-lg bg-dark-900 text-white text-sm font-semibold hover:bg-dark-700">Buscar</button>
      </form>

      <Card>
        {clients.length === 0 ? (
          <Empty
            title={q || estado ? "Ningún cliente coincide" : "Aún no hay clientes"}
            text={q || estado ? "Prueba con otra búsqueda." : "Cuando alguien rellene un formulario de la web aparecerá aquí, o puedes añadirlo tú."}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {clients.map((c) => (
              <li key={c.id}>
                <Link href={`/clientes/${c.id}`} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold">
                    {(c.name || c.phone || c.email || "?").trim()[0]?.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">{c.name || "Sin nombre"}</span>
                      {(c.unread_count ?? 0) > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-500 text-dark-900 text-xs font-bold flex items-center justify-center">
                          {c.unread_count}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {[c.phone, c.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                    </span>
                  </span>
                  <span className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <Badge tone={tone[c.status]}>{CLIENT_STATUSES.find((s) => s.value === c.status)?.label}</Badge>
                    <span className="text-xs text-slate-400">
                      {SOURCE_LABELS[c.source] ?? c.source} · {dateOnly(c.last_contact ?? c.created_at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
