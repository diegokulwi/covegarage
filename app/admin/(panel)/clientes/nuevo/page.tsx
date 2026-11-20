import { PageHeader } from "@/components/admin/ui";
import ClientForm from "@/components/admin/ClientForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Añadir cliente" };

export default function NuevoClientePage() {
  return (
    <>
      <PageHeader title="Añadir cliente" />
      <ClientForm />
    </>
  );
}
