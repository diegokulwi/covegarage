"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Car } from "@/types/car";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createLead } from "@/lib/services/leads";

interface CarInterestFormProps {
  car: Car;
}

export default function CarInterestForm({ car }: CarInterestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createLead({
      tipo: "interest",
      ...form,
      carId: car.id,
      carSlug: car.slug,
      carName: `${car.marca} ${car.modelo} ${car.año}`,
    });
    setLoading(false);
    setSuccess(true);
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
        id="nombre"
        label="Nombre"
        placeholder="Tu nombre"
        required
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="tu@email.com"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        id="telefono"
        label="Teléfono"
        type="tel"
        placeholder="+34 600 000 000"
        required
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
      />
      <Textarea
        id="mensaje"
        label="Mensaje (opcional)"
        placeholder={`Estoy interesado en el ${car.marca} ${car.modelo} ${car.año}...`}
        rows={3}
        value={form.mensaje}
        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
      />
      <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
        {loading ? "Enviando..." : "Solicitar información"}
      </Button>
      <p className="text-xs text-slate-400 text-center">
        Sin compromiso. Respondemos en menos de 2 horas.
      </p>
    </form>
  );
}
