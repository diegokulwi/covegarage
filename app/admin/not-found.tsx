import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-slate-300 mb-2">404</p>
        <h1 className="text-xl font-bold text-slate-900 mb-2">No encontrado</h1>
        <p className="text-slate-500 text-sm mb-6">Esta página del panel no existe o ya no está disponible.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-dark-900 text-sm font-semibold"
        >
          Volver al resumen
        </Link>
      </div>
    </div>
  );
}
