import { listFaqs } from "@/lib/admin/content";
import { PageHeader } from "@/components/admin/ui";
import { FaqsEditor } from "@/components/admin/ContentEditors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preguntas frecuentes" };

export default async function PreguntasPage() {
  const items = await listFaqs();
  return (
    <>
      <PageHeader
        title="Preguntas frecuentes"
        subtitle="Salen al pie de todas las páginas de la web y también se las explican a Google. Se actualizan al guardar."
      />
      <FaqsEditor items={items} />
    </>
  );
}
