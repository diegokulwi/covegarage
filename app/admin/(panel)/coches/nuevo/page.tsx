import { PageHeader } from "@/components/admin/ui";
import CarForm from "@/components/admin/CarForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Añadir coche" };

export default function NuevoCochePage() {
  return (
    <>
      <PageHeader title="Añadir coche" subtitle="Se publica en la web en cuanto lo guardes (si el estado es «Disponible»)." />
      <CarForm />
    </>
  );
}
