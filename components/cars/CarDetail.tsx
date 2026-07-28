"use client";

import { useState } from "react";
import { Car } from "@/types/car";
import { Phone, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import EtiquetaBadge from "@/components/ui/EtiquetaBadge";
import Button from "@/components/ui/Button";
import CarGallery from "./CarGallery";
import CarInterestForm from "@/components/forms/CarInterestForm";
import { formatPrice, formatKm, formatCarTitle } from "@/lib/utils/formatters";
import { generateCarWhatsAppUrl } from "@/lib/utils/whatsapp";
import { siteSettings } from "@/lib/data/mockSettings";

interface CarDetailProps {
  car: Car;
}

// ──────────────────────────────────────────────
// Iconos SVG de la barra rápida
// ──────────────────────────────────────────────
function IconKm() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l-3.5-3.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M7 12h1m8 0h1M12 7v1" strokeLinecap="round" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 9h18M8 2v4m8-4v4" strokeLinecap="round" />
      <path d="M7 13h2m4 0h2M7 17h2m4 0h2" strokeLinecap="round" />
    </svg>
  );
}
function IconGearbox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="5" cy="6" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" /><circle cx="12" cy="18" r="2" />
      <path d="M5 8v4m7-4v10m7-12v4M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
function IconFuel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M4 22V6a2 2 0 012-2h8a2 2 0 012 2v16" strokeLinecap="round" />
      <path d="M4 22h12M16 8h2a2 2 0 012 2v3a2 2 0 01-2 2h-2" strokeLinecap="round" />
      <rect x="7" y="9" width="5" height="4" rx="1" />
    </svg>
  );
}
function IconSeat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M7 4v8a2 2 0 002 2h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12l-1 6" strokeLinecap="round" />
      <path d="M14 14l1 3H8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="16" cy="20" r="1.5" />
    </svg>
  );
}

