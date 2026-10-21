"use client";

import { useId, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";
import { trackLead } from "@/lib/utils/analytics";

const PRESUPUESTOS = [
  "Hasta 5.000 €",
  "5.000 – 10.000 €",
  "10.000 – 15.000 €",
  "15.000 – 20.000 €",
  "Más de 20.000 €",
];

// Formulario "Dinos qué coche buscas": recoge a quien no encuentra su coche en el stock.
// Usa el mismo buzón que el formulario de contacto; el asunto del correo indica el coche buscado.
export default function CarRequestForm() {
  const uid = useId();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [form, setForm] = useState({ busqueda: "", presupuesto: "", nombre: "", telefono: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(false);

    try {
      const res = await fetch("https://formspree.io/f/xgogdkay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Búsqueda de coche: ${form.busqueda}`,
          Tipo: "Búsqueda de coche",
          "Qué coche busca": form.busqueda,
          Presupuesto: form.presupuesto,
          Nombre: form.nombre,
          Teléfono: form.telefono,
        }),
      });

      if (!res.ok) throw new Error("submit failed");
      trackLead("busqueda_coche", { presupuesto: form.presupuesto });
      setSuccess(true);
    } catch {
      setSubmitError(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-dark-900 mb-1">¡Recibido!</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Te escribimos por WhatsApp o te llamamos en cuanto tengamos algo parecido.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        id={`${uid}-busqueda`}
        label="¿Qué coche buscas?"
        placeholder="Ej: Golf diésel, SUV automático, Audi A3..."
        required
        value={form.busqueda}
        onChange={(e) => setForm({ ...form, busqueda: e.target.value })}
      />
      <Select
        id={`${uid}-presupuesto`}
        label="Presupuesto máximo"
        required
        value={form.presupuesto}
        onChange={(e) => setForm({ ...form, presupuesto: e.target.value })}
      >
        <option value="">Seleccionar...</option>
        {PRESUPUESTOS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </Select>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id={`${uid}-nombre`}
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-]/g, "") })}
        />
        <Input
          id={`${uid}-telefono`}
          label="Teléfono (WhatsApp)"
          type="tel"
          inputMode="tel"
          placeholder="+34 600 000 000"
          autoComplete="tel"
          maxLength={13}
          required
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/[^\d+\s]/g, "") })}
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 text-center">
          No hemos podido enviar tu búsqueda. Escríbenos por{" "}
          <a
            href={generateWhatsAppUrl("Hola, estoy buscando un coche y no lo encuentro en vuestra web.")}
            target="_blank"
            rel="noopener noreferrer"
            data-track-placement="formulario_error"
            className="font-semibold underline"
          >
            WhatsApp
          </a>{" "}
          o llámanos al {siteSettings.telefono}.
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
        {loading ? "Enviando..." : "Búscame mi coche"}
      </Button>
      <p className="text-xs text-slate-400 text-center">Sin compromiso. Respondemos en menos de 2 horas.</p>
    </form>
  );
}
