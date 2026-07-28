"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CarFilters as FiltersType, CarExtra, CarroceriaType, EtiquetaType } from "@/types/car";
import { Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { getModelosByMarca } from "@/lib/services/cars";

interface CarFiltersProps {
  onFilter: (filters: FiltersType) => void;
  totalResults: number;
  initialFilters?: FiltersType;
}

const TODAS_LAS_MARCAS = [
  "Abarth", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti",
  "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Ferrari",
  "Fiat", "Ford", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia",
  "Lamborghini", "Land Rover", "Lexus", "Maserati", "Mazda", "Mercedes-Benz",
  "MG", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche",
  "Renault", "SEAT", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla",
  "Toyota", "Volkswagen", "Volvo",
];

const COMBUSTIBLES = ["gasolina", "diésel", "híbrido", "eléctrico"];
const TRANSMISIONES = ["manual", "automático", "semiautomático"];
const CARROCERIAS: CarroceriaType[] = ["Berlina", "Cabrio", "Coupé", "Familiar", "Monovolumen", "Pick up", "SUV", "Utilitario"];
const ETIQUETAS: EtiquetaType[] = ["0", "ECO", "C", "B", "Sin etiqueta"];
const EXTRAS: CarExtra[] = [
  "techo solar", "carplay", "asientos calefactables",
  "faros led", "tapizado de cuero", "tapizado de alcántara", "tracción total (4x4)",
];
const COLORES = [
  "Beige", "Blanco", "Azul", "Burdeos", "Dorado", "Gris", "Marrón",
  "Naranja", "Negro", "Plata", "Rojo", "Verde", "Amarillo",
];

const PRECIOS = [
  { label: "Hasta 3.000€", max: 3000 },
  { label: "Hasta 6.000€", max: 6000 },
  { label: "Hasta 10.000€", max: 10000 },
  { label: "Más de 10.000€", min: 10000 },
];

const AÑOS = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => 2005 + i).reverse();

