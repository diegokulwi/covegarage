import { notFound } from "next/navigation";
import { getAdminCar } from "@/lib/admin/cars";
import { PageHeader } from "@/components/admin/ui";
import CarForm from "@/components/admin/CarForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar coche" };

export default async function EditarCochePage({ params }: { params: { id: string } }) {
  const car = await getAdminCar(params.id);
  if (!car) notFound();
  return (
    <>
      <PageHeader title={`${car.marca} ${car.modelo} ${car.año}`} subtitle="Los cambios se ven en la web al guardar." />
      <CarForm car={car} />
    </>
  );
}
