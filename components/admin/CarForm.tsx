"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { AdminCar } from "@/lib/admin/cars";
import type { CarExtra } from "@/types/car";
import {
  CARROCERIAS,
  COLORES,
  COMBUSTIBLES,
  ESTADOS,
  ESTADO_LABELS,
  ETIQUETAS,
  EXTRAS,
  MARCAS,
  TRANSMISIONES,
} from "@/lib/admin/car-options";
import { suggestSlug } from "@/lib/admin/slug";
import { SITE_URL } from "@/lib/site";
import { saveCarAction } from "@/app/admin/actions";
import { Btn, Card, CardTitle, Field, LinkBtn, Notice, inputClass, textareaClass } from "@/components/admin/ui";
import PhotoManager from "@/components/admin/PhotoManager";

const today = () => new Date().toISOString().slice(0, 10);
const n2s = (n: number | undefined) => (n === undefined || n === null ? "" : String(n));

function initial(car?: AdminCar) {
  return {
    id: car?.id ?? "",
    slug: car?.slug ?? "",
    marca: car?.marca ?? "",
    modelo: car?.modelo ?? "",
    version: car?.version ?? "",
    año: n2s(car?.año),
    kilometraje: n2s(car?.kilometraje),
    combustible: car?.combustible ?? "gasolina",
    transmision: car?.transmision ?? "manual",
    precio: n2s(car?.precio),
    ubicacion: car?.ubicacion ?? "Barcelona",
    descripcion: car?.descripcion ?? "",
    imagenes: car?.imagenes ?? ([] as string[]),
    estado: car?.estado ?? "disponible",
    fechaPublicacion: car?.fechaPublicacion ?? today(),
    potencia: n2s(car?.potencia),
    color: car?.color ?? "",
    puertas: n2s(car?.puertas ?? (car ? undefined : 5)),
    plazas: n2s(car?.plazas ?? (car ? undefined : 5)),
    carroceria: car?.carroceria ?? "",
    etiqueta: car?.etiqueta ?? "",
    propietario: car?.unicoPropietario ? "unico" : car?.segundoPropietario ? "segundo" : "",
    libroRevisiones: car?.libroRevisiones ?? false,
    extras: (car?.extras ?? []) as CarExtra[],
    equipamiento: (car?.equipamiento ?? []).join("\n"),
    velocidadMax: n2s(car?.velocidadMax),
    aceleracion: n2s(car?.aceleracion),
    consumo: n2s(car?.consumo),
    emisiones: n2s(car?.emisiones),
    peso: n2s(car?.peso),
    maletero: n2s(car?.maletero),
    deposito: n2s(car?.deposito),
    longitud: n2s(car?.longitud),
    anchura: n2s(car?.anchura),
    altura: n2s(car?.altura),
  };
}
type FormState = ReturnType<typeof initial>;

const num = (s: string) => {
  const t = s.trim().replace(",", ".");
  return t === "" ? undefined : Number(t);
};

