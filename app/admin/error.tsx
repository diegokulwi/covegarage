"use client";

import { useEffect } from "react";

// Si algo falla en el panel (por ejemplo, la base de datos tarda en responder), se muestra esto en vez de una pantalla en blanco.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[panel]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Algo ha fallado</h1>
        <p className="text-sm text-slate-500 mb-6">
          No se pudo completar la operación. Suele ser algo pasajero (la conexión con la base de datos). Inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-dark-900 text-sm font-semibold"
        >
          Reintentar
        </button>
        {error.digest && <p className="text-xs text-slate-400 mt-4">Código: {error.digest}</p>}
      </div>
    </div>
  );
}
