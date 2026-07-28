import Link from "next/link";

const MARCAS = [
  { nombre: "BMW", emoji: "🇩🇪" },
  { nombre: "SEAT", emoji: "🇪🇸" },
  { nombre: "Renault", emoji: "🇫🇷" },
  { nombre: "Hyundai", emoji: "🇰🇷" },
  { nombre: "Volkswagen", emoji: "🇩🇪" },
  { nombre: "Audi", emoji: "🇩🇪" },
  { nombre: "Mercedes-Benz", emoji: "🇩🇪" },
  { nombre: "Toyota", emoji: "🇯🇵" },
  { nombre: "Ford", emoji: "🇺🇸" },
  { nombre: "Peugeot", emoji: "🇫🇷" },
  { nombre: "Kia", emoji: "🇰🇷" },
  { nombre: "Opel", emoji: "🇩🇪" },
];

export default function Marcas() {
  return (
    <section className="py-14 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Marcas disponibles</p>
        <div className="flex flex-wrap gap-2">
          {MARCAS.map((m) => (
            <Link
              key={m.nombre}
              href="/coches"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all"
            >
              <span>{m.emoji}</span>
              {m.nombre}
            </Link>
          ))}
          <Link
            href="/coches"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border"
            style={{ borderColor: "#7DC832", color: "#7DC832" }}
          >
            Ver todas →
          </Link>
        </div>
      </div>
    </section>
  );
}
