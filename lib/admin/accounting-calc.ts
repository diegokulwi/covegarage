/**
 * Cuentas a partir del libro diario, con las mismas reglas que las hojas del Excel (COMPRA STOCK, GASTO STOCK,
 * VENTAS y BENEFICIOS). Funciones puras: sirven en el servidor y se pueden comprobar contra los totales del Excel.
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

/** Una venta es una fila VENTA STOCK o un ingreso de GESTION VENTA (igual que la hoja BENEFICIOS). */
export const isSale = (e: LedgerEntry) => e.categoria === CAT.VENTA || (e.categoria === CAT.GESTION && e.tipo === "INGRESO");

export interface CarRow {
  plate: string;
  nombre: string;
  fechaCompra: string | null;
  costo: number; // compra del coche
  gastoStock: number;
  gastoGeneral: number; // gastos generales y de gestión asignados a este coche
  invertido: number; // costo + gasto stock
  venta: number;
  fechaVenta: string | null;
  vendido: boolean;
  enStock: boolean; // comprado y aún sin vender
  beneficio: number | null; // venta − compra − gasto stock − gasto general (solo si está vendido)
}

export interface Summary {
  costoStock: number; // total de COMPRA STOCK
  gastoStock: number; // total de GASTO STOCK
  ventas: number;
  gastosGenerales: number;
  beneficioVendidos: number;
  enStock: { n: number; costo: number; gasto: number };
  gastoStockSinMatricula: number; // gastos de stock que no llevan matrícula (varios coches a la vez); cuentan en el total pero no en un coche
  cars: CarRow[];
}

/** «COMPRA AUDI A1 1234ABC» → «AUDI A1»; «VENTA SEAT LEON 1234ABC (gestión)» → «SEAT LEON». */
function nameFromConcept(concepto: string, plate: string): string {
  return (concepto.replace(/\([^)]*\)/g, " ").replace(/^\s*(COMPRA|VENTA|PAGO)\s+/i, "").split(plate)[0] ?? "")
    .replace(/\b\d{4}\s?[A-Z]{3}\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Los gastos generales del Excel incluyen también los gastos de las gestiones de venta (hoja GASTOS GENERALES). */
const isGeneralExpense = (e: LedgerEntry) => e.categoria === CAT.GENERAL || (e.categoria === CAT.GESTION && e.tipo === "GASTO");

export function summarize(entries: LedgerEntry[], vehicles: LedgerVehicle[]): Summary {
  const names = new Map(vehicles.map((v) => [v.plate, v]));
  const total = (f: (e: LedgerEntry) => boolean) => entries.filter(f).reduce((a, e) => a + e.importe, 0);

  const plates = new Set<string>();
  for (const e of entries) {
    if (e.coche && (e.categoria === CAT.COMPRA || e.categoria === CAT.GASTO || isSale(e))) plates.add(e.coche);
  }

  const cars: CarRow[] = Array.from(plates).map((plate) => {
    const mine = entries.filter((e) => e.coche === plate);
    const sum = (f: (e: LedgerEntry) => boolean) => mine.filter(f).reduce((a, e) => a + e.importe, 0);
    const compraRows = mine.filter((e) => e.categoria === CAT.COMPRA);
    const sales = mine.filter(isSale);
    const costo = sum((e) => e.categoria === CAT.COMPRA);
    const gastoStock = sum((e) => e.categoria === CAT.GASTO);
    const gastoGeneral = sum(isGeneralExpense);
    const venta = sales.reduce((a, e) => a + e.importe, 0);
    const vendido = sales.length > 0;

    // Nombre: el de la hoja COMPRA-VENTA si el coche está allí; si no, el que sale del concepto de su compra (o de su venta).
    const v = names.get(plate);
    const fromConcept = nameFromConcept(compraRows[0]?.concepto ?? sales[0]?.concepto ?? "", plate);
    return {
      plate,
      nombre: v?.nombre || fromConcept || plate,
      fechaCompra: v?.fechaCompra ?? compraRows.map((e) => e.fecha).sort()[0] ?? null,
      costo: r2(costo),
      gastoStock: r2(gastoStock),
      gastoGeneral: r2(gastoGeneral),
      invertido: r2(costo + gastoStock),
      venta: r2(venta),
      fechaVenta: sales.map((e) => e.fecha).sort().slice(-1)[0] ?? null,
      vendido,
      enStock: !vendido && costo > 0,
      beneficio: vendido ? r2(venta - costo - gastoStock - gastoGeneral) : null,
    };
  });

  // Primero los que están en stock (los últimos comprados arriba) y después los vendidos (las últimas ventas arriba).
  cars.sort((a, b) => {
    if (a.vendido !== b.vendido) return a.vendido ? 1 : -1;
    const da = (a.vendido ? a.fechaVenta : a.fechaCompra) ?? "";
    const db = (b.vendido ? b.fechaVenta : b.fechaCompra) ?? "";
    return db.localeCompare(da);
  });

  const enStockCars = cars.filter((c) => c.enStock);
  const gastoStock = total((e) => e.categoria === CAT.GASTO);
  return {
    costoStock: r2(total((e) => e.categoria === CAT.COMPRA)),
    gastoStock: r2(gastoStock),
    gastoStockSinMatricula: r2(gastoStock - cars.reduce((a, c) => a + c.gastoStock, 0)),
    ventas: r2(total(isSale)),
    gastosGenerales: r2(total(isGeneralExpense)),
    beneficioVendidos: r2(cars.reduce((a, c) => a + (c.beneficio ?? 0), 0)),
    enStock: {
      n: enStockCars.length,
      costo: r2(enStockCars.reduce((a, c) => a + c.costo, 0)),
      gasto: r2(enStockCars.reduce((a, c) => a + c.gastoStock, 0)),
    },
    cars,
  };
}
