import { notFound } from "next/navigation";
import { getAdminCar } from "@/lib/admin/cars";
import { listVideos } from "@/lib/admin/videos";
import { Card, CardTitle, PageHeader } from "@/components/admin/ui";
import CarForm from "@/components/admin/CarForm";
import VideoPanel from "@/components/admin/VideoPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar coche" };

export default async function EditarCochePage({ params }: { params: { id: string } }) {
  const [car, videos] = await Promise.all([getAdminCar(params.id), listVideos(params.id)]);
  if (!car) notFound();
  const name = `${car.marca} ${car.modelo} ${car.año}`;
  return (
    <>
      <PageHeader title={name} subtitle="Los cambios se ven en la web al guardar." />
      <Card className="mb-6">
        <CardTitle>Vídeos para clientes</CardTitle>
        <div className="p-5">
          <VideoPanel carId={car.id} carName={name} videos={videos} />
        </div>
      </Card>
      <CarForm car={car} />
    </>
  );
}
