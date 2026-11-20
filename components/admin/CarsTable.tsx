"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, MessageSquare, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { AdminCar } from "@/lib/admin/cars";
import type { CarStatus } from "@/types/car";
import { ESTADO_LABELS, ESTADOS } from "@/lib/admin/car-options";
import { deleteCarAction, duplicateCarAction, quickUpdateCarAction } from "@/app/admin/actions";
import { Badge, Btn, Card, Empty, Field, LinkBtn, Notice, dateOnly, inputClass, money } from "@/components/admin/ui";
import WallapopDialog from "@/components/admin/WallapopDialog";

type ClientOption = { id: number; name: string; phone: string };

const estadoTone = { disponible: "green", reservado: "amber", vendido: "slate" } as const;

function EditableNumber({
  value,
  format,
  suffix,
  onCommit,
  label,
}: {
  value: number;
  format: (n: number) => string;
  suffix?: string;
  onCommit: (n: number) => Promise<void>;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);

  const commit = async () => {
    const n = Number(draft.replace(/[^\d]/g, ""));
    setEditing(false);
    if (!Number.isFinite(n) || n === value) return;
    setSaving(true);
    await onCommit(n);
    setSaving(false);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        aria-label={label}
        inputMode="numeric"
        className="w-24 h-8 rounded-md border border-brand-500 px-2 text-sm ring-2 ring-brand-500/30 focus:outline-none"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
      />
    );
  }
  return (
    <button
      type="button"
      title={`Cambiar ${label.toLowerCase()}`}
      disabled={saving}
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="text-sm font-medium text-slate-900 hover:bg-slate-100 rounded-md px-1.5 py-1 -mx-1.5 transition-colors disabled:opacity-50"
    >
      {saving ? "Guardando…" : format(value)}
      {suffix && !saving ? <span className="text-slate-400 font-normal"> {suffix}</span> : null}
    </button>
  );
}

function SaleDialog({
  car,
  clients,
  onCancel,
  onConfirm,
}: {
  car: AdminCar;
  clients: ClientOption[];
  onCancel: () => void;
  onConfirm: (sale: { price: number | null; date: string; clientId: number | null }) => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [price, setPrice] = useState(String(car.precio));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [clientId, setClientId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog ref={ref} onClose={onCancel} className="rounded-2xl p-0 w-[min(440px,94vw)] backdrop:bg-black/50 text-slate-900">
      <form
        method="dialog"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onConfirm({
            price: price.trim() === "" ? null : Number(price.replace(/[^\d]/g, "")),
            date,
            clientId: clientId ? Number(clientId) : null,
          });
        }}
      >
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-bold">Marcar como vendido</h2>
          <p className="text-sm text-slate-500">
            {car.marca} {car.modelo} {car.año}
          </p>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Precio final de venta (€)" hint="Para tus cuentas. No se muestra en la web.">
            <input className={inputClass} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Fecha de la venta">
            <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Comprador (opcional)">
            <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">— Sin indicar —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.phone || `Cliente ${c.id}`}
                  {c.name && c.phone ? ` · ${c.phone}` : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <Btn variant="ghost" onClick={() => ref.current?.close()} disabled={saving}>
            Cancelar
          </Btn>
          <Btn type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Marcar vendido"}
          </Btn>
        </div>
      </form>
    </dialog>
  );
}

