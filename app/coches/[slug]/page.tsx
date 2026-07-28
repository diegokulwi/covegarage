import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarDetail from "@/components/cars/CarDetail";
import CarGrid from "@/components/cars/CarGrid";
import { getCarBySlug, getSimilarCars, getCars } from "@/lib/services/cars";
// getCars is used only for generateStaticParams
import { formatCarTitle, formatPrice } from "@/lib/utils/formatters";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const cars = await getCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) return {};

  const title = formatCarTitle(car.marca, car.modelo, car.año);
  return {
    title: `${title} — ${formatPrice(car.precio)}`,
    description: `${title} con ${car.kilometraje.toLocaleString("es-ES")} km, ${car.combustible} y ${car.transmision}. ${car.descripcion.substring(0, 120)}...`,
    openGraph: {
      title,
      description: car.descripcion.substring(0, 160),
      images: car.imagenes[0] ? [car.imagenes[0]] : [],
    },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) notFound();

  const similar = await getSimilarCars(car.id);

  return (
    <>
      <CarDetail car={car} />

      {similar.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-dark-900 mb-8">
              Coches similares
            </h2>
            <CarGrid cars={similar} />
          </div>
        </section>
      )}
    </>
  );
}
