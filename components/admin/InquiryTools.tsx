"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { INQUIRY_LABELS, MANUAL_INQUIRY_KINDS } from "@/types/lead";
import {
  addInquiryAction,
  deleteInquiryAction,
  markAllReadAction,
  markClientReadAction,
  markInquiryReadAction,
} from "@/app/admin/actions";
import { Btn, Card, CardTitle, Field, Notice, inputClass, textareaClass } from "@/components/admin/ui";

/** Al abrir un cliente, sus consultas nuevas pasan a leídas (y se actualiza el contador del menú). */
export function MarkRead({ clientId, hasNew }: { clientId: number; hasNew: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!hasNew) return;
    void markClientReadAction(clientId).then(() => router.refresh());
  }, [clientId, hasNew, router]);
  return null;
}

/** Anotar a mano una llamada, un WhatsApp, una visita o una nota. */
export function InquiryComposer({ clientId, cars }: { clientId: number; cars: { id: string; label: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [kind, setKind] = useState("nota");
  const [message, setMessage] = useState("");
  const [carId, setCarId] = useState("");
  const [error, setError] = useState("");

  return (
    <Card>
      <CardTitle>Anotar un contacto</CardTitle>
      <form
        className="p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          start(async () => {
            const r = await addInquiryAction(clientId, { kind, message, carId: carId || null });
            if (r.ok) {
              setMessage("");
              router.refresh();
            } else setError(r.error);
          });
        }}
      >
        {error && <Notice tone="red">{error}</Notice>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Qué ha sido">
            <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value)}>
              {MANUAL_INQUIRY_KINDS.map((k) => <option key={k} value={k}>{INQUIRY_LABELS[k]}</option>)}
            </select>
          </Field>
          <Field label="Coche (opcional)">
            <select className={inputClass} value={carId} onChange={(e) => setCarId(e.target.value)}>
              <option value="">—</option>
              {cars.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
        </div>
        <textarea
          className={textareaClass}
          rows={3}
          required
          placeholder="Qué se ha dicho o acordado…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end">
          <Btn type="submit" disabled={pending}>{pending ? "Guardando…" : "Añadir al historial"}</Btn>
        </div>
      </form>
    </Card>
  );
}

/** Botones pequeños de una consulta: marcar leída/no leída y borrar. */
export function InquiryActions({ id, isNew, canDelete = true }: { id: number; isNew: boolean; canDelete?: boolean }) {
  const router = useRouter();
  const [, start] = useTransition();
  const refresh = () => start(() => router.refresh());
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title={isNew ? "Marcar como leída" : "Marcar como no leída"}
        onClick={async () => {
          await markInquiryReadAction(id, !isNew);
          refresh();
        }}
        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <Check className="w-4 h-4" />
      </button>
      {canDelete && (
        <button
          type="button"
          title="Borrar"
          onClick={async () => {
            if (!window.confirm("¿Borrar esta consulta del historial?")) return;
            await deleteInquiryAction(id);
            refresh();
          }}
          className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function MarkAllRead({ count }: { count: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (count === 0) return null;
  return (
    <Btn
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markAllReadAction();
          router.refresh();
        })
      }
    >
      <Check className="w-4 h-4" /> Marcar todo como leído
    </Btn>
  );
}
