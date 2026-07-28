import Link from "next/link";

const CATS = [
  { emoji: "💶", label: "Hasta 10.000€",  sub: "Opciones económicas",    href: "/coches?precioMax=10000" },
  { emoji: "🚙", label: "SUV y 4x4",      sub: "Espaciosos y versátiles", href: "/coches?carroceria=SUV" },
  { emoji: "🏎️", label: "Cabrio",          sub: "Para los días de sol",   href: "/coches?carroceria=Cabrio" },
  { emoji: "⚙️", label: "Automáticos",    sub: "Conducción sin esfuerzo", href: "/coches?transmision=autom%C3%A1tico" },
  { emoji: "⛽", label: "Diesel",          sub: "Bajo consumo en ruta",    href: "/coches?combustible=di%C3%A9sel" },
  { emoji: "🔴", label: "Destacados",     sub: "Nuestros favoritos",      href: "/coches" },
];

export default function QuickCategories() {
  return (
    <section className="py-14 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Buscar por categoría</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATS.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#7DC832]/50 hover:-translate-y-0.5 hover:shadow-md transition-all group"
            >
              <span className="text-2xl mb-2">{cat.emoji}</span>
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#7DC832] transition-colors">{cat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cat.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
