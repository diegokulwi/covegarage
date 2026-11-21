/**
 * Cuentas a partir del libro diario, con las mismas reglas que las hojas del Excel (COMPRA STOCK, GASTO STOCK,
 * VENTAS y BENEFICIOS) y, encima, lo que el Excel no calcula:
 *  - precio de venta de la web y beneficio bruto previsto de los coches en stock,
 *  - stock propio frente a gestión de venta,
 *  - el IVA trimestral repartido entre los coches vendidos.
 * Funciones puras: sirven en el servidor y se pueden comprobar contra los totales del Excel.
 */
import type { LedgerEntry, LedgerVehicle } from "@/lib/admin/accounting-import";

export const CAT = {
  COMPRA: "COMPRA STOCK",
  GASTO: "GASTO STOCK",
  VENTA: "VENTA STOCK",
  GESTION: "GESTION VENTA",
  GENERAL: "GASTO GENERAL",
  CAPITAL: "CAPITAL",
} as const;

const r2 = (n: number) => Math.round(n * 100) / 100;
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Una venta es una fila VENTA STOCK o un ingreso de GESTION VENTA (igual que la hoja BENEFICIOS). */
export const isSale = (e: LedgerEntry) => e.categoria === CAT.VENTA || (e.categoria === CAT.GESTION && e.tipo === "INGRESO");

/** Pago de IVA: un gasto general cuyo concepto empieza por «IVA» («IVA TRIMESTRE T3 (…)»). */
export const isIvaPayment = (e: LedgerEntry) => e.categoria === CAT.GENERAL && e.tipo === "GASTO" && /^\s*iva\b/.test(fold(e.concepto));

/** Los gastos generales del Excel incluyen también los gastos de las gestiones de venta (hoja GASTOS GENERALES). */
const isGeneralExpense = (e: LedgerEntry) => e.categoria === CAT.GENERAL || (e.categoria === CAT.GESTION && e.tipo === "GASTO");

export type Kind = "propio" | "gestion";

/** Un coche de la web (precio de venta que ve el público). */
export interface WebCar {
  id: string;
  nombre: string; // «Volkswagen Polo 2011»
  km: number;
  precio: number;
  estado: string;
  slug: string;
}

/** Datos que no vienen del Excel: qué coche de la web es cada matrícula y los coches en gestión. */
export interface Link {
  plate: string;
  carId: string | null;
  kind: "" | Kind;
  agreed: number | null; // precio acordado con el dueño (gestión de venta)
}

export interface CarRow {
  plate: string;
  nombre: string;
  fechaCompra: string | null;
  kind: Kind;
  costo: number; // compra del coche
  gastoStock: number;
  gastoGestion: number; // gastos de la gestión de venta de este coche (GESTION VENTA / GASTO)
  gasto: number; // gastoStock + gastoGestion: todo lo gastado en este coche
  gastoGeneral: number; // gastos generales con su matrícula (sin el IVA, que se reparte aparte)
  invertido: number; // costo + gasto
  agreed: number | null; // precio acordado con el dueño (solo gestión)
  venta: number; // venta real (en gestión, lo que ingresó la sociedad)
  fechaVenta: string | null;
  vendido: boolean;
  enStock: boolean; // propio: comprado y sin vender; gestión: sin vender
  sinCompra: boolean; // propio sin ninguna compra anotada (solo gastos)
  web: { id: string; nombre: string; precio: number; slug: string } | null;
  bruto: number | null; // vendido: venta − costo − gasto; en stock: precio web − costo (o acordado) − gasto
  brutoPrevisto: boolean; // el bruto sale del precio de la web (todavía no vendido)
  iva: number; // IVA repartido a este coche
  ivaPendiente: boolean; // vendido después del último pago de IVA anotado
  neto: number | null; // vendido: bruto − gastos generales − IVA
  enLibro: boolean; // tiene movimientos en el libro diario
  registrada: boolean; // coche en gestión dado de alta a mano en el panel
}

