import { Plus } from "lucide-react";
import { listAdminCars } from "@/lib/admin/cars";
import { listClients } from "@/lib/admin/clients";
import { LinkBtn, PageHeader } from "@/components/admin/ui";
import CarsTable from "@/components/admin/CarsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coches" };

export default async function CochesPage({ searchParams }: { searchParams: { estado?: string } }) {
  const [cars, clients] = await Promise.all([listAdminCars(), listClients()]);
  return (
    <>
      <PageHeader
        title="Coches"
        subtitle="Cambia el precio, los km o el estado con un clic sobre el dato. Todo se refleja en la web al momento."
        actions={
          <LinkBtn href="/coches/nuevo">
            <Plus className="w-4 h-4" /> Añadir coche
          </LinkBtn>
        }
      />
      <CarsTable
        cars={cars}
        clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        initialEstado={searchParams.estado ?? "todos"}
      />
    </>
  );
}
