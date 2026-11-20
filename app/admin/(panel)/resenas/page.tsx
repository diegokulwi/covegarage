import { listTestimonials } from "@/lib/admin/content";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialsEditor } from "@/components/admin/ContentEditors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reseñas" };

export default async function ResenasPage() {
  const items = await listTestimonials();
  return (
    <>
      <PageHeader
        title="Reseñas"
        subtitle="Los comentarios de clientes que salen en la portada. Se actualizan en la web al guardar."
      />
      <TestimonialsEditor items={items} />
    </>
  );
}
