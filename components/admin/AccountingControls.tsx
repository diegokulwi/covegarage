"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import { linkWebCarAction, removeGestionCarAction, saveGestionCarAction } from "@/app/admin/actions";
import { Btn, Field, Notice, inputClass } from "@/components/admin/ui";

export interface WebOption {
  id: string;
  label: string;
}

/** Desplegable de una fila de stock: qué coche de la web es (de ahí sale el precio de venta). Se guarda al elegir. */
export function WebCarSelect({ plate, value, options }: { plate: string; value: string; options: WebOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState(value);
  const [error, setError] = useState("");
  useEffect(() => setCurrent(value), [value]);

  return (
    <div>
      <select
        aria-label={`Coche de la web de la matrícula ${plate}`}
        value={current}
        disabled={pending}
        onChange={(e) => {
          const carId = e.target.value;
          setCurrent(carId);
          setError("");
          start(async () => {
            const r = await linkWebCarAction(plate, carId);
            if (!r.ok) {
              setError(r.error);
              setCurrent(value);
            }
            router.refresh();
          });
        }}
        className="mt-1.5 h-8 w-full max-w-[210px] rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
      >
        <option value="">{value ? "— Quitar el enlace —" : "Enlazar con un coche de la web…"}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/** «Añadir coche en gestión»: coche de la web + matrícula + precio acordado con el dueño. */
export function GestionForm({ options }: { options: WebOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [carId, setCarId] = useState("");
  const [plate, setPlate] = useState("");
  const [agreed, setAgreed] = useState("");
  const [error, setError] = useState("");

  if (!open) {
    return (
      <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Añadir coche en gestión
      </Btn>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const r = await saveGestionCarAction({ plate, carId, agreed });
      if (r.ok) {
        setCarId("");
        setPlate("");
        setAgreed("");
        setOpen(false);
        router.refresh();
      } else setError(r.error);
    });
  };

  return (
    <form onSubmit={submit} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">
          Elige el coche tal como está en la web y apunta su matrícula y el precio acordado con el dueño. Solo lo ves tú. Cuando lo
          vendas y lo apuntes en el Excel con esa matrícula, pasa solo a vendidos. Si la matrícula ya existe, se actualiza.
        </p>
        <button type="button" onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-700" title="Cerrar">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <Notice tone="red">{error}</Notice>}
      <div className="grid sm:grid-cols-[1fr,150px,170px,auto] gap-2 items-end">
        <Field label="Coche de la web">
          <select className={inputClass} value={carId} onChange={(e) => setCarId(e.target.value)} required>
            <option value="">Elegir…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Matrícula">
          <input
            className={inputClass}
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="1234ABC"
            autoCapitalize="characters"
            required
          />
        </Field>
        <Field label="Precio acordado (€)">
          <input
            className={inputClass}
            value={agreed}
            onChange={(e) => setAgreed(e.target.value)}
            inputMode="decimal"
            placeholder="6000"
            required
          />
        </Field>
        <Btn type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Btn>
      </div>
    </form>
  );
}

/** Quita un coche en gestión dado de alta a mano (no toca el Excel). */
export function GestionRemove({ plate }: { plate: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title="Quitar de la lista de coches en gestión"
      disabled={pending}
      onClick={() => {
        if (window.confirm("¿Quitar este coche de la gestión de venta? No se borra nada del Excel ni de la web.")) {
          start(async () => {
            await removeGestionCarAction(plate);
            router.refresh();
          });
        }
      }}
      className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
