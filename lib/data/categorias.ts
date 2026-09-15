import { Car } from "@/types/car";

export interface Categoria {
  slug: string;
  nombre: string;
  metaTitulo: string;
  metaDescripcion: string;
  heroTitulo: string;
  heroTexto: string;
  emptyMessage: string;
  filtro: (car: Car) => boolean;
}

// Páginas de aterrizaje por tipo de coche — mismo stock de Barcelona,
// recortado por lo que más se busca. Pensadas para SEO y para las 4
// categorías rápidas que ya existían como chips en el home.
export const categorias: Categoria[] = [
  {
    slug: "suv",
    nombre: "SUV",
    metaTitulo: "Coches SUV de segunda mano en Barcelona",
    metaDescripcion:
      "SUV de segunda mano en Barcelona, revisados y con garantía de 12 meses. Más espacio y mejor visión de la carretera.",
    heroTitulo: "Coches SUV en Barcelona",
    heroTexto:
      "Más espacio, mayor altura al volante y versatilidad para ciudad o carretera. Los mismos coches de siempre, revisados y con garantía de 12 meses.",
    emptyMessage: "Ahora mismo no tenemos SUV en stock — escribinos por WhatsApp y te avisamos apenas entre uno.",
    filtro: (car) => car.carroceria === "SUV",
  },
  {
    slug: "automaticos",
    nombre: "Automáticos",
    metaTitulo: "Coches automáticos de segunda mano en Barcelona",
    metaDescripcion:
      "Coches automáticos de segunda mano en Barcelona, revisados y con garantía de 12 meses. Conducción más cómoda, ideal para ciudad.",
    heroTitulo: "Coches automáticos en Barcelona",
    heroTexto:
      "Conducción más cómoda, sin embrague, ideal para el día a día en ciudad. Los mismos coches de siempre, revisados y con garantía de 12 meses.",
    emptyMessage: "Ahora mismo no tenemos automáticos en stock — escribinos por WhatsApp y te avisamos apenas entre uno.",
    filtro: (car) => car.transmision === "automático",
  },
  {
    slug: "hasta-10000",
    nombre: "Hasta 10.000€",
    metaTitulo: "Coches de segunda mano hasta 10.000€ en Barcelona",
    metaDescripcion:
      "Coches de segunda mano en Barcelona hasta 10.000€, revisados y con garantía de 12 meses. Opciones económicas sin renunciar a la confianza.",
    heroTitulo: "Coches hasta 10.000€ en Barcelona",
    heroTexto:
      "Opciones económicas sin renunciar a la confianza: mismo proceso de revisión de 80 puntos y garantía de 12 meses que en el resto del stock.",
    emptyMessage: "Ahora mismo no tenemos coches en este rango de precio — escribinos por WhatsApp y te avisamos apenas entre uno.",
    filtro: (car) => car.precio > 0 && car.precio <= 10000,
  },
  {
    slug: "cabrio",
    nombre: "Cabrio",
    metaTitulo: "Coches cabrio de segunda mano en Barcelona",
    metaDescripcion:
      "Coches descapotables de segunda mano en Barcelona, revisados y con garantía de 12 meses. Para los días de sol.",
    heroTitulo: "Coches cabrio en Barcelona",
    heroTexto:
      "Para los días de sol. Los mismos coches de siempre, revisados y con garantía de 12 meses.",
    emptyMessage: "Ahora mismo no tenemos cabrios en stock — escribinos por WhatsApp y te avisamos apenas entre uno.",
    filtro: (car) => car.carroceria === "Cabrio",
  },
];
