/**
 * Gestión de coches desde el panel: validar, crear, editar, cambiar precio/estado, registrar ventas, duplicar y borrar.
 * Cada cambio refresca la web pública al momento (revalidatePath) y queda anotado en el historial.
 */
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { dbQuery } from "@/lib/db/schema";
import { withTransaction } from "@/lib/db";
import { logAction } from "@/lib/admin/audit";
import { slugify } from "@/lib/admin/slug";
import { CarRow, rowToCar } from "@/lib/services/cars";
import {
  Car,
  CarExtra,
  CarStatus,
  CarroceriaType,
  EtiquetaType,
  FuelType,
  TransmissionType,
} from "@/types/car";
import {
  CARROCERIAS,
  COMBUSTIBLES,
  ESTADOS,
  ETIQUETAS,
  EXTRAS,
  TRANSMISIONES,
} from "@/lib/admin/car-options";

export interface AdminCar extends Car {
  soldAt: string | null;
  soldPrice: number | null;
  soldClientId: number | null;
  updatedAt: string;
}

interface AdminCarRow extends CarRow {
  sold_at: string | null;
  sold_price: number | null;
  sold_client_id: number | null;
  updated_at: Date;
}

const toAdminCar = (r: AdminCarRow): AdminCar => ({
  ...rowToCar(r),
  soldAt: r.sold_at ? String(r.sold_at).slice(0, 10) : null,
  soldPrice: r.sold_price,
  soldClientId: r.sold_client_id,
  updatedAt: new Date(r.updated_at).toISOString(),
});

const COLS = "id, slug, estado, data, sold_at::text as sold_at, sold_price, sold_client_id, updated_at";

export async function listAdminCars(): Promise<AdminCar[]> {
  const rows = await dbQuery<AdminCarRow>(`select ${COLS} from cars order by position, id`);
  return rows.map(toAdminCar);
}

export async function getAdminCar(id: string): Promise<AdminCar | null> {
  const rows = await dbQuery<AdminCarRow>(`select ${COLS} from cars where id = $1`, [id]);
  return rows[0] ? toAdminCar(rows[0]) : null;
}

/** La web pública se regenera al momento (fichas, listados, portada, sitemap). */
export function refreshPublicSite(): void {
  revalidatePath("/", "layout");
  // (el sitemap no hace falta refrescarlo aquí: se genera en cada petición, ver app/sitemap.ts)
}

// ---------- validación ----------

export type CarInput = Partial<Car> & { id?: string };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const optNum = (v: unknown, min: number, max: number): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
};

