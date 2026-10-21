"use client";

import { useId, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Car } from "@/types/car";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { siteSettings } from "@/lib/data/mockSettings";
import { formatCarTitle } from "@/lib/utils/formatters";
import { generateCarWhatsAppUrl } from "@/lib/utils/whatsapp";
import { trackLead } from "@/lib/utils/analytics";
import ContactPreference, { ContactPref } from "@/components/forms/ContactPreference";

interface CarInterestFormProps {
  car: Car;
}

export default function CarInterestForm({ car }: CarInterestFormProps) {
  // La ficha monta este formulario dos veces (móvil y escritorio): ids únicos.
  const uid = useId();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [pref, setPref] = useState<ContactPref>("WhatsApp");
  const carName = formatCarTitle(car.marca, car.modelo, car.año);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(false);

    try {
      const res = await fetch("https://formspree.io/f/xpqvbdpl", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Coche: carName,
          Ficha: `https://www.covegarage.com/coches/${car.slug}`,
          Nombre: form.nombre,
          Email: form.email,
          Teléfono: form.telefono,
          "Prefiere contacto por": pref,
          Mensaje: form.mensaje,
        }),
      });

      if (!res.ok) throw new Error("submit failed");
      trackLead("interes_coche", { car: carName, value: car.precio, currency: "EUR", contacto: pref });
      setSuccess(true);
    } catch {
      setSubmitError(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="font-bold text-dark-900 mb-1">¡Mensaje enviado!</h4>
        <p className="text-sm text-slate-500">
          Te contactaremos en menos de 2 horas. También puedes llamarnos directamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        id={`${uid}-nombre`}
        label="Nombre"
        placeholder="Tu nombre"
        autoComplete="name"
        required
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />
      <Input
        id={`${uid}-email`}
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        id={`${uid}-telefono`}
        label="Teléfono"
        type="tel"
        inputMode="tel"
        placeholder="+34 600 000 000"
        autoComplete="tel"
        maxLength={13}
        required
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/[^\d+\s]/g, "") })}
      />
      <ContactPreference value={pref} onChange={setPref} />
      <Textarea
        id={`${uid}-mensaje`}
        label="Mensaje (opcional)"
        placeholder={`Estoy interesado en el ${car.marca} ${car.modelo} ${car.año}...`}
        rows={3}
        value={form.mensaje}
        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
      />

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 text-center">
          No hemos podido enviar tu mensaje. Escríbenos por{" "}
          <a
            href={generateCarWhatsAppUrl(car.marca, car.modelo, car.año, car.precio, car.slug)}
            target="_blank"
            rel="noopener noreferrer"
            data-track-placement="formulario_error"
            data-track-car={carName}
            className="font-semibold underline"
          >
            WhatsApp
          </a>{" "}
          o llámanos al {siteSettings.telefono}.
        </p>
      )}

      <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
        {loading ? "Enviando..." : "Solicitar información"}
      </Button>
      <p className="text-xs text-slate-400 text-center">
        Sin compromiso. Respondemos en menos de 2 horas.
      </p>
    </form>
  );
}