export interface IvaPayment {
  fecha: string;
  concepto: string;
  importe: number;
  reparto: { plate: string; nombre: string; parte: number }[];
  avisos: string[];
}

export interface Summary {
  costoStock: number; // total de COMPRA STOCK
  gastoStock: number; // total de GASTO STOCK
  gastoStockGestion: number; // la parte de GASTO STOCK que corresponde a coches en gestión
  gastoStockSinMatricula: number; // gastos de stock sin matrícula: cuentan en el total pero no en un coche
  ventas: number;
  ventasGestion: number; // la parte de las ventas que son ingresos de gestión de venta
  gastosGenerales: number; // total GASTO GENERAL + gastos de gestión de venta (como en el Excel; incluye el IVA pagado)
  gastosGestionVenta: number;
  brutoVendidos: number;
  ivaRepartido: number;
  beneficioVendidos: number; // neto: bruto − gastos generales con matrícula − IVA
  enStock: {
    n: number;
    propio: { n: number; costo: number; gasto: number };
    gestion: { n: number; gasto: number; acordado: number };
  };
  previsto: { bruto: number; conPrecio: number; sinPrecio: number }; // beneficio bruto previsto de lo que está en stock
  iva: { pagos: IvaPayment[]; total: number; ultimoPago: string | null; pendientes: { plate: string; nombre: string }[] };
  cars: CarRow[];
}