export default function CarForm({ car }: { car?: AdminCar }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState<FormState>(() => initial(car));
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!car);
  const [slugOpen, setSlugOpen] = useState(!car);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  // En un coche nuevo, la dirección de la ficha se propone sola hasta que se escribe una a mano.
  const auto = useMemo(() => suggestSlug(f), [f.marca, f.modelo, f.version, f.potencia, f.año]); // eslint-disable-line react-hooks/exhaustive-deps
  const slug = slugTouched ? f.slug : auto;

  const toggleExtra = (e: CarExtra) =>
    set("extras", f.extras.includes(e) ? f.extras.filter((x) => x !== e) : [...f.extras, e]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      id: f.id,
      slug,
      marca: f.marca,
      modelo: f.modelo,
      version: f.version,
      año: num(f.año),
      kilometraje: num(f.kilometraje),
      combustible: f.combustible,
      transmision: f.transmision,
      precio: num(f.precio),
      ubicacion: f.ubicacion,
      descripcion: f.descripcion,
      imagenes: f.imagenes,
      estado: f.estado,
      fechaPublicacion: f.fechaPublicacion,
      potencia: num(f.potencia),
      color: f.color,
      puertas: num(f.puertas),
      plazas: num(f.plazas),
      carroceria: f.carroceria || undefined,
      etiqueta: f.etiqueta || undefined,
      unicoPropietario: f.propietario === "unico",
      segundoPropietario: f.propietario === "segundo",
      libroRevisiones: f.libroRevisiones,
      extras: f.extras,
      equipamiento: f.equipamiento.split("\n").map((l) => l.replace(/^[\s●•\-*]+/, "").trim()).filter(Boolean),
      velocidadMax: num(f.velocidadMax),
      aceleracion: num(f.aceleracion),
      consumo: num(f.consumo),
      emisiones: num(f.emisiones),
      peso: num(f.peso),
      maletero: num(f.maletero),
      deposito: num(f.deposito),
      longitud: num(f.longitud),
      anchura: num(f.anchura),
      altura: num(f.altura),
    };
    start(async () => {
      const r = await saveCarAction(payload);
      if (r.ok) {
        router.push("/coches");
        router.refresh();
      } else {
        setError(r.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const text = (label: string, k: keyof FormState, extra?: { hint?: string; list?: string; required?: boolean; mode?: "numeric" | "decimal"; placeholder?: string; className?: string }) => (
    <Field label={label} hint={extra?.hint} className={extra?.className}>
      <input
        className={inputClass}
        list={extra?.list}
        required={extra?.required}
        inputMode={extra?.mode}
        placeholder={extra?.placeholder}
        value={f[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
      />
    </Field>
  );

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {error && <Notice tone="red">{error}</Notice>}

      <Card>
        <CardTitle>Datos del coche</CardTitle>
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Marca">
            <input className={inputClass} list="marcas" required value={f.marca} onChange={(e) => set("marca", e.target.value)} />
            <datalist id="marcas">{MARCAS.map((m) => <option key={m} value={m} />)}</datalist>
          </Field>
          {text("Modelo", "modelo", { required: true })}
          {text("Versión", "version", { placeholder: "1.2 TDI Advance (75 CV)", className: "sm:col-span-2" })}
          {text("Año", "año", { required: true, mode: "numeric" })}
          {text("Kilómetros", "kilometraje", { required: true, mode: "numeric" })}
          <Field label="Combustible">
            <select className={inputClass} value={f.combustible} onChange={(e) => set("combustible", e.target.value as FormState["combustible"])}>
              {COMBUSTIBLES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Cambio">
            <select className={inputClass} value={f.transmision} onChange={(e) => set("transmision", e.target.value as FormState["transmision"])}>
              {TRANSMISIONES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
          {text("Potencia (CV)", "potencia", { mode: "numeric" })}
          {text("Precio (€)", "precio", { required: true, mode: "numeric" })}
          <Field label="Estado">
            <select className={inputClass} value={f.estado} onChange={(e) => set("estado", e.target.value as FormState["estado"])}>
              {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
            </select>
          </Field>
          <Field label="Color">
            <select className={inputClass} value={f.color} onChange={(e) => set("color", e.target.value)}>
              <option value="">—</option>
              {COLORES.map((c) => <option key={c} value={c}>{c}</option>)}
              {f.color && !COLORES.includes(f.color) && <option value={f.color}>{f.color}</option>}
            </select>
          </Field>
          <Field label="Carrocería">
            <select className={inputClass} value={f.carroceria} onChange={(e) => set("carroceria", e.target.value)}>
              <option value="">—</option>
              {CARROCERIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          {text("Puertas", "puertas", { mode: "numeric" })}
          {text("Plazas", "plazas", { mode: "numeric" })}
          <Field label="Etiqueta medioambiental">
            <select className={inputClass} value={f.etiqueta} onChange={(e) => set("etiqueta", e.target.value)}>
              <option value="">—</option>
              {ETIQUETAS.map((c) => <option key={c} value={c}>{c === "0" ? "0 Emisiones" : c}</option>)}
            </select>
          </Field>
          {text("Ubicación", "ubicacion")}
        </div>
      </Card>

      <Card>
        <CardTitle>Fotos</CardTitle>
        <div className="p-5">
          <PhotoManager images={f.imagenes} onChange={(v) => set("imagenes", v)} folder={slug || "nuevo"} />
        </div>
      </Card>

      <Card>
        <CardTitle>Descripción y equipamiento</CardTitle>
        <div className="p-5 space-y-4">
          <Field label="Descripción (el texto de la ficha de la web)" hint={`${f.descripcion.length} caracteres. Si cambias los km, acuérdate de que aquí también salen.`}>
            <textarea className={textareaClass} rows={6} value={f.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
          </Field>
          <Field label="Equipamiento (una cosa por línea)">
            <textarea
              className={textareaClass}
              rows={7}
              placeholder={"Aire acondicionado\nControl de crucero\nElevalunas eléctricos"}
              value={f.equipamiento}
              onChange={(e) => set("equipamiento", e.target.value)}
            />
          </Field>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Extras (los usa el filtro de la web)</p>
            <div className="flex flex-wrap gap-2">
              {EXTRAS.map((e) => (
                <label
                  key={e}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    f.extras.includes(e) ? "border-brand-500 bg-brand-50 text-brand-900 font-medium" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={f.extras.includes(e)} onChange={() => toggleExtra(e)} />
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Propietarios">
              <select className={inputClass} value={f.propietario} onChange={(e) => set("propietario", e.target.value)}>
                <option value="">Sin indicar</option>
                <option value="unico">Único propietario</option>
                <option value="segundo">Segundo propietario</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
              <input type="checkbox" className="w-4 h-4 accent-[#7DC832]" checked={f.libroRevisiones} onChange={(e) => set("libroRevisiones", e.target.checked)} />
              Libro de revisiones
            </label>
          </div>
        </div>
      </Card>

      <details className="group">
        <summary className="cursor-pointer list-none">
          <Card className="px-5 py-4 text-sm font-semibold text-slate-700 hover:border-slate-300">
            Datos técnicos (opcional) <span className="text-slate-400 font-normal">— velocidad, consumo, maletero, medidas…</span>
          </Card>
        </summary>
        <Card className="mt-2">
          <div className="p-5 grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {text("Velocidad máx. (km/h)", "velocidadMax", { mode: "numeric" })}
            {text("0-100 km/h (s)", "aceleracion", { mode: "decimal" })}
            {text("Consumo (l/100 km)", "consumo", { mode: "decimal" })}
            {text("Emisiones CO₂ (g/km)", "emisiones", { mode: "numeric" })}
            {text("Peso (kg)", "peso", { mode: "numeric" })}
            {text("Maletero (l)", "maletero", { mode: "numeric" })}
            {text("Depósito (l)", "deposito", { mode: "numeric" })}
            {text("Longitud (m)", "longitud", { mode: "decimal" })}
            {text("Anchura (m)", "anchura", { mode: "decimal" })}
            {text("Altura (m)", "altura", { mode: "decimal" })}
          </div>
        </Card>
      </details>

      <Card>
        <CardTitle>Publicación</CardTitle>
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Fecha de publicación" hint="Los 3 coches disponibles más recientes salen en la portada de la web.">
            <input className={inputClass} type="date" required value={f.fechaPublicacion} onChange={(e) => set("fechaPublicacion", e.target.value)} />
          </Field>
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-1">Dirección de la ficha</span>
            {slugOpen ? (
              <input
                className={inputClass}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
              />
            ) : (
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 truncate rounded-lg bg-slate-100 px-3 py-2.5 text-xs text-slate-600">{slug}</code>
                <Btn size="sm" variant="secondary" onClick={() => setSlugOpen(true)}>
                  Cambiar
                </Btn>
              </div>
            )}
            <span className="block text-xs text-slate-400 mt-1">
              {SITE_URL.replace("https://", "")}/coches/<strong>{slug || "…"}</strong>
              {car && slugOpen && slug !== car.slug ? " — la dirección antigua llevará a la nueva (redirección permanente)." : ""}
            </span>
          </div>
        </div>
      </Card>

      <div className="fixed bottom-0 inset-x-0 lg:left-64 z-10 bg-white/95 backdrop-blur border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LinkBtn href="/coches" variant="ghost">Cancelar</LinkBtn>
            {car && (
              <LinkBtn href={`${SITE_URL}/coches/${car.slug}`} variant="secondary">
                <ExternalLink className="w-4 h-4" /> Ver en la web
              </LinkBtn>
            )}
          </div>
          <Btn type="submit" size="lg" disabled={pending}>
            {pending ? "Guardando…" : car ? "Guardar cambios" : "Publicar coche"}
          </Btn>
        </div>
      </div>
    </form>
  );
}
