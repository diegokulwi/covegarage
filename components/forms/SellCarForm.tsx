"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const MARCAS_MODELOS: Record<string, string[]> = {
  "Alfa Romeo": ["Giulia", "Giulietta", "Stelvio", "Tonale", "MiTo"],
  "Aston Martin": ["DB11", "DBS", "Vantage", "DBX"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron", "e-tron GT", "SQ5", "RS3", "RS4", "RS6"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur"],
  "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 6", "Serie 7", "Serie 8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "M2", "M3", "M4", "M5", "i3", "i4", "iX"],
  "BYD": ["Atto 3", "Han", "Seal", "Tang"],
  "Citroën": ["Berlingo", "C1", "C3", "C3 Aircross", "C4", "C5 Aircross", "C5 X", "Spacetourer"],
  "CUPRA": ["Ateca", "Born", "Formentor", "León", "Terramar"],
  "Dacia": ["Duster", "Jogger", "Logan", "Sandero", "Spring"],
  "DS": ["DS3", "DS4", "DS7", "DS9"],
  "Ferrari": ["296 GTB", "812", "F8", "Portofino", "Roma", "SF90"],
  "Fiat": ["500", "500L", "500X", "Bravo", "Panda", "Tipo"],
  "Ford": ["EcoSport", "Explorer", "Fiesta", "Focus", "Kuga", "Mondeo", "Mustang", "Puma", "Ranger"],
  "Honda": ["Accord", "Civic", "CR-V", "HR-V", "Jazz", "e"],
  "Hyundai": ["i10", "i20", "i30", "Ioniq 5", "Ioniq 6", "Kona", "Santa Fe", "Tucson"],
  "Infiniti": ["Q30", "Q50", "QX30", "QX50", "QX70"],
  "Jaguar": ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF"],
  "Jeep": ["Avenger", "Cherokee", "Compass", "Grand Cherokee", "Renegade", "Wrangler"],
  "Kia": ["Ceed", "EV6", "Niro", "Picanto", "ProCeed", "Rio", "Sorento", "Sportage", "Stinger"],
  "Lamborghini": ["Huracán", "Urus"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  "Lexus": ["ES", "IS", "LC", "LS", "NX", "RX", "UX"],
  "Maserati": ["Ghibli", "Grecale", "Levante", "Quattroporte"],
  "Mazda": ["CX-3", "CX-30", "CX-5", "CX-60", "Mazda2", "Mazda3", "Mazda6", "MX-5"],
  "McLaren": ["570S", "720S", "Artura", "GT"],
  "Mercedes-Benz": ["AMG GT", "Clase A", "Clase B", "Clase C", "Clase E", "Clase S", "CLA", "CLS", "EQA", "EQB", "EQC", "EQE", "EQS", "GLA", "GLB", "GLC", "GLE", "GLS", "Sprinter", "Vito"],
  "MG": ["Marvel R", "MG3", "MG5", "MG ZS"],
  "Mini": ["Clubman", "Cooper", "Countryman", "Paceman"],
  "Mitsubishi": ["ASX", "Eclipse Cross", "L200", "Outlander"],
  "Nissan": ["Juke", "Leaf", "Micra", "Navara", "NV200", "Qashqai", "X-Trail"],
  "Opel": ["Astra", "Corsa", "Crossland", "Grandland", "Insignia", "Mokka", "Zafira"],
  "Peugeot": ["108", "208", "308", "408", "508", "2008", "3008", "5008", "Rifter"],
  "Polestar": ["2", "3", "4"],
  "Porsche": ["718 Boxster", "718 Cayman", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Renault": ["Arkana", "Austral", "Captur", "Clio", "Kadjar", "Kangoo", "Koleos", "Mégane", "Talisman", "Twingo", "Zoe"],
  "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Spectre"],
  "SEAT": ["Alhambra", "Arona", "Ateca", "Ibiza", "León", "Mii", "Tarraco", "Toledo"],
  "Skoda": ["Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"],
  "Smart": ["#1", "#3", "ForFour", "ForTwo"],
  "Subaru": ["Forester", "Impreza", "Legacy", "Outback", "WRX", "XV"],
  "Suzuki": ["Ignis", "Jimny", "SX4", "Swift", "Vitara"],
  "Tesla": ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"],
  "Toyota": ["Aygo", "C-HR", "Camry", "Corolla", "GR Yaris", "Highlander", "Land Cruiser", "Prius", "Proace", "RAV4", "Yaris"],
  "Volkswagen": ["Arteon", "Caddy", "Golf", "ID.3", "ID.4", "ID.5", "Passat", "Polo", "Sharan", "T-Cross", "T-Roc", "Tiguan", "Touareg", "Touran"],
  "Volvo": ["S60", "S90", "V40", "V60", "V90", "XC40", "XC60", "XC90"],
  "Otro": ["Otro"],
};

const MARCAS = Object.keys(MARCAS_MODELOS).sort();
const AÑOS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => String(2026 - i));

const onlyPhone = (e: React.ChangeEvent<HTMLInputElement>, setForm: (f: any) => void, form: any) => {
  const val = e.target.value.replace(/[^\d+\s]/g, "");
  setForm({ ...form, telefono: val });
};

export default function SellCarForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
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

  const modelos = form.marcaCoche ? MARCAS_MODELOS[form.marcaCoche] ?? [] : [];

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
    await fetch("https://formspree.io/f/xkodyrjv", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Nombre: form.nombre,
        Email: form.email,
        Teléfono: form.telefono,
        Marca: form.marcaCoche,
        Modelo: form.modeloCoche,
        Año: form.añoCoche,
        Kilometraje: form.kilometrajeCoche,
        Combustible: form.combustibleCoche,
        Transmisión: form.transmisionCoche,
        "Información adicional": form.mensaje,
      }),
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
          <Select
            id="marca"
            label="Marca"
            required
            value={form.marcaCoche}
            onChange={(e) => setForm({ ...form, marcaCoche: e.target.value, modeloCoche: "" })}
          >
            <option value="">Seleccionar marca...</option>
            {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>

          <Select
            id="modelo"
            label="Modelo"
            required
            value={form.modeloCoche}
            onChange={(e) => setForm({ ...form, modeloCoche: e.target.value })}
            disabled={!form.marcaCoche}
          >
            <option value="">{form.marcaCoche ? "Seleccionar modelo..." : "Primero elige marca"}</option>
            {modelos.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>

          <Select
            id="año"
            label="Año"
            required
            value={form.añoCoche}
            onChange={(e) => setForm({ ...form, añoCoche: e.target.value })}
          >
            <option value="">Seleccionar año...</option>
            {AÑOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>

          <Input
            id="km"
            label="Kilometraje"
            type="number"
            inputMode="numeric"
            placeholder="50000"
            min={1}
            max={500000}
            required
            value={form.kilometrajeCoche}
            onChange={(e) => setForm({ ...form, kilometrajeCoche: e.target.value })}
          />

          <Select
            id="combustible"
            label="Combustible"
            required
            value={form.combustibleCoche}
            onChange={(e) => setForm({ ...form, combustibleCoche: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diésel">Diésel</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="Gas">Gas</option>
          </Select>

          <Select
            id="transmision"
            label="Transmisión"
            required
            value={form.transmisionCoche}
            onChange={(e) => setForm({ ...form, transmisionCoche: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="Manual">Manual</option>
            <option value="Automático">Automático</option>
            <option value="Semiautomático">Semiautomático</option>
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
