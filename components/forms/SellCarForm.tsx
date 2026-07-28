"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createSellLead } from "@/lib/services/leads";

// Solo letras, espacios y guiones (sin caracteres especiales ni números)
const onlyLetters = (e: React.ChangeEvent<HTMLInputElement>, key: string, setForm: Function, form: any) => {
  const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-]/g, "");
  setForm({ ...form, [key]: val });
};

// Solo dígitos
const onlyNumbers = (e: React.ChangeEvent<HTMLInputElement>, key: string, setForm: Function, form: any) => {
  const val = e.target.value.replace(/\D/g, "");
  setForm({ ...form, [key]: val });
};

// Teléfono: dígitos, +, espacios
const onlyPhone = (e: React.ChangeEvent<HTMLInputElement>, setForm: Function, form: any) => {
  const val = e.target.value.replace(/[^\d+\s]/g, "");
  setForm({ ...form, telefono: val });
};

export default function SellCarForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (val: string) => {
    if (!val) return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(valid ? "" : "Introduce un email válido (ejemplo@dominio.com)");
  };
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    marcaCoche: "",
    modeloCoche: "",
    añoCoche: "",
    kilometrajeCoche: "",
    combustibleCoche: "",
    transmisionCoche: "",
    mensaje: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!valid) { setEmailError("Introduce un email válido (ejemplo@dominio.com)"); return; }
    setLoading(true);
    await createSellLead({
      tipo: "sell",
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      marcaCoche: form.marcaCoche,
      modeloCoche: form.modeloCoche,
      añoCoche: parseInt(form.añoCoche),
      kilometrajeCoche: parseInt(form.kilometrajeCoche),
      combustibleCoche: form.combustibleCoche,
      mensaje: `Transmisión: ${form.transmisionCoche}${form.mensaje ? `. ${form.mensaje}` : ""}`,
    });
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="py-12 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-dark-900 mb-2">¡Solicitud recibida!</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Revisaremos los datos de tu coche y te contactaremos con una oferta de compra. Pago al firmar, sin sorpresas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos del coche */}
      <div>
        <h3 className="font-bold text-dark-900 text-lg mb-4">Datos del coche</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="marca"
            label="Marca"
            placeholder="BMW, Mercedes, Audi..."
            required
            value={form.marcaCoche}
            onChange={(e) => onlyLetters(e, "marcaCoche", setForm, form)}
          />
          <Input
            id="modelo"
            label="Modelo"
            placeholder="Serie 3, Clase C, A4..."
            required
            value={form.modeloCoche}
            onChange={(e) => onlyLetters(e, "modeloCoche", setForm, form)}
          />
          <Input
            id="año"
            label="Año"
            inputMode="numeric"
            placeholder="2020"
            maxLength={4}
            required
            value={form.añoCoche}
            onChange={(e) => onlyNumbers(e, "añoCoche", setForm, form)}
          />
          <Input
            id="km"
            label="Kilometraje"
            inputMode="numeric"
            placeholder="50000"
            required
            value={form.kilometrajeCoche}
            onChange={(e) => onlyNumbers(e, "kilometrajeCoche", setForm, form)}
          />
          <Select
            id="combustible"
            label="Combustible"
            required
            value={form.combustibleCoche}
            onChange={(e) => setForm({ ...form, combustibleCoche: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="gasolina">Gasolina</option>
            <option value="diésel">Diésel</option>
            <option value="híbrido">Híbrido</option>
            <option value="eléctrico">Eléctrico</option>
            <option value="gas">Gas</option>
          </Select>
          <Select
            id="transmision"
            label="Transmisión"
            required
            value={form.transmisionCoche}
            onChange={(e) => setForm({ ...form, transmisionCoche: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="manual">Manual</option>
            <option value="automático">Automático</option>
            <option value="semiautomático">Semiautomático</option>
          </Select>
        </div>
      </div>

      {/* Datos de contacto */}
      <div>
        <h3 className="font-bold text-dark-900 text-lg mb-4">Tus datos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="nombre"
            label="Nombre"
            placeholder="Tu nombre"
            required
            value={form.nombre}
            onChange={(e) => onlyLetters(e, "nombre", setForm, form)}
          />
          <Input
            id="telefono"
            label="Teléfono"
            type="tel"
            inputMode="tel"
            placeholder="+34 600 000 000"
            required
            value={form.telefono}
            onChange={(e) => onlyPhone(e, setForm, form)}
          />
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
        </div>
        <div className="mt-4">
          <Textarea
            id="mensaje"
            label="Información adicional (opcional)"
            placeholder="Estado del coche, extras, historial..."
            rows={4}
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
        {loading ? "Enviando..." : "Solicitar tasación gratuita"}
      </Button>
      <p className="text-xs text-slate-400 text-center">
        Sin compromiso. Te damos una tasación honesta y competitiva.
      </p>
    </form>
  );
}
