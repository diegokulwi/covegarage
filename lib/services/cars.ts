/**
 * Capa de servicio para coches (la usa la web pública, solo en el servidor).
 *
 * Con la base de datos configurada (DATABASE_URL) lee de ahí, que es lo que edita el panel de administración.
 * Sin base de datos configurada sigue leyendo lib/data/mockCars.ts, tal y como funcionaba la web hasta ahora.
 * Los componentes del navegador no pueden importar esto: para filtrar en el navegador usan lib/cars/filter.ts.
 */

import { Car, CarFilters, CarStatus } from "@/types/car";
import { mockCars } from "@/lib/data/mockCars";
import { isDbConfigured } from "@/lib/db";
import { dbQuery } from "@/lib/db/schema";
import {
  filterCars,
  pickFeatured,
  pickSimilar,
  listMarcas,
  listModelosByMarca,
} from "@/lib/cars/filter";

export interface CarRow {
  id: string;
  slug: string;
  estado: string;
  data: Car;
}

/** Convierte una fila de la tabla `cars` en un coche (las columnas id, slug y estado mandan sobre el JSON). */
export function rowToCar(r: CarRow): Car {
  return { ...r.data, id: r.id, slug: r.slug, estado: r.estado as CarStatus };
}

export async function loadAllCars(): Promise<Car[]> {
  if (!isDbConfigured()) return [...mockCars];
  const rows = await dbQuery<CarRow>("select id, slug, estado, data from cars order by position, id");
  return rows.map(rowToCar);
}

export async function getCars(filters?: CarFilters): Promise<Car[]> {
  return filterCars(await loadAllCars(), filters);
}

export async function getFeaturedCars(): Promise<Car[]> {
  return pickFeatured(await loadAllCars());
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  if (!isDbConfigured()) return mockCars.find((c) => c.slug === slug) ?? null;
  const rows = await dbQuery<CarRow>("select id, slug, estado, data from cars where slug = $1", [slug]);
  return rows[0] ? rowToCar(rows[0]) : null;
}

/** Si una dirección antigua de una ficha fue cambiada desde el panel, devuelve la nueva. */
export async function getSlugRedirect(slug: string): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const rows = await dbQuery<{ slug: string }>(
    `select c.slug from slug_redirects r join cars c on c.id = r.car_id where r.old_slug = $1`,
    [slug]
  );
  return rows[0]?.slug ?? null;
}

export async function getSimilarCars(carId: string, limit = 3): Promise<Car[]> {
  return pickSimilar(await loadAllCars(), carId, limit);
}

export async function getMarcas(): Promise<string[]> {
  return listMarcas(await loadAllCars());
}

export async function getModelosByMarca(marca: string): Promise<string[]> {
  return listModelosByMarca(await loadAllCars(), marca);
}