// ──────────────────────────────────────────────
// Equipamiento accordion
// ──────────────────────────────────────────────
function EquipamientoAccordion({ equipamiento }: { equipamiento: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Equipamiento destacado</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#7DC832" }}>
            {equipamiento.length}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <ul className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {equipamiento.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#7DC832" }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Bloque de specs técnicos
// ──────────────────────────────────────────────
function TechSpecs({ car }: { car: Car }) {
  const hasTech = car.velocidadMax || car.aceleracion || car.consumo || car.emisiones;
  const hasDim = car.longitud || car.peso || car.maletero || car.deposito;
  if (!hasTech && !hasDim) return null;

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Prestaciones y dimensiones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {hasTech && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Prestaciones</p>
            <div className="grid grid-cols-2 gap-2">
              {car.velocidadMax && (
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                  <p className="text-xl font-black text-slate-900">{car.velocidadMax}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">km/h máx.</p>
                </div>
              )}
              {car.aceleracion && (
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                  <p className="text-xl font-black text-slate-900">{car.aceleracion}s</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">0–100 km/h</p>
                </div>
              )}
              {car.consumo && (
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                  <p className="text-xl font-black text-slate-900">{car.consumo}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">L/100 mixto</p>
                </div>
              )}
              {car.emisiones && (
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                  <p className="text-xl font-black text-slate-900">{car.emisiones}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">g/km CO₂</p>
                </div>
              )}
            </div>
          </div>
        )}
        {hasDim && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Dimensiones</p>
            <div className="space-y-2">
              {car.longitud && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Largo × Ancho × Alto</span>
                  <span className="font-bold text-slate-800">
                    {car.longitud}m × {car.anchura}m × {car.altura}m
                  </span>
                </div>
              )}
              {car.peso && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Peso</span>
                  <span className="font-bold text-slate-800">{car.peso.toLocaleString("es-ES")} kg</span>
                </div>
              )}
              {car.maletero && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Maletero</span>
                  <span className="font-bold text-slate-800">{car.maletero} L</span>
                </div>
              )}
              {car.deposito && (
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">Depósito</span>
                  <span className="font-bold text-slate-800">{car.deposito} L</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function CarDetail({ car }: CarDetailProps) {
  const whatsappUrl = generateCarWhatsAppUrl(car.marca, car.modelo, car.año);
  const isAvailable = car.estado === "disponible";

  const quickBar = [
    { Icon: IconKm, label: formatKm(car.kilometraje) },
    { Icon: IconCalendar, label: car.año.toString() },
    { Icon: IconGearbox, label: car.transmision.charAt(0).toUpperCase() + car.transmision.slice(1) },
    { Icon: IconFuel, label: car.combustible.charAt(0).toUpperCase() + car.combustible.slice(1) },
    { Icon: IconSeat, label: `${car.plazas ?? 5} Plazas` },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <a href="/" className="hover:text-[#7DC832] transition-colors">Inicio</a>
          <span>/</span>
          <a href="/coches" className="hover:text-[#7DC832] transition-colors">Coches</a>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate">{formatCarTitle(car.marca, car.modelo, car.año)}</span>
        </nav>

        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight uppercase tracking-tight text-slate-900">
              {car.marca} {car.modelo}
            </h1>
            {car.version && (
              <p className="text-base text-slate-500 font-medium mt-1 uppercase tracking-wide">
                {car.version}{car.potencia ? ` (${car.potencia} CV)` : ""}
              </p>
            )}
            {/* Quick specs line */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{car.año}</span>
              {[
                formatKm(car.kilometraje),
                car.combustible.charAt(0).toUpperCase() + car.combustible.slice(1),
                car.transmision.charAt(0).toUpperCase() + car.transmision.slice(1),
                ...(car.unicoPropietario ? ["Único propietario"] : []),
                ...(car.segundoPropietario ? ["Segundo propietario"] : []),
                ...(car.libroRevisiones ? ["Libro de revisiones"] : []),
              ].map((label) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="text-slate-300">-</span>
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={car.estado} />
              {car.etiqueta && <EtiquetaBadge etiqueta={car.etiqueta} size="md" />}
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-slate-900">{formatPrice(car.precio)}</p>
            <p className="text-sm text-slate-400 mt-1">{car.año} · {formatKm(car.kilometraje)}</p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Gallery + specs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-slate-100 relative">
              <CarGallery images={car.imagenes} carName={formatCarTitle(car.marca, car.modelo, car.año)} />
              {car.estado !== "disponible" && (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${car.estado === "vendido" ? "bg-black/50" : "bg-black/35"}`}>
                  <span className={`px-6 py-3 rounded-lg font-black text-2xl uppercase tracking-widest border-4 ${
                    car.estado === "vendido"
                      ? "border-red-500 text-red-400 bg-black/60"
                      : "border-amber-400 text-amber-300 bg-black/60"
                  }`}>
                    {car.estado === "vendido" ? "Vendido" : "Reservado"}
                  </span>
                </div>
              )}
            </div>

            {/* Specs grid */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { label: "Año", value: car.año.toString() },
                  { label: "Km", value: formatKm(car.kilometraje) },
                  { label: "Combustible", value: car.combustible },
                  { label: "Cambio", value: car.transmision },
                  ...(car.potencia ? [{ label: "Potencia", value: `${car.potencia} CV` }] : []),
                  ...(car.color ? [{ label: "Color", value: car.color }] : []),
                  ...(car.plazas ? [{ label: "Plazas", value: car.plazas.toString() }] : []),
                  ...(car.carroceria ? [{ label: "Carrocería", value: car.carroceria }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="font-bold text-slate-800 capitalize text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipamiento accordion */}
            {car.equipamiento && car.equipamiento.length > 0 && (
              <EquipamientoAccordion equipamiento={car.equipamiento} />
            )}

            {/* Tech specs */}
            <TechSpecs car={car} />


            {/* Mobile CTA */}
            <div className="lg:hidden bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-4">¿Te interesa este coche?</h3>
              <CarInterestForm car={car} />
            </div>
          </div>

          {/* Right sidebar — sticky */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">

              <div className="space-y-3 mb-6">
                <Button
                  variant="whatsapp"
                  size="lg"
                  fullWidth
                  onClick={() => window.open(whatsappUrl, "_blank")}
                  disabled={!isAvailable}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L0 24l6.338-1.503A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.034-1.378l-.361-.214-3.735.98.999-3.648-.235-.374A9.86 9.86 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.467 0 9.882 4.415 9.882 9.882 0 5.467-4.415 9.882-9.882 9.882z" />
                  </svg>
                  Consultar por WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => window.location.href = `tel:${siteSettings.telefono}`}
                  disabled={!isAvailable}
                  className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                >
                  <Phone className="w-5 h-5" />
                  {siteSettings.telefono}
                </Button>
              </div>

              {!isAvailable && (
                <p className="text-center text-sm text-slate-400 mb-4">
                  {car.estado === "reservado"
                    ? "Reservado. Contáctanos para más opciones."
                    : "Este coche ya ha sido vendido."}
                </p>
              )}

              <div className="border-t border-slate-100 pt-4">
                <ul className="space-y-2">
                  {["Visita con cita previa en Barcelona", "Sin presiones, trato directo", "Documentación en regla", "ITV vigente", "Mantenimiento realizado"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#7DC832" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interest form desktop */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4">¿Te interesa?</h3>
              <CarInterestForm car={car} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
