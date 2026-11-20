/**
 * Lee el Excel de compra-venta (hoja «LIBRO DIARIO» y, si está, «COMPRA-VENTA» para los nombres de los coches).
 * Solo funciones puras: no toca la base de datos. Las columnas se buscan por el texto de la cabecera, así que
 * da igual si se mueven de sitio; lo que no puede cambiar es el nombre de las hojas ni el de las cabeceras.
 */
import ExcelJS from "exceljs";

export interface LedgerEntry {
  num: number | null;
  fecha: string; // AAAA-MM-DD
  concepto: string;
  coche: string; // matrícula sin espacios ni guiones
  categoria: string;
  tipo: string;
  quien: string;
  importe: number;
  observaciones: string;
}

export interface LedgerVehicle {
  plate: string;
  nombre: string;
  fechaCompra: string | null;
}

export interface ParsedWorkbook {
  entries: LedgerEntry[];
  vehicles: LedgerVehicle[];
  warnings: string[];
}

const MAX_ENTRIES = 5000;

const norm = (s: unknown): string =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const normPlate = (s: unknown): string => String(s ?? "").toUpperCase().replace(/[\s.\-]+/g, "");
const clip = (s: unknown, n: number): string => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Valor de una celda: si es fórmula, su resultado guardado; si es texto con formato, el texto. */
function raw(c: ExcelJS.Cell): unknown {
  const v = c.value as unknown;
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object") {
    const o = v as { result?: unknown; richText?: { text: string }[]; text?: unknown };
    if ("result" in o) return o.result instanceof Date || typeof o.result !== "object" ? (o.result ?? null) : null;
    if (Array.isArray(o.richText)) return o.richText.map((t) => t.text).join("");
    if (typeof o.text === "string") return o.text;
    return null;
  }
  return v;
}

function toDate(v: unknown): string | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  if (typeof v === "number" && v > 20000 && v < 80000) {
    return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    const s = v.trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
    if (m) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }
  }
  return null;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "") return null;
    const n = s.includes(",") ? Number(s.replace(/\./g, "").replace(",", ".")) : Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function headerColumns(ws: ExcelJS.Worksheet, row: number): Record<string, number> {
  const cols: Record<string, number> = {};
  const r = ws.getRow(row);
  for (let i = 1; i <= Math.min(ws.columnCount, 40); i++) {
    const t = norm(raw(r.getCell(i)));
    if (!t) continue;
    if (t === "n" || t === "no" || t === "num") cols.num = cols.num || i;
    else if (t === "fecha") cols.fecha = cols.fecha || i;
    else if (t === "concepto") cols.concepto = cols.concepto || i;
    else if (t.includes("matricula") || t.startsWith("coche")) cols.coche = cols.coche || i;
    else if (t.startsWith("categoria")) cols.categoria = cols.categoria || i;
    else if (t === "tipo") cols.tipo = cols.tipo || i;
    else if (t === "quien") cols.quien = cols.quien || i;
    else if (t.startsWith("importe") && !t.includes("signo")) cols.importe = cols.importe || i;
    else if (t.startsWith("observ")) cols.observaciones = cols.observaciones || i;
  }
  return cols;
}

function parseLedger(ws: ExcelJS.Worksheet, warnings: string[]): LedgerEntry[] {
  let header = 0;
  let cols: Record<string, number> = {};
  for (let r = 1; r <= 25 && !header; r++) {
    const c = headerColumns(ws, r);
    if (c.fecha && c.categoria && c.importe) {
      header = r;
      cols = c;
    }
  }
  if (!header) {
    warnings.push("No encuentro las cabeceras (FECHA, CATEGORÍA, IMPORTE) en la hoja LIBRO DIARIO.");
    return [];
  }

  const entries: LedgerEntry[] = [];
  let skipped = 0;
  for (let r = header + 1; r <= ws.rowCount && entries.length < MAX_ENTRIES; r++) {
    const row = ws.getRow(r);
    const get = (k: string) => (cols[k] ? raw(row.getCell(cols[k])) : null);
    const fecha = toDate(get("fecha"));
    const importe = toNumber(get("importe"));
    const categoria = clip(get("categoria"), 40).toUpperCase();
    if (!fecha && !categoria) continue; // fila vacía, de totales («TOTALES / INGRESOS / GASTOS») o de notas
    if (!fecha || importe === null || !categoria) {
      skipped++;
      continue;
    }
    const num = toNumber(get("num"));
    entries.push({
      num: num !== null ? Math.round(num) : null,
      fecha,
      concepto: clip(get("concepto"), 200),
      coche: normPlate(get("coche")).slice(0, 20),
      categoria,
      tipo: clip(get("tipo"), 20).toUpperCase(),
      quien: clip(get("quien"), 40).toUpperCase(),
      importe: Math.round(importe * 100) / 100,
      observaciones: clip(get("observaciones"), 300),
    });
  }
  if (skipped > 0) warnings.push(`${skipped} fila(s) del libro diario se ignoraron por faltarles fecha, categoría o importe.`);
  return entries;
}

const PLATE = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{5,17}$/;

function parseVehicles(ws: ExcelJS.Worksheet): LedgerVehicle[] {
  let header = 0;
  let name = 0;
  let plate = 0;
  let date = 0;
  for (let r = 1; r <= 6 && !header; r++) {
    const row = ws.getRow(r);
    let n = 0;
    let p = 0;
    let d = 0;
    for (let i = 1; i <= Math.min(ws.columnCount, 40); i++) {
      const t = norm(raw(row.getCell(i)));
      if (t.startsWith("marca")) n = n || i;
      else if (t.includes("matricula")) p = p || i;
      else if (t === "fecha compra") d = d || i;
    }
    if (n && p) {
      header = r;
      name = n;
      plate = p;
      date = d;
    }
  }
  if (!header) return [];

  const out = new Map<string, LedgerVehicle>();
  for (let r = header + 1; r <= Math.min(ws.rowCount, header + 400); r++) {
    const row = ws.getRow(r);
    const p = normPlate(raw(row.getCell(plate)));
    const nombre = clip(raw(row.getCell(name)), 80);
    // Solo matrículas de verdad (así no se cuelan las tablitas de apuntes que hay a un lado de la hoja).
    if (!PLATE.test(p) || !nombre) continue;
    out.set(p, { plate: p, nombre, fechaCompra: date ? toDate(raw(row.getCell(date))) : null });
  }
  return Array.from(out.values());
}

export async function parseAccountingWorkbook(buffer: Buffer): Promise<ParsedWorkbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const warnings: string[] = [];

  const ledger = wb.worksheets.find((w) => norm(w.name).includes("libro diario"));
  if (!ledger) {
    return { entries: [], vehicles: [], warnings: ["No encuentro la hoja «LIBRO DIARIO» en este Excel."] };
  }
  const entries = parseLedger(ledger, warnings);

  const sheet1 = wb.worksheets.find((w) => norm(w.name) === "compra venta");
  const vehicles = sheet1 ? parseVehicles(sheet1) : [];
  if (!sheet1) warnings.push("No encuentro la hoja «COMPRA-VENTA»: los coches se mostrarán con el nombre del concepto.");

  return { entries, vehicles, warnings };
}
