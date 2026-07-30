/**
 * Capa de servicio para coches.
 * Hoy lee datos mockeados. En la fase Supabase, solo cambia la implementación
 * interna de estas funciones sin modificar ningún componente.
 */

import { Car, CarFilters } from "@/types/car";
import { mockCars } from "@/lib/data/mockCars";

export async function getCars(filters?: CarFilters): Promise<Car[]> {
  // TODO (Supabase): supabase.from('cars').select('*').order('fechaPublicacion', { ascending: false })
  let cars = [...mockCars];

  if (filters) {
    if (filters.marca) {
      cars = cars.filter(
        (c) => c.marca.toLowerCase() === filters.marca!.toLowerCase()
      );
    }
    if (filters.modelo) {
      cars = cars.filter(
        (c) => c.modelo.toLowerCase() === filters.modelo!.toLowerCase()
      );
    }
    if (filters.precioMin !== undefined) {
      cars = cars.filter((c) => c.precio >= filters.precioMin!);
    }
    if (filters.precioMax !== undefined) {
      cars = cars.filter((c) => c.precio <= filters.precioMax!);
    }
    if (filters.añoMin !== undefined) {
      cars = cars.filter((c) => c.año >= filters.añoMin!);
    }
    if (filters.añoMax !== undefined) {
      cars = cars.filter((c) => c.año <= filters.añoMax!);
    }
    if (filters.combustible) {
      cars = cars.filter((c) => c.combustible === filters.combustible);
    }
    if (filters.transmision) {
      cars = cars.filter((c) => c.transmision === filters.transmision);
    }
    if (filters.potenciaMin !== undefined) {
      cars = cars.filter((c) => (c.potencia ?? 0) >= filters.potenciaMin!);
    }
    if (filters.potenciaMax !== undefined) {
      cars = cars.filter((c) => (c.potencia ?? 9999) <= filters.potenciaMax!);
    }
    if (filters.kmMax !== undefined) {
      cars = cars.filter((c) => c.kilometraje <= filters.kmMax!);
    }
    if (filters.carroceria) {
      cars = cars.filter((c) => c.carroceria === filters.carroceria);
    }
    if (filters.color) {
      cars = cars.filter((c) => c.color?.toLowerCase() === filters.color!.toLowerCase());
    }
    if (filters.extras && filters.extras.length > 0) {
      cars = cars.filter((c) =>
        filters.extras!.every((e) => c.extras?.includes(e))
      );
    }
    if (filters.etiqueta) {
      cars = cars.filter((c) => c.etiqueta === filters.etiqueta);
    }
    if (filters.plazas !== undefined) {
      cars = cars.filter((c) => (c.plazas ?? 5) === filters.plazas);
    }
    if (filters.estado) {
      cars = cars.filter((c) => c.estado === filters.estado);
    }
  }

  return cars.sort((a, b) => {
    if (a.estado === "disponible" && b.estado !== "disponible") return -1;
    if (a.estado !== "disponible" && b.estado === "disponible") return 1;
    return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
  });
}

export async function getFeaturedCars(): Promise<Car[]> {
  // TODO (Supabase): supabase.from('cars').select('*').eq('estado','disponible').order('fechaPublicacion', { ascending: false }).limit(6)
  return [...mockCars]
    .filter((c) => c.estado === "disponible")
    .sort((a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime())
    .slice(0, 3);
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  // TODO (Supabase): supabase.from('cars').select('*').eq('slug', slug).single()
  return mockCars.find((c) => c.slug === slug) ?? null;
}

export async function getSimilarCars(carId: string, limit = 3): Promise<Car[]> {
  // TODO (Supabase): supabase.from('cars').select('*').neq('id', carId).eq('estado', 'disponible').limit(limit)
  const car = mockCars.find((c) => c.id === carId);
  if (!car) return [];

  return mockCars
    .filter(
      (c) =>
        c.id !== carId &&
        c.estado === "disponible" &&
        c.carroceria === car.carroceria
    )
    .slice(0, limit);
}

export async function getMarcas(): Promise<string[]> {
  const marcas = Array.from(new Set(mockCars.map((c) => c.marca)));
  return marcas.sort();
}

export async function getModelosByMarca(marca: string): Promise<string[]> {
  const modelos = Array.from(new Set(
    mockCars.filter((c) => c.marca.toLowerCase() === marca.toLowerCase()).map((c) => c.modelo)
  ));
  return modelos.sort();
}