function RowMenu({ car, onWallapop, onDuplicate, onDelete }: { car: AdminCar; onWallapop: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const item = "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50";
  const done = () => {
    if (ref.current) ref.current.open = false;
  };
  return (
    <details ref={ref} className="relative">
      <summary className="list-none cursor-pointer p-2 rounded-lg text-slate-500 hover:bg-slate-100 [&::-webkit-details-marker]:hidden" aria-label="Más acciones">
        <MoreVertical className="w-4 h-4" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
        <Link href={`/coches/${car.id}`} className={item}>
          <Pencil className="w-4 h-4 text-slate-400" /> Editar
        </Link>
        <a href={`https://www.covegarage.com/coches/${car.slug}`} target="_blank" rel="noopener noreferrer" className={item}>
          <ExternalLink className="w-4 h-4 text-slate-400" /> Ver en la web
        </a>
        <button type="button" className={item} onClick={() => { done(); onWallapop(); }}>
          <MessageSquare className="w-4 h-4 text-slate-400" /> Texto de Wallapop
        </button>
        <button type="button" className={item} onClick={() => { done(); onDuplicate(); }}>
          <Copy className="w-4 h-4 text-slate-400" /> Duplicar
        </button>
        <button type="button" className={item + " text-red-600 hover:bg-red-50"} onClick={() => { done(); onDelete(); }}>
          <Trash2 className="w-4 h-4" /> Borrar
        </button>
      </div>
    </details>
  );
}

export default function CarsTable({
  cars,
  clients,
  initialEstado,
}: {
  cars: AdminCar[];
  clients: ClientOption[];
  initialEstado: string;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<string>(ESTADOS.includes(initialEstado as CarStatus) ? initialEstado : "todos");
  const [error, setError] = useState("");
  const [sale, setSale] = useState<AdminCar | null>(null);
  const [wallapop, setWallapop] = useState<AdminCar | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: cars.length, disponible: 0, reservado: 0, vendido: 0 };
    cars.forEach((x) => c[x.estado]++);
    return c;
  }, [cars]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const order = (e: string) => (e === "disponible" ? 0 : e === "reservado" ? 1 : 2);
    return cars
      .filter((c) => (estado === "todos" ? true : c.estado === estado))
      .filter((c) => !needle || `${c.marca} ${c.modelo} ${c.version ?? ""} ${c.año} ${c.slug}`.toLowerCase().includes(needle))
      .sort((a, b) => order(a.estado) - order(b.estado) || b.fechaPublicacion.localeCompare(a.fechaPublicacion) || Number(b.id) - Number(a.id));
  }, [cars, q, estado]);

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError("");
    const r = await fn();
    if (!r.ok) setError(r.error || "No se pudo guardar.");
    start(() => router.refresh());
  };

  const quick = (id: string, patch: Parameters<typeof quickUpdateCarAction>[1]) => run(() => quickUpdateCarAction(id, patch));

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={inputClass + " pl-9"} placeholder="Buscar por marca, modelo, año…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {(["todos", ...ESTADOS] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEstado(e)}
              className={`h-10 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                estado === e ? "bg-dark-900 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {e === "todos" ? "Todos" : ESTADO_LABELS[e]} <span className="opacity-60">{counts[e]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Notice tone="red">{error}</Notice>
        </div>
      )}

      <Card>
        {rows.length === 0 ? (
          <Empty
            title={cars.length === 0 ? "Aún no hay coches" : "Ningún coche coincide"}
            text={cars.length === 0 ? "Añade el primero con el botón de arriba." : "Prueba con otra búsqueda o con otro filtro."}
            action={cars.length === 0 ? <LinkBtn href="/coches/nuevo"><Plus className="w-4 h-4" /> Añadir coche</LinkBtn> : undefined}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((c) => (
              <li key={c.id} className="p-3 sm:p-4 flex flex-col xl:flex-row xl:items-center gap-3">
                <div className="flex items-center gap-3 xl:w-[38%] min-w-0">
                  <Link href={`/coches/${c.id}`} className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    {c.imagenes[0] ? (
                      <Image src={c.imagenes[0]} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">Sin foto</span>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/coches/${c.id}`} className="block font-semibold text-slate-900 truncate hover:underline">
                      {c.marca} {c.modelo} {c.año}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {c.version || "—"} · {c.imagenes.length} {c.imagenes.length === 1 ? "foto" : "fotos"}
                      {c.estado === "vendido" && c.soldAt ? ` · vendido el ${dateOnly(c.soldAt)}${c.soldPrice ? ` por ${money(c.soldPrice)}` : ""}` : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 xl:flex xl:flex-1 xl:items-center gap-3 items-center">
                  <div className="xl:w-28">
                    <p className="xl:hidden text-[11px] uppercase tracking-wide text-slate-400">Precio</p>
                    <EditableNumber label="Precio" value={c.precio} format={money} onCommit={(n) => quick(c.id, { precio: n })} />
                  </div>
                  <div className="xl:w-32">
                    <p className="xl:hidden text-[11px] uppercase tracking-wide text-slate-400">Kilómetros</p>
                    <EditableNumber label="Kilómetros" value={c.kilometraje} format={(n) => n.toLocaleString("es-ES")} suffix="km" onCommit={(n) => quick(c.id, { kilometraje: n })} />
                  </div>
                  <div>
                    <p className="xl:hidden text-[11px] uppercase tracking-wide text-slate-400">Estado</p>
                    <select
                      aria-label="Estado"
                      value={c.estado}
                      onChange={(e) => {
                        const next = e.target.value as CarStatus;
                        if (next === "vendido") setSale(c);
                        else void quick(c.id, { estado: next });
                      }}
                      className="h-8 rounded-full border-0 text-xs font-semibold px-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                      style={{
                        background: c.estado === "disponible" ? "#d1fae5" : c.estado === "reservado" ? "#fef3c7" : "#e2e8f0",
                        color: c.estado === "disponible" ? "#065f46" : c.estado === "reservado" ? "#92400e" : "#475569",
                      }}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {ESTADO_LABELS[e]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between xl:justify-end gap-2">
                  <Badge tone={estadoTone[c.estado]} className="xl:hidden">
                    Publicado {dateOnly(c.fechaPublicacion)}
                  </Badge>
                  <RowMenu
                    car={c}
                    onWallapop={() => setWallapop(c)}
                    onDuplicate={() =>
                      void run(async () => {
                        const r = await duplicateCarAction(c.id);
                        if (r.ok) router.push(`/coches/${r.id}`);
                        return r;
                      })
                    }
                    onDelete={() => {
                      if (window.confirm(`¿Borrar ${c.marca} ${c.modelo} ${c.año} para siempre?\n\nDesaparece de la web y no se puede deshacer. Si solo se ha vendido, mejor márcalo como «Vendido».`)) {
                        void run(() => deleteCarAction(c.id));
                      }
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {sale && (
        <SaleDialog
          car={sale}
          clients={clients}
          onCancel={() => {
            setSale(null);
            start(() => router.refresh()); // el desplegable vuelve a su valor real
          }}
          onConfirm={async (s) => {
            await quick(sale.id, { estado: "vendido", sale: s });
            setSale(null);
          }}
        />
      )}
      {wallapop && <WallapopDialog car={wallapop} onClose={() => setWallapop(null)} />}
    </>
  );
}