export function isAllowedImage(src: string): boolean {
  if (src.length > 600) return false;
  if (src.startsWith("/") && !src.startsWith("//") && !src.includes("..")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function parseCarInput(raw: unknown): { ok: true; car: Car } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Datos no válidos." };
  const r = raw as Record<string, unknown>;

  const marca = str(r.marca, 60);
  const modelo = str(r.modelo, 80);
  if (!marca) return { ok: false, error: "Falta la marca." };
  if (!modelo) return { ok: false, error: "Falta el modelo." };

  const año = optNum(r["año"], 1950, 2100);
  if (año === undefined || !Number.isInteger(año)) return { ok: false, error: "El año no es válido." };

  const kilometraje = optNum(r.kilometraje, 0, 3_000_000);
  if (kilometraje === undefined) return { ok: false, error: "Los kilómetros no son válidos." };

  const precio = optNum(r.precio, 0, 10_000_000);
  if (precio === undefined) return { ok: false, error: "El precio no es válido." };

  const combustible = r.combustible as FuelType;
  if (!COMBUSTIBLES.includes(combustible)) return { ok: false, error: "Elige el combustible." };
  const transmision = r.transmision as TransmissionType;
  if (!TRANSMISIONES.includes(transmision)) return { ok: false, error: "Elige el cambio." };
  const estado = (r.estado as CarStatus) ?? "disponible";
  if (!ESTADOS.includes(estado)) return { ok: false, error: "El estado no es válido." };

  const slug = str(r.slug, 120);
  if (!slug || slug !== slugify(slug)) {
    return { ok: false, error: "La dirección de la ficha solo puede llevar letras minúsculas, números y guiones." };
  }

  const fecha = str(r.fechaPublicacion, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    return { ok: false, error: "La fecha de publicación no es válida." };
  }

  const imagenes = Array.isArray(r.imagenes) ? (r.imagenes as unknown[]).filter((x) => typeof x === "string") as string[] : [];
  if (imagenes.length > 60) return { ok: false, error: "Demasiadas fotos (máximo 60)." };
  if (!imagenes.every(isAllowedImage)) return { ok: false, error: "Alguna foto tiene una dirección no válida." };

  const extras = (Array.isArray(r.extras) ? (r.extras as unknown[]) : []).filter((x): x is CarExtra =>
    EXTRAS.includes(x as CarExtra)
  );
  const equipamiento = (Array.isArray(r.equipamiento) ? (r.equipamiento as unknown[]) : [])
    .map((x) => str(x, 120))
    .filter(Boolean)
    .slice(0, 80);

  const carroceria = r.carroceria as CarroceriaType | undefined;
  const etiqueta = r.etiqueta as EtiquetaType | undefined;

  // Mismo orden de claves que lib/data/mockCars.ts (así el JSON guardado se lee igual de fácil).
  const car: Car = {
    id: str(r.id, 20),
    slug,
    marca,
    modelo,
    ...(str(r.version, 120) ? { version: str(r.version, 120) } : {}),
    año,
    kilometraje: Math.round(kilometraje),
    combustible,
    transmision,
    precio: Math.round(precio),
    ubicacion: str(r.ubicacion, 80) || "Barcelona",
    descripcion: str(r.descripcion, 6000),
    imagenes,
    estado,
    destacado: false,
    fechaPublicacion: fecha,
    ...(optNum(r.potencia, 1, 3000) !== undefined ? { potencia: optNum(r.potencia, 1, 3000) } : {}),
    ...(str(r.color, 40) ? { color: str(r.color, 40) } : {}),
    ...(optNum(r.puertas, 1, 9) !== undefined ? { puertas: optNum(r.puertas, 1, 9) } : {}),
    ...(optNum(r.plazas, 1, 12) !== undefined ? { plazas: optNum(r.plazas, 1, 12) } : {}),
    ...(carroceria && CARROCERIAS.includes(carroceria) ? { carroceria } : {}),
    ...(etiqueta && ETIQUETAS.includes(etiqueta) ? { etiqueta } : {}),
    ...(r.unicoPropietario === true ? { unicoPropietario: true } : {}),
    ...(r.segundoPropietario === true ? { segundoPropietario: true } : {}),
    ...(r.libroRevisiones === true ? { libroRevisiones: true } : {}),
    extras,
    equipamiento,
    ...(optNum(r.velocidadMax, 0, 600) !== undefined ? { velocidadMax: optNum(r.velocidadMax, 0, 600) } : {}),
    ...(optNum(r.aceleracion, 0, 60) !== undefined ? { aceleracion: optNum(r.aceleracion, 0, 60) } : {}),
    ...(optNum(r.consumo, 0, 60) !== undefined ? { consumo: optNum(r.consumo, 0, 60) } : {}),
    ...(optNum(r.emisiones, 0, 1000) !== undefined ? { emisiones: optNum(r.emisiones, 0, 1000) } : {}),
    ...(optNum(r.peso, 0, 10000) !== undefined ? { peso: optNum(r.peso, 0, 10000) } : {}),
    ...(optNum(r.maletero, 0, 5000) !== undefined ? { maletero: optNum(r.maletero, 0, 5000) } : {}),
    ...(optNum(r.deposito, 0, 500) !== undefined ? { deposito: optNum(r.deposito, 0, 500) } : {}),
    ...(optNum(r.longitud, 0, 20) !== undefined ? { longitud: optNum(r.longitud, 0, 20) } : {}),
    ...(optNum(r.anchura, 0, 5) !== undefined ? { anchura: optNum(r.anchura, 0, 5) } : {}),
    ...(optNum(r.altura, 0, 5) !== undefined ? { altura: optNum(r.altura, 0, 5) } : {}),
  };
  return { ok: true, car };
}

// ---------- guardar ----------

export type SaveResult = { ok: true; id: string; slug: string } | { ok: false; error: string };

/** Foto subida desde el panel (Vercel Blob): se borra del almacén cuando deja de usarse en la ficha. */
const isBlobUrl = (u: string) => /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(u);

async function dropBlobs(urls: string[]) {
  const blobs = urls.filter(isBlobUrl);
  if (blobs.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(blobs);
  } catch (e) {
    console.error("[blob] no se pudieron borrar fotos antiguas:", e);
  }
}

export async function saveCar(raw: unknown, adminEmail: string): Promise<SaveResult> {
  const parsed = parseCarInput(raw);
  if (!parsed.ok) return parsed;
  const car = parsed.car;

  const label = `${car.marca} ${car.modelo} ${car.año}`;
  let removedImages: string[] = [];

  const result = await withTransaction<SaveResult>(async (q) => {
    // La dirección de la ficha no puede repetirse.
    const clash = await q<{ id: string }>("select id from cars where slug = $1 and id <> $2", [car.slug, car.id || ""]);
    if (clash.length > 0) {
      if (car.id) return { ok: false, error: "Esa dirección de ficha ya la usa otro coche. Cambia el texto." };
      // coche nuevo: se busca la primera dirección libre (…-2, …-3)
      let n = 2;
      while ((await q("select 1 from cars where slug = $1", [`${car.slug}-${n}`])).length > 0) n++;
      car.slug = `${car.slug}-${n}`;
    }

    if (car.id) {
      const old = await q<{ id: string; slug: string; estado: string; data: Car }>(
        "select id, slug, estado, data from cars where id = $1 for update",
        [car.id]
      );
      if (!old[0]) return { ok: false, error: "Ese coche ya no existe." };

      removedImages = (old[0].data.imagenes ?? []).filter((u) => !car.imagenes.includes(u));
      await q("update cars set slug = $2, estado = $3, data = $4::json, updated_at = now() where id = $1", [
        car.id,
        car.slug,
        car.estado,
        JSON.stringify(car),
      ]);
      if (old[0].slug !== car.slug) {
        await q(
          "insert into slug_redirects (old_slug, car_id) values ($1, $2) on conflict (old_slug) do update set car_id = excluded.car_id",
          [old[0].slug, car.id]
        );
      }
      // Si la nueva dirección era una antigua de este mismo coche, ya no es redirección.
      await q("delete from slug_redirects where old_slug = $1", [car.slug]);
      if (car.estado === "vendido") {
        await q("update cars set sold_at = coalesce(sold_at, current_date) where id = $1", [car.id]);
      } else {
        await q("update cars set sold_at = null, sold_price = null, sold_client_id = null where id = $1", [car.id]);
      }
      return { ok: true, id: car.id, slug: car.slug };
    }

    // Coche nuevo: id correlativo (como los de siempre) y al final de la lista.
    const next = await q<{ n: number; pos: number }>(
      `select coalesce(max(case when id ~ '^[0-9]+$' then id::int end), 0) + 1 as n,
              coalesce(max(position), -1) + 1 as pos from cars`
    );
    const id = String(next[0].n);
    car.id = id;
    await q("insert into cars (id, position, slug, estado, data) values ($1, $2, $3, $4, $5::json)", [
      id,
      next[0].pos,
      car.slug,
      car.estado,
      JSON.stringify(car),
    ]);
    await q("delete from slug_redirects where old_slug = $1", [car.slug]);
    return { ok: true, id, slug: car.slug };
  });

  if (!result.ok) return result;
  await dropBlobs(removedImages);
  await logAction(adminEmail, raw && (raw as CarInput).id ? "editar" : "crear", "coche", result.id, label);
  refreshPublicSite();
  return result;
}

// ---------- cambios rápidos ----------

export interface QuickPatch {
  precio?: number;
  kilometraje?: number;
  estado?: CarStatus;
  /** Solo al marcar como vendido. */
  sale?: { price?: number | null; date?: string | null; clientId?: number | null };
}

export async function quickUpdateCar(id: string, patch: QuickPatch, adminEmail: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = await dbQuery<CarRow>("select id, slug, estado, data from cars where id = $1", [id]);
  if (!rows[0]) return { ok: false, error: "Ese coche ya no existe." };
  const car = rowToCar(rows[0]);
  const changes: string[] = [];

  if (patch.precio !== undefined) {
    const p = Math.round(Number(patch.precio));
    if (!Number.isFinite(p) || p < 0 || p > 10_000_000) return { ok: false, error: "El precio no es válido." };
    if (p !== car.precio) changes.push(`precio ${car.precio} → ${p} €`);
    car.precio = p;
  }
  if (patch.kilometraje !== undefined) {
    const k = Math.round(Number(patch.kilometraje));
    if (!Number.isFinite(k) || k < 0 || k > 3_000_000) return { ok: false, error: "Los kilómetros no son válidos." };
    if (k !== car.kilometraje) {
      changes.push(`km ${car.kilometraje} → ${k}`);
      // La descripción suele repetir los km ("… con 179.000 km"): se actualiza la cifra antigua.
      const oldFmt = car.kilometraje.toLocaleString("es-ES");
      const newFmt = k.toLocaleString("es-ES");
      if (oldFmt !== newFmt && car.descripcion.includes(`${oldFmt} km`)) {
        car.descripcion = car.descripcion.split(`${oldFmt} km`).join(`${newFmt} km`);
        changes.push("descripción actualizada");
      }
    }
    car.kilometraje = k;
  }
  if (patch.estado !== undefined) {
    if (!ESTADOS.includes(patch.estado)) return { ok: false, error: "El estado no es válido." };
    if (patch.estado !== car.estado) changes.push(`estado ${car.estado} → ${patch.estado}`);
    car.estado = patch.estado;
  }
  if (changes.length === 0) return { ok: true };

  const sale = patch.sale;
  const saleDate = sale?.date && /^\d{4}-\d{2}-\d{2}$/.test(sale.date) && !Number.isNaN(Date.parse(sale.date)) ? sale.date : null;
  const salePrice =
    sale?.price !== undefined && sale?.price !== null && Number.isFinite(Number(sale.price)) && Number(sale.price) >= 0
      ? Math.round(Number(sale.price))
      : null;
  const saleClient = sale?.clientId && Number.isInteger(Number(sale.clientId)) ? Number(sale.clientId) : null;
  await withTransaction(async (q) => {
    await q("update cars set estado = $2, data = $3::json, updated_at = now() where id = $1", [
      id,
      car.estado,
      JSON.stringify(car),
    ]);
    if (patch.estado === "vendido") {
      await q(
        `update cars set sold_at = coalesce($2::date, current_date), sold_price = $3,
                sold_client_id = (select id from clients where id = $4) where id = $1`,
        [id, saleDate, salePrice, saleClient]
      );
    } else if (patch.estado) {
      await q("update cars set sold_at = null, sold_price = null, sold_client_id = null where id = $1", [id]);
    }
  });
  await logAction(adminEmail, "cambio rápido", "coche", id, `${car.marca} ${car.modelo} ${car.año}: ${changes.join(", ")}`);
  refreshPublicSite();
  return { ok: true };
}

// ---------- duplicar y borrar ----------

export async function duplicateCar(id: string, adminEmail: string): Promise<SaveResult> {
  const src = await getAdminCar(id);
  if (!src) return { ok: false, error: "Ese coche ya no existe." };
  const base: Record<string, unknown> = { ...src };
  for (const k of ["soldAt", "soldPrice", "soldClientId", "updatedAt"]) delete base[k];

  let slug = `${src.slug}-copia`;
  for (let i = 2; (await dbQuery("select 1 from cars where slug = $1", [slug])).length > 0; i++) {
    slug = `${src.slug}-copia-${i}`;
  }
  return saveCar(
    {
      ...base,
      id: "",
      slug,
      estado: "disponible",
      fechaPublicacion: new Date().toISOString().slice(0, 10),
      // las fotos no se comparten con la copia: así borrar una no deja huérfana a la otra
      imagenes: [],
    },
    adminEmail
  );
}

export async function deleteCar(id: string, adminEmail: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const car = await getAdminCar(id);
  if (!car) return { ok: false, error: "Ese coche ya no existe." };
  await withTransaction(async (q) => {
    await q("delete from slug_redirects where car_id = $1", [id]);
    await q("update inquiries set car_id = null where car_id = $1", [id]);
    await q("delete from cars where id = $1", [id]);
  });
  await dropBlobs(car.imagenes);
  await logAction(adminEmail, "borrar", "coche", id, `${car.marca} ${car.modelo} ${car.año}`);
  refreshPublicSite();
  return { ok: true };
}
