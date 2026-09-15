import { MetadataRoute } from "next";
import { mockCars } from "@/lib/data/mockCars";
import { ciudades } from "@/lib/data/ciudades";

const BASE_URL = "https://covegarage.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticRoutes, ...carRoutes, ...ciudadRoutes];
}
