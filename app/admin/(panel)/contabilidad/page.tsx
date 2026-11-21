import Link from "next/link";
import { loadLedger, loadLinks, loadWebCars } from "@/lib/admin/accounting";
import { summarize, type CarRow } from "@/lib/admin/accounting-calc";
import { Badge, Card, Empty, PageHeader, dateOnly, inputClass, moneyCents, moneyEuros } from "@/components/admin/ui";
import ImportExcel from "@/components/admin/ImportExcel";
import { GestionForm, GestionRemove, WebCarSelect, type WebOption } from "@/components/admin/AccountingControls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contabilidad" };

type SP = { vista?: string; cat?: string; quien?: string; mes?: string; q?: string };
const str = (v: unknown) => (typeof v === "string" ? v : "");
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const MAX_FILAS = 500;

const th = "px-2.5 py-3 font-semibold whitespace-nowrap";
const num = "px-2.5 py-3 text-right whitespace-nowrap tabular-nums";
const dateShort = (d: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "Europe/Madrid" }).format(new Date(d));

function Stat({ label, value, hint, negative }: { label: string; value: string; hint?: React.ReactNode; negative?: boolean }) {
  return (
    <Card className="p-4 h-full">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-1 ${negative ? "text-red-600" : "text-slate-900"}`}>{value}</p>
      {hint && <div className="text-xs text-slate-400 mt-0.5 space-y-0.5">{hint}</div>}
    </Card>
  );
}

// ---------- piezas de las tablas ----------

function NameCell({ c, options }: { c: CarRow; options: WebOption[] }) {
  const sub = [c.nombre !== c.plate ? c.plate : "", c.fechaCompra && c.costo > 0 ? `comprado ${dateOnly(c.fechaCompra)}` : ""]
    .filter(Boolean)
    .join(" · ");
  return (
    <td className="px-2.5 py-3 pl-5 min-w-[210px]">
      <p className="font-medium text-slate-900">{c.nombre}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
      {c.enStock && <WebCarSelect plate={c.plate} value={c.web?.id ?? ""} options={options} />}
    </td>
  );
}

function EstadoCell({ c }: { c: CarRow }) {
  return (
    <td className="px-2.5 py-3 whitespace-nowrap">
      {c.vendido ? (
        <Badge tone="slate">Vendido{c.fechaVenta ? ` ${dateShort(c.fechaVenta)}` : ""}</Badge>
      ) : c.enStock ? (
        <Badge tone="green">En stock</Badge>
      ) : (
        <Badge tone="amber">Sin compra</Badge>
      )}
    </td>
  );
}

/** Venta: la real si está vendido; si está en stock, el precio que tiene en la web (en gris, es previsto). */
function VentaCell({ c }: { c: CarRow }) {
  if (c.vendido) {
    return (
      <>
        {moneyCents(c.venta)}
        {c.kind === "gestion" && <span className="block text-[11px] text-slate-400">comisión</span>}
      </>
    );
  }
  if (c.web) {
    return (
      <>
        <span className="text-slate-400 italic">{moneyCents(c.web.precio)}</span>
        <span className="block text-[11px] text-slate-400">precio web</span>
      </>
    );
  }
  return <>—</>;
}

/** Beneficio bruto = venta − costo − gasto (previsto, en gris, si aún no está vendido). */
function BrutoCell({ c }: { c: CarRow }) {
  if (c.bruto === null) return <>—</>;
  const color =
    c.bruto < 0
      ? c.brutoPrevisto
        ? "text-red-400 italic"
        : "text-red-600 font-medium"
      : c.brutoPrevisto
        ? "text-slate-400 italic"
        : "text-slate-900 font-medium";
  return <span className={color}>{moneyCents(c.bruto)}</span>;
}

/** Beneficio neto = bruto − gastos generales con su matrícula − IVA repartido (solo vendidos). */
function NetoCell({ c }: { c: CarRow }) {
  if (c.neto === null) return <>—</>;
  const detalle = `Bruto ${moneyCents(c.bruto ?? 0)} − gastos generales ${moneyCents(c.gastoGeneral)} − IVA ${moneyCents(c.iva)}`;
  return (
    <>
      <span title={detalle} className={c.neto < 0 ? "text-red-600 font-medium" : "text-slate-900 font-medium"}>
        {moneyCents(c.neto)}
      </span>
      {c.ivaPendiente && <span className="block text-[11px] text-amber-600">sin IVA aún</span>}
    </>
  );
}

export default async function ContabilidadPage({ searchParams }: { searchParams: SP }) {
  const [{ entries, vehicles, info }, links, webCars] = await Promise.all([loadLedger(), loadLinks(), loadWebCars()]);
  const s = summarize(entries, vehicles, { links, webCars });
  const vista = searchParams.vista === "libro" ? "libro" : searchParams.vista === "iva" ? "iva" : "coches";

  // Coches de la web para los desplegables (los disponibles primero).
  const km = new Intl.NumberFormat("es-ES");
  const sorted = [...webCars].sort((a, b) => Number(a.estado === "vendido") - Number(b.estado === "vendido"));
  const webOptions: WebOption[] = sorted.map((w) => ({
    id: w.id,
    label: `${w.nombre} · ${km.format(w.km)} km · ${moneyEuros(w.precio)}${w.estado === "vendido" ? " · vendido" : ""}`,
  }));
  const gestionOptions = webOptions.filter((_, i) => sorted[i].estado !== "vendido");

  // Filtros del libro diario
  const cat = str(searchParams.cat);
  const quien = str(searchParams.quien);
  const mes = str(searchParams.mes);
  const q = str(searchParams.q).trim();
  const categorias = Array.from(new Set(entries.map((e) => e.categoria))).sort();
  const socios = Array.from(new Set(entries.map((e) => e.quien).filter(Boolean))).sort();
  const meses = Array.from(new Set(entries.map((e) => e.fecha.slice(0, 7)))).sort().reverse();
  // Se busca por nombre del coche, matrícula (con o sin espacios), concepto u observaciones.
  const nombreCoche = new Map(s.cars.map((c) => [c.plate, c.nombre]));
  const nombrePorMatricula = new Map(s.cars.map((c) => [c.plate, `${c.nombre} ${c.web?.nombre ?? ""}`]));
  const palabras = fold(q).split(/[^a-z0-9]+/).filter(Boolean);
  const coincide = (e: (typeof entries)[number]) => {
    if (palabras.length === 0) return true;
    const pajar = fold(`${e.concepto} ${e.observaciones} ${nombrePorMatricula.get(e.coche) ?? ""}`);
    const matricula = e.coche.toLowerCase();
    return palabras.every((p) => pajar.includes(p) || matricula.includes(p));
  };
  const filtrados = entries
    .filter((e) => (!cat || e.categoria === cat) && (!quien || e.quien === quien) && (!mes || e.fecha.startsWith(mes)))
    .filter(coincide)
    .reverse(); // los más recientes primero
  const ingresos = filtrados.filter((e) => e.tipo === "INGRESO").reduce((a, e) => a + e.importe, 0);
  const gastos = filtrados.filter((e) => e.tipo === "GASTO").reduce((a, e) => a + e.importe, 0);

  const tab = (v: string, label: string) => (
    <Link
      href={`/contabilidad${v === "coches" ? "" : `?vista=${v}`}`}
      className={`h-9 px-3 inline-flex items-center rounded-lg text-sm font-medium ${
        vista === v ? "bg-dark-900 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );

  const propios = s.cars.filter((c) => c.kind === "propio");
  const gestion = s.cars.filter((c) => c.kind === "gestion");

  // Totales de las tablas. En «propio» entran también los gastos de stock sin matrícula, para que cuadre con la tarjeta.
  const sinMat = s.gastoStockSinMatricula;
  const totP = propios.reduce(
    (a, c) => ({
      costo: a.costo + c.costo,
      gasto: a.gasto + c.gasto,
      invertido: a.invertido + c.invertido,
      venta: a.venta + (c.vendido ? c.venta : 0),
      bruto: a.bruto + (c.vendido ? (c.bruto ?? 0) : 0),
      neto: a.neto + (c.neto ?? 0),
    }),
    { costo: 0, gasto: sinMat, invertido: sinMat, venta: 0, bruto: 0, neto: 0 }
  );
  const totG = gestion.reduce(
    (a, c) => ({
      gasto: a.gasto + c.gasto,
      venta: a.venta + (c.vendido ? c.venta : 0),
      bruto: a.bruto + (c.vendido ? (c.bruto ?? 0) : 0),
      neto: a.neto + (c.neto ?? 0),
    }),
    { gasto: 0, venta: 0, bruto: 0, neto: 0 }
  );
  const generalesVendidos = s.brutoVendidos - s.ivaRepartido - s.beneficioVendidos;

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
            <Stat label="Costo stock" value={moneyCents(s.costoStock)} hint="Compras de coches propios" />
            <Stat
              label="Gasto stock"
              value={moneyCents(s.gastoStock)}
              hint={
                s.gastoStockGestion > 0
                  ? `Propio ${moneyCents(s.gastoStock - s.gastoStockGestion)} · gestión ${moneyCents(s.gastoStockGestion)}`
                  : "Gastos de los coches"
              }
            />
            <Stat
              label="En stock ahora"
              value={`${s.enStock.n} ${s.enStock.n === 1 ? "coche" : "coches"}`}
              hint={
                <>
                  <p>
                    {s.enStock.propio.n} propios · {s.enStock.gestion.n} en gestión
                  </p>
                  <p>
                    Propios: costo {moneyCents(s.enStock.propio.costo)} · gasto {moneyCents(s.enStock.propio.gasto)}
                  </p>
                </>
              }
            />
            <Stat
              label="Ventas"
              value={moneyCents(s.ventas)}
              hint={`Stock propio ${moneyCents(s.ventas - s.ventasGestion)} · gestión (comisión) ${moneyCents(s.ventasGestion)}`}
            />
            <Stat
              label="Gastos generales"
              value={moneyCents(s.gastosGenerales)}
              hint={`Incluye el IVA pagado (${moneyCents(s.iva.total)}) y los gastos de gestión de venta (${moneyCents(s.gastosGestionVenta)})`}
            />
            <Stat
              label="Beneficio neto (vendidos)"
              value={moneyCents(s.beneficioVendidos)}
              hint={`Bruto ${moneyCents(s.brutoVendidos)} − gastos generales ${moneyCents(generalesVendidos)} − IVA ${moneyCents(s.ivaRepartido)}`}
              negative={s.beneficioVendidos < 0}
            />
          </div>

          <div className="flex gap-2 my-5 flex-wrap">
            {tab("coches", "Por coche")}
            {tab("iva", "IVA")}
            {tab("libro", "Libro diario")}
          </div>

          {vista === "coches" && (
            <div className="space-y-8">
              {s.previsto.conPrecio > 0 ? (
                <p className="text-sm text-slate-500">
                  Si vendes el stock al precio de la web: beneficio bruto previsto{" "}
                  <strong className="text-slate-900">{moneyCents(s.previsto.bruto)}</strong> ({s.previsto.conPrecio}{" "}
                  {s.previsto.conPrecio === 1 ? "coche" : "coches"})
                  {s.previsto.sinPrecio > 0 && (
                    <>
                      {" "}
                      · {s.previsto.sinPrecio} sin enlazar con la web (usa el desplegable de su fila)
                    </>
                  )}
                  .
                </p>
              ) : (
                s.previsto.sinPrecio > 0 && (
                  <p className="text-sm text-slate-500">
                    Para ver el precio de venta de la web y el beneficio bruto previsto de cada coche en stock, enlázalo con su coche de la
                    web en el desplegable de su fila (se hace una sola vez).
                  </p>
                )
              )}

              <section>
                <h2 className="text-sm font-semibold text-slate-700 mb-2">Stock propio</h2>
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                        <th className={`${th} pl-5`}>Coche</th>
                        <th className={th}>Estado</th>
                        <th className={`${th} text-right`}>Costo</th>
                        <th className={`${th} text-right`}>Gasto</th>
                        <th className={`${th} text-right`}>Invertido</th>
                        <th className={`${th} text-right`}>Venta</th>
                        <th className="px-2.5 py-3 font-semibold text-right leading-tight" title="Beneficio bruto = venta − costo − gasto">
                          Beneficio
                          <br />
                          bruto
                        </th>
                        <th className={`${th} text-right pr-5`} title="Neto = bruto − gastos generales − IVA repartido">
                          Neto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {propios.map((c) => (
                        <tr key={c.plate} className="hover:bg-slate-50 align-top">
                          <NameCell c={c} options={webOptions} />
                          <EstadoCell c={c} />
                          <td className={num}>{moneyCents(c.costo)}</td>
                          <td className={num}>{moneyCents(c.gasto)}</td>
                          <td className={`${num} font-medium`}>{moneyCents(c.invertido)}</td>
                          <td className={num}>
                            <VentaCell c={c} />
                          </td>
                          <td className={num}>
                            <BrutoCell c={c} />
                          </td>
                          <td className={`${num} pr-5`}>
                            <NetoCell c={c} />
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
                          <td className={num}>—</td>
                          <td className={`${num} pr-5`}>—</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                        <td className="px-3 py-3 pl-5" colSpan={2}>
                          Total <span className="font-normal text-xs text-slate-400">(venta y beneficios, solo vendidos)</span>
                        </td>
                        <td className={num}>{moneyCents(totP.costo)}</td>
                        <td className={num}>{moneyCents(totP.gasto)}</td>
                        <td className={num}>{moneyCents(totP.invertido)}</td>
                        <td className={num}>{moneyCents(totP.venta)}</td>
                        <td className={num}>{moneyCents(totP.bruto)}</td>
                        <td className={`${num} pr-5`}>{moneyCents(totP.neto)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </Card>
              </section>

              <section>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h2 className="text-sm font-semibold text-slate-700">Gestión de venta</h2>
                </div>
                <div className="mb-3">
                  <GestionForm options={gestionOptions} />
                </div>
                {gestion.length === 0 ? (
                  <Card>
                    <Empty
                      title="Aún no hay coches en gestión"
                      text="Son los coches que vendes por cuenta de otra persona. Añádelos aquí con el precio acordado con su dueño."
                    />
                  </Card>
                ) : (
                  <Card className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                          <th className={`${th} pl-5`}>Coche</th>
                          <th className={th}>Estado</th>
                          <th className={`${th} text-right`}>Acordado</th>
                          <th className={`${th} text-right`}>Gasto</th>
                          <th className={`${th} text-right`}>Web / ingreso</th>
                          <th className="px-2.5 py-3 font-semibold text-right leading-tight" title="Beneficio bruto = venta − precio acordado − gasto">
                            Beneficio
                            <br />
                            bruto
                          </th>
                          <th className={`${th} text-right`}>Neto</th>
                          <th className={`${th} pr-5`} />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {gestion.map((c) => (
                          <tr key={c.plate} className="hover:bg-slate-50 align-top">
                            <NameCell c={c} options={webOptions} />
                            <EstadoCell c={c} />
                            <td className={num}>{c.agreed !== null ? moneyCents(c.agreed) : "—"}</td>
                            <td className={num}>{moneyCents(c.gasto)}</td>
                            <td className={num}>
                              <VentaCell c={c} />
                            </td>
                            <td className={num}>
                              <BrutoCell c={c} />
                            </td>
                            <td className={num}>
                              <NetoCell c={c} />
                            </td>
                            <td className="px-3 py-3 pr-5 text-right">{c.registrada && !c.vendido && <GestionRemove plate={c.plate} />}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                          <td className="px-3 py-3 pl-5" colSpan={3}>
                            Total <span className="font-normal text-xs text-slate-400">(ingreso y beneficios, solo vendidos)</span>
                          </td>
                          <td className={num}>{moneyCents(totG.gasto)}</td>
                          <td className={num}>{moneyCents(totG.venta)}</td>
                          <td className={num}>{moneyCents(totG.bruto)}</td>
                          <td className={num}>{moneyCents(totG.neto)}</td>
                          <td className="pr-5" />
                        </tr>
                      </tfoot>
                    </table>
                  </Card>
                )}
              </section>
            </div>
          )}

          {vista === "iva" && (
            <div className="space-y-4">
              {s.iva.pagos.length === 0 ? (
                <Card>
                  <Empty
                    title="Todavía no hay pagos de IVA"
                    text="Anótalos en el libro diario del Excel como GASTO GENERAL con el concepto empezando por «IVA» (por ejemplo «IVA TRIMESTRE T4») y aquí se repartirán entre los coches vendidos."
                  />
                </Card>
              ) : (
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                        <th className={`${th} pl-5`}>Fecha</th>
                        <th className={th}>Concepto</th>
                        <th className={`${th} text-right`}>Importe</th>
                        <th className={`${th} pr-5`}>Repartido entre los coches vendidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {s.iva.pagos.map((g) => (
                        <tr key={g.fecha} className="align-top hover:bg-slate-50">
                          <td className="px-3 py-3 pl-5 whitespace-nowrap text-slate-600">{dateOnly(g.fecha)}</td>
                          <td className="px-3 py-3 text-slate-900 min-w-[220px]">
                            {g.concepto}
                            {g.avisos.map((a) => (
                              <p key={a} className="text-xs text-amber-700 mt-0.5">
                                {a}
                              </p>
                            ))}
                          </td>
                          <td className={num}>{moneyCents(g.importe)}</td>
                          <td className="px-3 py-3 pr-5 min-w-[260px]">
                            {g.reparto.length === 0 ? (
                              "—"
                            ) : (
                              <ul className="space-y-0.5">
                                {g.reparto.map((r) => (
                                  <li key={r.plate} className="flex justify-between gap-4">
                                    <span className="text-slate-700">{r.nombre}</span>
                                    <span className="tabular-nums text-slate-900">{moneyCents(r.parte)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                        <td className="px-3 py-3 pl-5" colSpan={2}>
                          Total
                        </td>
                        <td className={num}>{moneyCents(s.iva.total)}</td>
                        <td className="px-3 py-3 pr-5 text-right tabular-nums">repartido {moneyCents(s.ivaRepartido)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </Card>
              )}

              {s.iva.pendientes.length > 0 && s.iva.ultimoPago && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                  Vendidos después del último pago de IVA ({dateOnly(s.iva.ultimoPago)}): {s.iva.pendientes.map((p) => p.nombre).join(", ")}.
                  Su beneficio neto todavía no lleva IVA; se repartirá cuando anotes el siguiente pago.
                </div>
              )}

              <p className="text-xs text-slate-400 max-w-3xl">
                Cómo se reparte: cada pago de IVA (fila de GASTO GENERAL cuyo concepto empieza por «IVA») se divide a partes iguales entre
                los coches vendidos desde el pago de IVA anterior hasta la fecha de ese pago, gestiones de venta incluidas, y se resta del
                beneficio neto de cada uno. El neto del panel no coincide con la hoja BENEFICIOS del Excel porque esa hoja no reparte el IVA.
              </p>
            </div>
          )}

          {vista === "libro" && (
            <>
              <form action="/contabilidad" className="grid sm:grid-cols-[1fr,repeat(3,minmax(0,170px)),auto] gap-2 mb-4">
                <input type="hidden" name="vista" value="libro" />
                <input name="q" defaultValue={q} className={inputClass} placeholder="Buscar coche, matrícula o concepto…" />
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
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">
                          {e.coche || "—"}
                          {e.coche && nombreCoche.get(e.coche) && nombreCoche.get(e.coche) !== e.coche && (
                            <p className="text-xs text-slate-400">{nombreCoche.get(e.coche)}</p>
                          )}
                        </td>
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
                {filtrados.length === 0 && (
                  <p className="px-5 py-6 text-sm text-slate-500 text-center">No hay movimientos con esa búsqueda.</p>
                )}
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
