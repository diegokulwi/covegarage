import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-brand-100 mb-2">404</p>
        <h1 className="text-2xl font-black text-dark-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-slate-500 mb-8">
          Esta página no existe o el coche ya no está disponible. Echa un vistazo a nuestro stock actual.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
          <Link href="/coches">
            <Button variant="outline">Ver coches disponibles</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