export default function CarFilters({ onFilter, totalResults, initialFilters = {} }: CarFiltersProps) {
  const [filters, setFilters] = useState<FiltersType>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [potencia, setPotencia] = useState(500);
  const [km, setKm] = useState(300000);
  const [modelosDisponibles, setModelosDisponibles] = useState<string[]>([]);

  useEffect(() => {
    if (filters.marca) {
      getModelosByMarca(filters.marca).then(setModelosDisponibles);
    } else {
      setModelosDisponibles([]);
    }
  }, [filters.marca]);

  const activeCount =
    Object.entries(filters).filter(([, v]) =>
      v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    ).length + (potencia < 500 ? 1 : 0) + (km < 300000 ? 1 : 0);

  const pushFilters = (updated: FiltersType, newPotencia = potencia, newKm = km) => {
    const final = {
      ...updated,
      potenciaMax: newPotencia < 500 ? newPotencia : undefined,
      kmMax: newKm < 300000 ? newKm : undefined,
    };
    setFilters(updated);
    onFilter(final);
  };

  const updateFilter = (key: keyof FiltersType, value: string | number | undefined) => {
    const updated = { ...filters, [key]: value || undefined };
    pushFilters(updated);
  };

  const handlePrecioChange = (value: string) => {
    const { precioMin, precioMax, ...rest } = filters;
    if (!value) { pushFilters(rest); return; }
    const range = PRECIOS[parseInt(value)];
    pushFilters({ ...rest, precioMin: range.min, precioMax: range.max });
  };

  const toggleExtra = (extra: CarExtra) => {
    const current = filters.extras ?? [];
    const updated = current.includes(extra)
      ? current.filter((e) => e !== extra)
      : [...current, extra];
    pushFilters({ ...filters, extras: updated.length ? updated : undefined });
  };

  const handlePotencia = (value: number) => {
    setPotencia(value);
    pushFilters(filters, value, km);
  };

  const handleKm = (value: number) => {
    setKm(value);
    pushFilters(filters, potencia, value);
  };

  const clearFilters = () => {
    setFilters({});
    setPotencia(500);
    setKm(300000);
    onFilter({});
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 font-semibold text-dark-900 hover:text-[#7DC832] transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <span className="w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: "#7DC832" }}>
              {activeCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            <strong className="text-dark-900">{totalResults}</strong> coches
          </span>
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        showFilters ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0 lg:max-h-[1200px] lg:opacity-100"
      )}>
        <div className="p-4 space-y-4">

          {/* Selects — 1 columna en sidebar, 2 col en móvil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <Select label="Marca" value={filters.marca || ""} onChange={(e) => {
              const newMarca = e.target.value;
              const updated = { ...filters, marca: newMarca || undefined, modelo: undefined };
              setFilters(updated);
              onFilter({ ...updated, potenciaMax: potencia < 500 ? potencia : undefined, kmMax: km < 300000 ? km : undefined });
            }}>
              <option value="">Todas las marcas</option>
              {TODAS_LAS_MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>

            {modelosDisponibles.length > 0 && (
              <Select label="Modelo" value={filters.modelo || ""} onChange={(e) => updateFilter("modelo", e.target.value || undefined)}>
                <option value="">Todos los modelos</option>
                {modelosDisponibles.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            )}

            <Select label="Precio" onChange={(e) => handlePrecioChange(e.target.value)}>
              <option value="">Cualquier precio</option>
              {PRECIOS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
            </Select>

            <Select label="Año desde" value={filters.añoMin || ""} onChange={(e) => updateFilter("añoMin", e.target.value ? parseInt(e.target.value) : undefined)}>
              <option value="">Cualquier año</option>
              {AÑOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>

            <Select label="Combustible" value={filters.combustible || ""} onChange={(e) => updateFilter("combustible", e.target.value as any)}>
              <option value="">Cualquier combustible</option>
              {COMBUSTIBLES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>

            <Select label="Transmisión" value={filters.transmision || ""} onChange={(e) => updateFilter("transmision", e.target.value as any)}>
              <option value="">Cualquier transmisión</option>
              {TRANSMISIONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </Select>

            <Select label="Carrocería" value={filters.carroceria || ""} onChange={(e) => updateFilter("carroceria", e.target.value as any)}>
              <option value="">Cualquier carrocería</option>
              {CARROCERIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Select label="Color" value={filters.color || ""} onChange={(e) => updateFilter("color", e.target.value)}>
              <option value="">Cualquier color</option>
              {COLORES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Select label="Etiqueta medioambiental" value={filters.etiqueta || ""} onChange={(e) => updateFilter("etiqueta", e.target.value as EtiquetaType || undefined)}>
              <option value="">Cualquier etiqueta</option>
              {ETIQUETAS.map((e) => <option key={e} value={e}>{e === "0" ? "0 Emisiones" : `Etiqueta ${e}`}</option>)}
            </Select>

            <Select label="Plazas" value={filters.plazas?.toString() || ""} onChange={(e) => updateFilter("plazas", e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Cualquier número</option>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>{n} plazas</option>
              ))}
            </Select>
          </div>

          {/* Sliders KM + Potencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* KM */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kilómetros máx.</label>
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">0 km</span>
                  <span className="text-sm font-bold text-dark-900">
                    {km < 300000 ? `hasta ${km.toLocaleString("es-ES")} km` : "Sin límite"}
                  </span>
                  <span className="text-xs text-slate-400">300.000 km</span>
                </div>
                <input
                  type="range" min={0} max={300000} step={5000} value={km}
                  onChange={(e) => handleKm(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #7DC832 0%, #7DC832 ${(km / 300000) * 100}%, #e2e8f0 ${(km / 300000) * 100}%, #e2e8f0 100%)`,
                    accentColor: "#7DC832",
                  }}
                />
              </div>
            </div>

            {/* Potencia */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potencia máx. CV</label>
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">50 CV</span>
                  <span className="text-sm font-bold text-dark-900">
                    {potencia < 500 ? `hasta ${potencia} CV` : "Sin límite"}
                  </span>
                  <span className="text-xs text-slate-400">500 CV</span>
                </div>
                <input
                  type="range" min={50} max={500} step={1} value={potencia}
                  onChange={(e) => handlePotencia(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #7DC832 0%, #7DC832 ${((potencia - 50) / 450) * 100}%, #e2e8f0 ${((potencia - 50) / 450) * 100}%, #e2e8f0 100%)`,
                    accentColor: "#7DC832",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Extras */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extras</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {EXTRAS.map((extra) => {
                const active = filters.extras?.includes(extra);
                return (
                  <button
                    key={extra}
                    onClick={() => toggleExtra(extra)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                      active
                        ? "border-[#7DC832] text-[#7DC832] bg-[#7DC832]/10"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    )}
                  >
                    {extra.charAt(0).toUpperCase() + extra.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden px-4 pb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
      </div>
    </div>
  );
}
