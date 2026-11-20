import { MetadataRoute } from "next";
import { loadAllCars } from "@/lib/services/cars";
import { ciudades } from "@/lib/data/ciudades";
import { categorias } from "@/lib/data/categorias";

const BASE_URL = "https://www.covegarage.com";

// Se genera en cada petición (Google lo lee pocas veces al día): así siempre refleja los coches que hay en ese
// momento, sin depender de la caché de páginas. Con base de datos, lee de ahí; sin ella, de lib/data/mockCars.ts.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mockCars = await loadAllCars();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/coches`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/vender-coche`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const carRoutes: MetadataRoute.Sitemap = mockCars.map((car) => ({
    url: `${BASE_URL}/coches/${car.slug}`,
    lastModified: new Date(car.fechaPublicacion),
    changeFrequency: "weekly",
    priority: car.estado === "disponible" ? 0.8 : 0.4,
  }));

  const ciudadRoutes: MetadataRoute.Sitemap = ciudades.map((c) => ({
    url: `${BASE_URL}/coches-segunda-mano/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoriaRoutes: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${BASE_URL}/coches-por-tipo/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...carRoutes, ...ciudadRoutes, ...categoriaRoutes];
}
