"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import type { FaqRow, TestimonialRow } from "@/lib/admin/content";
import {
  deleteFaqAction,
  deleteTestimonialAction,
  moveItemAction,
  saveFaqAction,
  saveTestimonialAction,
} from "@/app/admin/actions";
import { Badge, Btn, Card, Empty, Field, Notice, inputClass, textareaClass } from "@/components/admin/ui";

type Ok = { ok: true } | { ok: false; error: string };

/** Pequeño cuadro común: botones de subir/bajar, guardar y borrar de un elemento de una lista. */
function useItem(onDone: () => void) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const run = (fn: () => Promise<Ok>, thenRefresh = true) =>
    start(async () => {
      setError("");
      const r = await fn();
      if (r.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
        if (thenRefresh) onDone();
      } else setError(r.error);
    });
  return { pending, error, saved, run };
}

function Arrows({ table, id, first, last, run }: { table: "faqs" | "testimonials"; id: number; first: boolean; last: boolean; run: (fn: () => Promise<Ok>) => void }) {
  return (
    <div className="flex flex-col">
      <button type="button" disabled={first} title="Subir" onClick={() => run(() => moveItemAction(table, id, "up"))} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20">
        <ArrowUp className="w-4 h-4" />
      </button>
      <button type="button" disabled={last} title="Bajar" onClick={() => run(() => moveItemAction(table, id, "down"))} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20">
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------- reseñas ----------

function TestimonialItem({ t, first, last, isNew }: { t?: TestimonialRow; first: boolean; last: boolean; isNew?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: t?.name ?? "",
    text: t?.text ?? "",
    rating: t?.rating ?? 5,
    date_label: t?.date_label ?? "",
    published: t?.published ?? true,
  });
  const { pending, error, saved, run } = useItem(() => router.refresh());

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {t && <Arrows table="testimonials" id={t.id} first={first} last={last} run={run} />}
        <div className="flex-1 min-w-0 space-y-3">
          {error && <Notice tone="red">{error}</Notice>}
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Nombre">
              <input className={inputClass} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
            <Field label="Estrellas">
              <div className="flex items-center h-10 gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setF({ ...f, rating: n })} aria-label={`${n} estrellas`}>
                    <Star className={`w-5 h-5 ${n <= f.rating ? "fill-[#7DC832] text-[#7DC832]" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Fecha (opcional)">
              <input className={inputClass} placeholder="Ej: Octubre 2026" value={f.date_label} onChange={(e) => setF({ ...f, date_label: e.target.value })} />
            </Field>
          </div>
          <Field label="Comentario">
            <textarea className={textareaClass} rows={3} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="w-4 h-4 accent-[#7DC832]" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} />
              Mostrar en la web
            </label>
            <div className="flex items-center gap-2">
              {saved && <span className="text-sm text-emerald-700">Guardado ✓</span>}
              {t && (
                <Btn
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  disabled={pending}
                  onClick={() => window.confirm("¿Borrar esta reseña?") && run(async () => { await deleteTestimonialAction(t.id); return { ok: true }; })}
                >
                  <Trash2 className="w-4 h-4" /> Borrar
                </Btn>
              )}
              <Btn
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(async () => {
                    const r = await saveTestimonialAction({ id: t?.id, ...f });
                    if (r.ok && isNew) setF({ name: "", text: "", rating: 5, date_label: "", published: true });
                    return r;
                  })
                }
              >
                {pending ? "Guardando…" : isNew ? "Añadir reseña" : "Guardar"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TestimonialsEditor({ items }: { items: TestimonialRow[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        {adding ? <TestimonialItem first last isNew /> : (
          <Btn onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" /> Añadir reseña
          </Btn>
        )}
      </div>
      {items.length === 0 ? (
        <Card><Empty title="No hay reseñas" /></Card>
      ) : (
        items.map((t, i) => <TestimonialItem key={`${t.id}-${t.position}`} t={t} first={i === 0} last={i === items.length - 1} />)
      )}
    </div>
  );
}

// ---------- preguntas frecuentes ----------

function FaqItem({ q, first, last, isNew }: { q?: FaqRow; first: boolean; last: boolean; isNew?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ question: q?.question ?? "", answer: q?.answer ?? "", published: q?.published ?? true });
  const { pending, error, saved, run } = useItem(() => router.refresh());

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {q && <Arrows table="faqs" id={q.id} first={first} last={last} run={run} />}
        <div className="flex-1 min-w-0 space-y-3">
          {error && <Notice tone="red">{error}</Notice>}
          <Field label="Pregunta">
            <input className={inputClass} value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} />
          </Field>
          <Field label="Respuesta">
            <textarea className={textareaClass} rows={3} value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="w-4 h-4 accent-[#7DC832]" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} />
              Mostrar en la web
              {!f.published && <Badge>Oculta</Badge>}
            </label>
            <div className="flex items-center gap-2">
              {saved && <span className="text-sm text-emerald-700">Guardado ✓</span>}
              {q && (
                <Btn
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  disabled={pending}
                  onClick={() => window.confirm("¿Borrar esta pregunta?") && run(async () => { await deleteFaqAction(q.id); return { ok: true }; })}
                >
                  <Trash2 className="w-4 h-4" /> Borrar
                </Btn>
              )}
              <Btn
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(async () => {
                    const r = await saveFaqAction({ id: q?.id, ...f });
                    if (r.ok && isNew) setF({ question: "", answer: "", published: true });
                    return r;
                  })
                }
              >
                {pending ? "Guardando…" : isNew ? "Añadir pregunta" : "Guardar"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function FaqsEditor({ items }: { items: FaqRow[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        {adding ? <FaqItem first last isNew /> : (
          <Btn onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" /> Añadir pregunta
          </Btn>
        )}
      </div>
      {items.length === 0 ? (
        <Card><Empty title="No hay preguntas" /></Card>
      ) : (
        items.map((q, i) => <FaqItem key={`${q.id}-${q.position}`} q={q} first={i === 0} last={i === items.length - 1} />)
      )}
    </div>
  );
}
