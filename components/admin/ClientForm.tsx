"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Phone, Trash2 } from "lucide-react";
import type { ClientRow } from "@/lib/admin/clients";
import { CLIENT_SOURCES, CLIENT_STATUSES, SOURCE_LABELS } from "@/types/lead";
import { createClientAction, deleteClientAction, updateClientAction } from "@/app/admin/actions";
import { Btn, Card, CardTitle, Field, LinkBtn, Notice, inputClass, textareaClass } from "@/components/admin/ui";
import { whatsappNumber } from "@/lib/utils/contact";

export default function ClientForm({ client }: { client?: ClientRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    status: client?.status ?? "nuevo",
    source: client?.source ?? "wallapop",
    notes: client?.notes ?? "",
  });
  const set = (k: keyof typeof f, v: string) => {
    setSaved(false);
    setF((s) => ({ ...s, [k]: v }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      if (client) {
        const r = await updateClientAction(client.id, f);
        if (r.ok) {
          setSaved(true);
          router.refresh();
        } else setError(r.error);
      } else {
        const r = await createClientAction(f);
        if (r.ok) router.push(`/clientes/${r.id}`);
        else if (r.existingId) setError(r.error + " Búscalo en la lista de clientes.");
        else setError(r.error);
      }
    });
  };

  const wa = whatsappNumber(f.phone);
  const contactBtn = "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <Card>
      <CardTitle>{client ? "Datos del cliente" : "Nuevo cliente"}</CardTitle>
      <form onSubmit={submit} className="p-5 space-y-4">
        {error && <Notice tone="red">{error}</Notice>}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre">
            <input className={inputClass} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <input className={inputClass} inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Estado">
              <select className={inputClass} value={f.status} onChange={(e) => set("status", e.target.value)}>
                {CLIENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Viene de">
              <select className={inputClass} value={f.source} onChange={(e) => set("source", e.target.value)}>
                {[...CLIENT_SOURCES, "manual"].filter((v, i, a) => a.indexOf(v) === i).map((s) => (
                  <option key={s} value={s}>{SOURCE_LABELS[s] ?? s}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <Field label="Notas">
          <textarea className={textareaClass} rows={4} placeholder="Qué busca, presupuesto, qué coche tiene para entregar…" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-2">
            {client && wa && (
              <a className={contactBtn} href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </a>
            )}
            {client && f.phone && (
              <a className={contactBtn} href={`tel:${f.phone.replace(/\s/g, "")}`}>
                <Phone className="w-3.5 h-3.5" /> Llamar
              </a>
            )}
            {client && f.email && (
              <a className={contactBtn} href={`mailto:${f.email}`}>
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-sm text-emerald-700">Guardado ✓</span>}
            {client && (
              <Btn
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`¿Borrar a ${client.name || client.phone || "este cliente"} y todo su historial?\n\nNo se puede deshacer.`)) {
                    start(async () => {
                      await deleteClientAction(client.id);
                      router.push("/clientes");
                      router.refresh();
                    });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" /> Borrar
              </Btn>
            )}
            {!client && <LinkBtn href="/clientes" variant="ghost">Cancelar</LinkBtn>}
            <Btn type="submit" disabled={pending}>
              {pending ? "Guardando…" : client ? "Guardar" : "Crear cliente"}
            </Btn>
          </div>
        </div>
      </form>
    </Card>
  );
}
