"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [emailError, setEmailError] = useState("");

  const validateEmail = (val: string) => {
    if (!val) return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(valid ? "" : "Introduce un email válido (ejemplo@dominio.com)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!valid) { setEmailError("Introduce un email válido (ejemplo@dominio.com)"); return; }
    setLoading(true);
    await fetch("https://formspree.io/f/xgogdkay", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ Nombre: form.nombre, Email: form.email, Teléfono: form.telefono, Mensaje: form.mensaje }),
    });
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="py-12 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-dark-900 mb-2">¡Mensaje recibido!</h3>
        <p className="text-slate-500">
          Nos pondremos en contacto contigo lo antes posible, normalmente en menos de 2 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="nombre"
          label="Nombre completo"
          placeholder="Tu nombre"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-]/g, "") })}
        />
        <Input
          id="telefono"
          label="Teléfono"
          type="tel"
          inputMode="tel"
          placeholder="+34 600 000 000"
          maxLength={13}
          required
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/[^\d+\s]/g, "") })}
        />
      </div>
      <div>
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          required
          value={form.email}
          onChange={(e) => { setForm({ ...form, email: e.target.value }); setEmailError(""); }}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
      </div>
      <Textarea
        id="mensaje"
        label="Mensaje"
        placeholder="¿En qué podemos ayudarte?"
        rows={5}
        required
        value={form.mensaje}
        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
      />
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
        {loading ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
}
