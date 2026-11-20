/**
 * Funciones puras sobre listas de coches (filtrar, ordenar, destacados, similares).
 * No tocan la base de datos, así que sirven igual en el servidor y en el navegador (filtros del listado).
 */
import { Car, CarFilters } from "@/types/car";

const estadoOrder = (e: string) => (e === "disponible" ? 0 : e === "reservado" ? 1 : 2);
const fechaMs = (c: Car) => new Date(c.fechaPublicacion).getTime();

/** Filtra y ordena como siempre: primero disponibles, luego reservados y vendidos; dentro de cada grupo, los más recientes primero. */
export function filterCars(all: Car[], filters?: CarFilters): Car[] {
  let cars = [...all];

  if (filters) {
    if (filters.marca) {
      cars = cars.filter((c) => c.marca.toLowerCase() === filters.marca!.toLowerCase());
    }
    if (filters.modelo) {
      cars = cars.filter((c) => c.modelo.toLowerCase() === filters.modelo!.toLowerCase());
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
      cars = cars.filter((c) => filters.extras!.every((e) => c.extras?.includes(e)));
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
    const diff = estadoOrder(a.estado) - estadoOrder(b.estado);
    if (diff !== 0) return diff;
    return fechaMs(b) - fechaMs(a);
  });
}

/** Los 3 coches disponibles publicados más recientemente (portada). */
export function pickFeatured(all: Car[]): Car[] {
  return [...all]
    .filter((c) => c.estado === "disponible")
    .sort((a, b) => fechaMs(b) - fechaMs(a))
    .slice(0, 3);
}

export function pickSimilar(all: Car[], carId: string, limit = 3): Car[] {
  const car = all.find((c) => c.id === carId);
  if (!car) return [];
  return all
    .filter((c) => c.id !== carId && c.estado === "disponible" && c.carroceria === car.carroceria)
    .slice(0, limit);
}

export function listMarcas(all: Car[]): string[] {
  return Array.from(new Set(all.map((c) => c.marca))).sort();
}

export function listModelosByMarca(all: Car[], marca: string): string[] {
  return Array.from(
    new Set(all.filter((c) => c.marca.toLowerCase() === marca.toLowerCase()).map((c) => c.modelo))
  ).sort();
}
