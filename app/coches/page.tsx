"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CarGrid from "@/components/cars/CarGrid";
import CarFilters from "@/components/cars/CarFilters";
import { getCars } from "@/lib/services/cars";
import { Car, CarFilters as FiltersType } from "@/types/car";

type SortOption = "relevantes" | "precio_asc" | "precio_desc" | "km_asc" | "km_desc" | "nuevos" | "antiguos" | "potencia";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevantes",  label: "Más relevantes" },
  { value: "precio_asc",  label: "Menor precio" },
  { value: "precio_desc", label: "Mayor precio" },
  { value: "km_asc",      label: "Menos kilómetros" },
  { value: "km_desc",     label: "Más kilómetros" },
  { value: "nuevos",      label: "Más nuevos" },
  { value: "antiguos",    label: "Últimos coches" },
  { value: "potencia",    label: "Más potente" },
];

function sortCars(cars: Car[], sort: SortOption): Car[] {
  const c = [...cars];
  switch (sort) {
    case "precio_asc":  return c.sort((a, b) => a.precio - b.precio);
    case "precio_desc": return c.sort((a, b) => b.precio - a.precio);
    case "km_asc":      return c.sort((a, b) => a.kilometraje - b.kilometraje);
    case "km_desc":     return c.sort((a, b) => b.kilometraje - a.kilometraje);
    case "nuevos":      return c.sort((a, b) => b.año - a.año);
    case "antiguos":    return c.sort((a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime());
    case "potencia":    return c.sort((a, b) => (b.potencia ?? 0) - (a.potencia ?? 0));
    default:            return c;
  }
}

function CochesContent() {
  const searchParams = useSearchParams();
  const [allFiltered, setAllFiltered] = useState<Car[]>([]);
  const [sorted, setSorted] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialFilters, setInitialFilters] = useState<FiltersType>({});
  const [sortBy, setSortBy] = useState<SortOption>("relevantes");

  useEffect(() => {
    const filters: FiltersType = {};

    const precioMax = searchParams.get("precioMax");
    if (precioMax) filters.precioMax = Number(precioMax);

    const carroceria = searchParams.get("carroceria");
    if (carroceria) filters.carroceria = carroceria as FiltersType["carroceria"];

    const transmision = searchParams.get("transmision");
    if (transmision) filters.transmision = transmision as FiltersType["transmision"];

    const combustible = searchParams.get("combustible");
    if (combustible) filters.combustible = combustible as FiltersType["combustible"];

    const marca = searchParams.get("marca");
    if (marca) filters.marca = marca;

    setInitialFilters(filters);

    async function load() {
      const result = await getCars(Object.keys(filters).length > 0 ? filters : undefined);
      setAllFiltered(result);
      setSorted(sortCars(result, sortBy));
      setLoading(false);
    }
    load();
  }, [searchParams]);

  const handleFilter = async (filters: FiltersType) => {
    const result = await getCars(filters);
    setAllFiltered(result);
    setSorted(sortCars(result, sortBy));
  };

  const handleSort = (newSort: SortOption) => {
    setSortBy(newSort);
    setSorted(sortCars(allFiltered, newSort));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-black text-dark-900 mb-1">
            Coches en venta
          </h1>
          <p className="text-slate-500 text-sm">
            Selección de vehículos verificados en Barcelona.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
            <CarFilters
              onFilter={handleFilter}
              totalResults={sorted.length}
              initialFilters={initialFilters}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-800">{sorted.length}</span> coches encontrados
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium hidden sm:block">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as SortOption)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
                  style={{ focusRingColor: "#7DC832" } as React.CSSProperties}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <CarFilters
                onFilter={handleFilter}
                totalResults={sorted.length}
                initialFilters={initialFilters}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                    <div className="aspect-[16/10] bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-6 bg-slate-200 rounded w-2/3" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 rounded w-1/3 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-semibold text-lg text-slate-600">No hay coches con esos filtros</p>
                <p className="text-sm mt-1">Prueba a ajustar los criterios de búsqueda.</p>
              </div>
            ) : (
              <CarGrid cars={sorted} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CochesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <CochesContent />
    </Suspense>
  );
}
