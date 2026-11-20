import Link from "next/link";
import { loadLedger } from "@/lib/admin/accounting";
import { summarize } from "@/lib/admin/accounting-calc";
import { Badge, Card, Empty, PageHeader, dateOnly, inputClass, moneyCents } from "@/components/admin/ui";
import ImportExcel from "@/components/admin/ImportExcel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contabilidad" };

type SP = { vista?: string; cat?: string; quien?: string; mes?: string; q?: string };
const str = (v: unknown) => (typeof v === "string" ? v : "");
const MAX_FILAS = 500;

function Stat({ label, value, hint, negative }: { label: string; value: string; hint?: string; negative?: boolean }) {
  return (
    <Card className="p-4 h-full">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-1 ${negative ? "text-red-600" : "text-slate-900"}`}>{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </Card>
  );
}

const th = "px-3 py-3 font-semibold whitespace-nowrap";
const num = "px-3 py-3 text-right whitespace-nowrap tabular-nums";

export default async function ContabilidadPage({ searchParams }: { searchParams: SP }) {
  const { entries, vehicles, info } = await loadLedger();
  const s = summarize(entries, vehicles);
  const vista = searchParams.vista === "libro" ? "libro" : "coches";

  // Filtros del libro diario
  const cat = str(searchParams.cat);
  const quien = str(searchParams.quien);
  const mes = str(searchParams.mes);
  const q = str(searchParams.q).trim().toLowerCase();
  const categorias = Array.from(new Set(entries.map((e) => e.categoria))).sort();
  const socios = Array.from(new Set(entries.map((e) => e.quien).filter(Boolean))).sort();
  const meses = Array.from(new Set(entries.map((e) => e.fecha.slice(0, 7)))).sort().reverse();
  const filtrados = entries
    .filter((e) => (!cat || e.categoria === cat) && (!quien || e.quien === quien) && (!mes || e.fecha.startsWith(mes)))
    .filter((e) => !q || `${e.concepto} ${e.coche} ${e.observaciones}`.toLowerCase().includes(q))
    .reverse(); // los más recientes primero
  const ingresos = filtrados.filter((e) => e.tipo === "INGRESO").reduce((a, e) => a + e.importe, 0);
  const gastos = filtrados.filter((e) => e.tipo === "GASTO").reduce((a, e) => a + e.importe, 0);

  const tab = (v: string, label: string) => (
    <Link
      href={`/contabilidad${v === "libro" ? "?vista=libro" : ""}`}
      className={`h-9 px-3 inline-flex items-center rounded-lg text-sm font-medium ${
        vista === v ? "bg-dark-900 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );

  // El total de la tabla incluye los gastos de stock sin matrícula, para que cuadre con las tarjetas de arriba.
  const sinMat = s.gastoStockSinMatricula;
  const total = s.cars.reduce(
    (a, c) => ({
      costo: a.costo + c.costo,
      gasto: a.gasto + c.gastoStock,
      invertido: a.invertido + c.invertido,
      venta: a.venta + c.venta,
      beneficio: a.beneficio + (c.beneficio ?? 0),
    }),
    { costo: 0, gasto: sinMat, invertido: sinMat, venta: 0, beneficio: 0 }
  );

  return (
    <>
      <PageHeader
        title="Contabilidad"
        subtitle="Se actualiza subiendo tu Excel de compra-venta. Solo tú ves estos números."
      />
      <ImportExcel last={info} />

      {entries.length === 0 ? (
        <Card>
          <Empty
            title="Aún no hay datos"
            text="Sube el Excel con el botón de arriba y aquí aparecerán el costo del stock, el gasto, las ventas y el beneficio por coche."
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <Stat label="Costo stock" value={moneyCents(s.costoStock)} hint="Compras de coches (todas)" />
            <Stat label="Gasto stock" value={moneyCents(s.gastoStock)} hint="Gastos de los coches (todos)" />
            <Stat
              label="En stock ahora"
              value={`${s.enStock.n} ${s.enStock.n === 1 ? "coche" : "coches"}`}
              hint={`Costo ${moneyCents(s.enStock.costo)} · gasto ${moneyCents(s.enStock.gasto)}`}
            />
            <Stat label="Ventas" value={moneyCents(s.ventas)} hint="Venta de coches y gestión de venta" />
            <Stat label="Gastos generales" value={moneyCents(s.gastosGenerales)} hint="Incluye los gastos de gestión de venta" />
            <Stat
              label="Beneficio coches vendidos"
              value={moneyCents(s.beneficioVendidos)}
              hint="Suma de venta − compra − gastos de cada coche"
              negative={s.beneficioVendidos < 0}
            />
          </div>

          <div className="flex gap-2 my-5">
            {tab("coches", "Por coche")}
            {tab("libro", "Libro diario")}
          </div>

          {vista === "coches" ? (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className={`${th} pl-5`}>Coche</th>
                    <th className={th}>Estado</th>
                    <th className={`${th} text-right`}>Costo</th>
                    <th className={`${th} text-right`}>Gasto stock</th>
                    <th className={`${th} text-right`}>Invertido</th>
                    <th className={`${th} text-right`}>Venta</th>
                    <th className={`${th} text-right pr-5`}>Beneficio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {s.cars.map((c) => (
                    <tr key={c.plate} className="hover:bg-slate-50">
                      <td className="px-3 py-3 pl-5">
                        <p className="font-medium text-slate-900">{c.nombre}</p>
                        <p className="text-xs text-slate-400">
                          {[c.nombre !== c.plate ? c.plate : "", c.fechaCompra && c.costo > 0 ? `comprado ${dateOnly(c.fechaCompra)}` : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {c.vendido ? (
                          <Badge tone="slate">Vendido{c.fechaVenta ? ` ${dateOnly(c.fechaVenta)}` : ""}</Badge>
                        ) : c.enStock ? (
                          <Badge tone="green">En stock</Badge>
                        ) : (
                          <Badge tone="amber">Sin compra</Badge>
                        )}
                      </td>
                      <td className={num}>{moneyCents(c.costo)}</td>
                      <td className={num}>{moneyCents(c.gastoStock)}</td>
                      <td className={`${num} font-medium`}>{moneyCents(c.invertido)}</td>
                      <td className={num}>{c.vendido ? moneyCents(c.venta) : "—"}</td>
                      <td className={`${num} pr-5 font-medium ${c.beneficio !== null && c.beneficio < 0 ? "text-red-600" : "text-slate-900"}`}>
                        {c.beneficio !== null ? moneyCents(c.beneficio) : "—"}
                      </td>
                    </tr>
                  ))}
                  {sinMat !== 0 && (
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-3 pl-5">
                        <p className="font-medium text-slate-900">Gastos de stock sin matrícula</p>
                        <p className="text-xs text-slate-400">Apuntes de gasto stock que no llevan coche (mira el libro diario)</p>
                      </td>
                      <td className="px-3 py-3" />
                      <td className={num}>—</td>
                      <td className={num}>{moneyCents(sinMat)}</td>
                      <td className={`${num} font-medium`}>{moneyCents(sinMat)}</td>
                      <td className={num}>—</td>
                      <td className={`${num} pr-5`}>—</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                    <td className="px-3 py-3 pl-5" colSpan={2}>
                      Total
                    </td>
                    <td className={num}>{moneyCents(total.costo)}</td>
                    <td className={num}>{moneyCents(total.gasto)}</td>
                    <td className={num}>{moneyCents(total.invertido)}</td>
                    <td className={num}>{moneyCents(total.venta)}</td>
                    <td className={`${num} pr-5`}>{moneyCents(total.beneficio)}</td>
                  </tr>
                </tfoot>
              </table>
            </Card>
          ) : (
            <>
              <form action="/contabilidad" className="grid sm:grid-cols-[1fr,repeat(3,minmax(0,170px)),auto] gap-2 mb-4">
                <input type="hidden" name="vista" value="libro" />
                <input name="q" defaultValue={q} className={inputClass} placeholder="Buscar concepto o matrícula…" />
                <select name="cat" defaultValue={cat} className={inputClass}>
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select name="quien" defaultValue={quien} className={inputClass}>
                  <option value="">Todos los socios</option>
                  {socios.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select name="mes" defaultValue={mes} className={inputClass}>
                  <option value="">Todos los meses</option>
                  {meses.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <button className="h-10 px-4 rounded-lg bg-dark-900 text-white text-sm font-semibold hover:bg-dark-700">Filtrar</button>
              </form>

              <p className="text-sm text-slate-500 mb-3">
                {filtrados.length} movimientos · ingresos <strong className="text-slate-900">{moneyCents(ingresos)}</strong> · gastos{" "}
                <strong className="text-slate-900">{moneyCents(gastos)}</strong>
              </p>

              <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                      <th className={`${th} pl-5`}>Fecha</th>
                      <th className={th}>Concepto</th>
                      <th className={th}>Coche</th>
                      <th className={th}>Categoría</th>
                      <th className={th}>Quién</th>
                      <th className={`${th} text-right pr-5`}>Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.slice(0, MAX_FILAS).map((e, i) => (
                      <tr key={`${e.num ?? "x"}-${i}`} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 pl-5 whitespace-nowrap text-slate-600">{dateOnly(e.fecha)}</td>
                        <td className="px-3 py-2.5 text-slate-900 min-w-[220px]">
                          {e.concepto}
                          {e.observaciones && <p className="text-xs text-slate-400">{e.observaciones}</p>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">{e.coche || "—"}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Badge>{e.categoria}</Badge>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">{e.quien || "—"}</td>
                        <td className={`${num} pr-5 font-medium ${e.tipo === "INGRESO" ? "text-emerald-700" : "text-slate-900"}`}>
                          {e.tipo === "INGRESO" ? "+" : e.tipo === "GASTO" ? "−" : ""}
                          {moneyCents(e.importe)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtrados.length > MAX_FILAS && (
                  <p className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">
                    Se muestran los {MAX_FILAS} más recientes de {filtrados.length}. Usa los filtros para acotar.
                  </p>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
}
