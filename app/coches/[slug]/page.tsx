import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarDetail from "@/components/cars/CarDetail";
import CarGrid from "@/components/cars/CarGrid";
import { getCarBySlug, getSimilarCars, getCars } from "@/lib/services/cars";
// getCars is used only for generateStaticParams
import { formatCarTitle, formatPrice } from "@/lib/utils/formatters";
import { Car } from "@/types/car";

const AVAILABILITY: Record<Car["estado"], string> = {
  disponible: "https://schema.org/InStock",
  reservado: "https://schema.org/Reserved",
  vendido: "https://schema.org/OutOfStock",
};

// Ficha de vehículo (Schema.org Car + Offer) — precio, km y disponibilidad
// legibles directamente por Google y por las IA, sin tener que leer la página.
function buildCarJsonLd(car: Car) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: formatCarTitle(car.marca, car.modelo, car.año),
    brand: { "@type": "Brand", name: car.marca },
    model: car.modelo,
    vehicleModelDate: car.año.toString(),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.kilometraje,
      unitCode: "KMT",
    },
    fuelType: car.combustible.charAt(0).toUpperCase() + car.combustible.slice(1),
    vehicleTransmission: car.transmision.charAt(0).toUpperCase() + car.transmision.slice(1),
    ...(car.color ? { color: car.color } : {}),
    ...(car.puertas ? { numberOfDoors: car.puertas } : {}),
    image: car.imagenes[0] ? `https://covegarage.com${encodeURI(car.imagenes[0])}` : undefined,
    url: `https://covegarage.com/coches/${car.slug}`,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: `https://covegarage.com/coches/${car.slug}`,
      availability: AVAILABILITY[car.estado],
      itemCondition: "https://schema.org/UsedCondition",
      ...(car.estado !== "vendido" ? { price: car.precio, priceCurrency: "EUR" } : {}),
    },
  };
}

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
  const priceTag = car.estado === "vendido" ? "Vendido" : formatPrice(car.precio);
  return {
    title: `${title} — ${priceTag}`,
    description: `${title} con ${car.kilometraje.toLocaleString("es-ES")} km, ${car.combustible} y ${car.transmision}. ${car.descripcion.substring(0, 120)}...`,
    alternates: {
      canonical: `/coches/${car.slug}`,
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCarJsonLd(car)) }}
      />
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
