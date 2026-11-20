/**
 * Vídeos de cada coche para enviarlos a un cliente que los pida. Solo son enlaces (YouTube «No listado», Google Drive…):
 * en el panel no se guarda ningún archivo, así que no cuesta almacenamiento. Van en su propia tabla, NO dentro de los
 * datos del coche, para que nunca lleguen a las páginas públicas.
 */
import { dbQuery } from "@/lib/db/schema";
import { logAction } from "@/lib/admin/audit";

export interface VideoRow {
  id: number;
  car_id: string;
  title: string;
  url: string;
  position: number;
}

const MAX_VIDEOS_PER_CAR = 20;

/** Solo enlaces https completos. */
export function parseVideoUrl(raw: string): string | null {
  const s = raw.trim();
  if (s.length === 0 || s.length > 500) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" && u.hostname.includes(".") ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function listVideos(carId: string): Promise<VideoRow[]> {
  return dbQuery<VideoRow>(
    "select id, car_id, title, url, position from car_videos where car_id = $1 order by position, id",
    [carId]
  );
}

/** Todos los vídeos agrupados por coche (para el listado de coches). */
export async function listAllVideos(): Promise<Record<string, VideoRow[]>> {
  const rows = await dbQuery<VideoRow>(
    "select id, car_id, title, url, position from car_videos order by car_id, position, id"
  );
  const byCar: Record<string, VideoRow[]> = {};
  for (const r of rows) (byCar[r.car_id] ??= []).push(r);
  return byCar;
}

type Result = { ok: true } | { ok: false; error: string };

export async function addVideo(
  carId: string,
  raw: { title?: string; url?: string },
  adminEmail: string
): Promise<Result> {
  const url = parseVideoUrl(String(raw.url ?? ""));
  if (!url) return { ok: false, error: "Pega el enlace completo del vídeo (empieza por https://)." };
  const title = String(raw.title ?? "").trim().slice(0, 80);

  const car = await dbQuery<{ data: { marca: string; modelo: string; año: number } }>(
    "select data from cars where id = $1",
    [carId]
  );
  if (!car[0]) return { ok: false, error: "Ese coche ya no existe." };

  const count = await dbQuery<{ n: number }>("select count(*)::int as n from car_videos where car_id = $1", [carId]);
  if ((count[0]?.n ?? 0) >= MAX_VIDEOS_PER_CAR) {
    return { ok: false, error: `Ya hay ${MAX_VIDEOS_PER_CAR} vídeos en este coche.` };
  }

  await dbQuery(
    `insert into car_videos (car_id, title, url, position)
     values ($1, $2, $3, (select coalesce(max(position), -1) + 1 from car_videos where car_id = $1))`,
    [carId, title, url]
  );
  const c = car[0].data;
  await logAction(adminEmail, "añadir vídeo", "coche", carId, `${c.marca} ${c.modelo} ${c.año}: ${title || "vídeo"}`);
  return { ok: true };
}

export async function deleteVideo(id: number, adminEmail: string): Promise<void> {
  const row = await dbQuery<{ car_id: string; title: string }>("select car_id, title from car_videos where id = $1", [id]);
  await dbQuery("delete from car_videos where id = $1", [id]);
  if (row[0]) await logAction(adminEmail, "quitar vídeo", "coche", row[0].car_id, row[0].title || "vídeo");
}
