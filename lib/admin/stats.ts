import { dbQuery } from "@/lib/db/schema";

export interface DashboardStats {
  disponibles: number;
  reservados: number;
  vendidos: number;
  valorStock: number; // suma de precios de disponibles + reservados
  vendidosMes: { n: number; total: number };
  vendidosAnio: { n: number; total: number };
  consultasNuevas: number;
  clientes: number;
  sinFotos: number;
}

export async function dashboardStats(): Promise<DashboardStats> {
  const [byEstado, mes, anio, nuevas, clientes, sinFotos] = await Promise.all([
    dbQuery<{ estado: string; n: number; total: string }>(
      `select estado, count(*)::int as n, coalesce(sum((data->>'precio')::bigint), 0)::text as total from cars group by estado`
    ),
    dbQuery<{ n: number; total: string }>(
      `select count(*)::int as n, coalesce(sum(coalesce(sold_price, (data->>'precio')::int)), 0)::text as total
         from cars where estado = 'vendido' and sold_at >= date_trunc('month', current_date)`
    ),
    dbQuery<{ n: number; total: string }>(
      `select count(*)::int as n, coalesce(sum(coalesce(sold_price, (data->>'precio')::int)), 0)::text as total
         from cars where estado = 'vendido' and sold_at >= date_trunc('year', current_date)`
    ),
    dbQuery<{ n: number }>("select count(*)::int as n from inquiries where is_new"),
    dbQuery<{ n: number }>("select count(*)::int as n from clients"),
    dbQuery<{ n: number }>(
      "select count(*)::int as n from cars where estado <> 'vendido' and json_array_length(data->'imagenes') = 0"
    ),
  ]);
  const get = (e: string) => byEstado.find((r) => r.estado === e);
  return {
    disponibles: get("disponible")?.n ?? 0,
    reservados: get("reservado")?.n ?? 0,
    vendidos: get("vendido")?.n ?? 0,
    valorStock: Number(get("disponible")?.total ?? 0) + Number(get("reservado")?.total ?? 0),
    vendidosMes: { n: mes[0]?.n ?? 0, total: Number(mes[0]?.total ?? 0) },
    vendidosAnio: { n: anio[0]?.n ?? 0, total: Number(anio[0]?.total ?? 0) },
    consultasNuevas: nuevas[0]?.n ?? 0,
    clientes: clientes[0]?.n ?? 0,
    sinFotos: sinFotos[0]?.n ?? 0,
  };
}