/** «COMPRA AUDI A1 1234ABC» → «AUDI A1»; «VENTA SEAT LEON 1234ABC (gestión)» → «SEAT LEON». */
function nameFromConcept(concepto: string, plate: string): string {
  return (concepto.replace(/\([^)]*\)/g, " ").replace(/^\s*(COMPRA|VENTA|PAGO)\s+/i, "").split(plate)[0] ?? "")
    .replace(/\b\d{4}\s?[A-Z]{3}\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reparte un importe en n partes iguales sin perder ni inventar céntimos. */
function splitCents(importe: number, n: number): number[] {
  const cents = Math.round(importe * 100);
  const base = Math.floor(cents / n);
  const resto = cents - base * n;
  return Array.from({ length: n }, (_, i) => (base + (i < resto ? 1 : 0)) / 100);
}

export function summarize(
  entries: LedgerEntry[],
  vehicles: LedgerVehicle[],
  opts: { links?: Link[]; webCars?: WebCar[] } = {}
): Summary {
  const names = new Map(vehicles.map((v) => [v.plate, v]));
  const links = new Map((opts.links ?? []).map((l) => [l.plate, l]));
  const webById = new Map((opts.webCars ?? []).map((w) => [w.id, w]));
  const total = (f: (e: LedgerEntry) => boolean) => entries.filter(f).reduce((a, e) => a + e.importe, 0);

  const plates = new Set<string>();
  for (const e of entries) {
    if (e.coche && (e.categoria === CAT.COMPRA || e.categoria === CAT.GASTO || e.categoria === CAT.GESTION || isSale(e))) plates.add(e.coche);
  }
  // Coches en gestión dados de alta a mano que aún no tienen movimientos en el Excel.
  links.forEach((l) => {
    if (l.kind === "gestion") plates.add(l.plate);
  });

  const cars: CarRow[] = Array.from(plates).map((plate) => {
    const mine = entries.filter((e) => e.coche === plate);
    const sum = (f: (e: LedgerEntry) => boolean) => mine.filter(f).reduce((a, e) => a + e.importe, 0);
    const compraRows = mine.filter((e) => e.categoria === CAT.COMPRA);
    const sales = mine.filter(isSale);
    const link = links.get(plate);

    const costo = sum((e) => e.categoria === CAT.COMPRA);
    const gastoStock = sum((e) => e.categoria === CAT.GASTO);
    const gastoGestion = sum((e) => e.categoria === CAT.GESTION && e.tipo === "GASTO");
    const gastoGeneral = sum((e) => e.categoria === CAT.GENERAL && !isIvaPayment(e));
    const gasto = gastoStock + gastoGestion;
    const venta = sales.reduce((a, e) => a + e.importe, 0);
    const vendido = sales.length > 0;

    // Propio o gestión: lo que se haya marcado a mano; si no, por el Excel (sin compra pero con filas de gestión de venta = gestión).
    const kind: Kind =
      link?.kind === "gestion" || link?.kind === "propio"
        ? link.kind
        : compraRows.length === 0 && mine.some((e) => e.categoria === CAT.GESTION)
          ? "gestion"
          : "propio";
    const enStock = !vendido && (kind === "gestion" || costo > 0);
    const web = link?.carId ? (webById.get(link.carId) ?? null) : null;
    const agreed = link?.agreed ?? null;

    let bruto: number | null = null;
    if (vendido) bruto = venta - costo - gasto;
    else if (enStock && web) {
      if (kind === "propio") bruto = web.precio - costo - gasto;
      else if (agreed !== null) bruto = web.precio - agreed - gasto;
    }

    // Nombre: el de la hoja COMPRA-VENTA si el coche está allí; si no, el del concepto de su compra (o de su venta); si no, el de la web.
    const v = names.get(plate);
    const nombre = v?.nombre || nameFromConcept(compraRows[0]?.concepto ?? sales[0]?.concepto ?? "", plate) || web?.nombre || plate;

    return {
      plate,
      nombre,
      fechaCompra: v?.fechaCompra ?? compraRows.map((e) => e.fecha).sort()[0] ?? null,
      kind,
      costo: r2(costo),
      gastoStock: r2(gastoStock),
      gastoGestion: r2(gastoGestion),
      gasto: r2(gasto),
      gastoGeneral: r2(gastoGeneral),
      invertido: r2(costo + gasto),
      agreed,
      venta: r2(venta),
      fechaVenta: sales.map((e) => e.fecha).sort().slice(-1)[0] ?? null,
      vendido,
      enStock,
      sinCompra: !vendido && kind === "propio" && costo === 0,
      web: web ? { id: web.id, nombre: web.nombre, precio: web.precio, slug: web.slug } : null,
      bruto: bruto === null ? null : r2(bruto),
      brutoPrevisto: !vendido && bruto !== null,
      iva: 0,
      ivaPendiente: false,
      neto: null,
      enLibro: mine.length > 0,
      registrada: link?.kind === "gestion",
    };
  });

  // ---- IVA trimestral: cada pago se reparte a partes iguales entre los coches vendidos desde el pago anterior hasta su fecha ----
  const pagos = entries
    .filter(isIvaPayment)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.num ?? 0) - (b.num ?? 0));
  const grupos: { fecha: string; filas: LedgerEntry[] }[] = [];
  for (const p of pagos) {
    const g = grupos[grupos.length - 1];
    if (g && g.fecha === p.fecha) g.filas.push(p); // varios pagos el mismo día cuentan como uno
    else grupos.push({ fecha: p.fecha, filas: [p] });
  }
  const vendidos = cars
    .filter((c) => c.vendido && c.fechaVenta)
    .sort((a, b) => (a.fechaVenta as string).localeCompare(b.fechaVenta as string) || a.plate.localeCompare(b.plate));
  let anterior = "";
  const ivaPagos: IvaPayment[] = grupos.map((g) => {
    const cs = vendidos.filter((c) => (c.fechaVenta as string) > anterior && (c.fechaVenta as string) <= g.fecha);
    anterior = g.fecha;
    const importe = r2(g.filas.reduce((a, e) => a + e.importe, 0));
    const partes = cs.length > 0 ? splitCents(importe, cs.length) : [];
    cs.forEach((c, i) => {
      c.iva = r2(c.iva + partes[i]);
    });
    const avisos: string[] = [];
    if (g.filas.some((e) => /\b111\b/.test(`${e.concepto} ${e.observaciones}`))) {
      avisos.push("Parece incluir el Modelo 111: anótalo en otra fila para que no se cargue a los coches.");
    }
    if (cs.length === 0) avisos.push("No hay coches vendidos en este periodo: este IVA no se ha repartido.");
    return {
      fecha: g.fecha,
      concepto: g.filas.map((e) => e.concepto).join(" + "),
      importe,
      reparto: cs.map((c, i) => ({ plate: c.plate, nombre: c.nombre, parte: partes[i] })),
      avisos,
    };
  });
  const ultimoPago = grupos.length > 0 ? grupos[grupos.length - 1].fecha : null;
  for (const c of vendidos) c.ivaPendiente = ultimoPago !== null && (c.fechaVenta as string) > ultimoPago;
  for (const c of cars) if (c.vendido) c.neto = r2((c.bruto ?? 0) - c.gastoGeneral - c.iva);

  // Primero los que están en stock (los últimos comprados arriba) y después los vendidos (las últimas ventas arriba).
  cars.sort((a, b) => {
    if (a.vendido !== b.vendido) return a.vendido ? 1 : -1;
    const da = (a.vendido ? a.fechaVenta : a.fechaCompra) ?? "";
    const db = (b.vendido ? b.fechaVenta : b.fechaCompra) ?? "";
    return db.localeCompare(da);
  });

  const gestion = cars.filter((c) => c.kind === "gestion");
  const stockPropio = cars.filter((c) => c.kind === "propio" && c.enStock);
  const stockGestion = gestion.filter((c) => c.enStock);
  const enStockTodos = [...stockPropio, ...stockGestion];
  const gastoStockTotal = total((e) => e.categoria === CAT.GASTO);
  const sumCars = (cs: CarRow[], f: (c: CarRow) => number) => r2(cs.reduce((a, c) => a + f(c), 0));

  return {
    costoStock: r2(total((e) => e.categoria === CAT.COMPRA)),
    gastoStock: r2(gastoStockTotal),
    gastoStockGestion: sumCars(gestion, (c) => c.gastoStock),
    gastoStockSinMatricula: r2(gastoStockTotal - cars.reduce((a, c) => a + c.gastoStock, 0)),
    ventas: r2(total(isSale)),
    ventasGestion: sumCars(gestion, (c) => c.venta),
    gastosGenerales: r2(total(isGeneralExpense)),
    gastosGestionVenta: r2(total((e) => e.categoria === CAT.GESTION && e.tipo === "GASTO")),
    brutoVendidos: sumCars(cars.filter((c) => c.vendido), (c) => c.bruto ?? 0),
    ivaRepartido: sumCars(cars, (c) => c.iva),
    beneficioVendidos: sumCars(cars.filter((c) => c.vendido), (c) => c.neto ?? 0),
    enStock: {
      n: enStockTodos.length,
      propio: { n: stockPropio.length, costo: sumCars(stockPropio, (c) => c.costo), gasto: sumCars(stockPropio, (c) => c.gasto) },
      gestion: {
        n: stockGestion.length,
        gasto: sumCars(stockGestion, (c) => c.gasto),
        acordado: sumCars(stockGestion, (c) => c.agreed ?? 0),
      },
    },
    previsto: {
      bruto: sumCars(enStockTodos, (c) => c.bruto ?? 0),
      conPrecio: enStockTodos.filter((c) => c.bruto !== null).length,
      sinPrecio: enStockTodos.filter((c) => c.bruto === null).length,
    },
    iva: {
      pagos: ivaPagos,
      total: r2(ivaPagos.reduce((a, p) => a + p.importe, 0)),
      ultimoPago,
      pendientes: vendidos.filter((c) => c.ivaPendiente).map((c) => ({ plate: c.plate, nombre: c.nombre })),
    },
    cars,
  };
}
