export interface Ciudad {
  slug: string;
  nombre: string;
  /** true solo para la ciudad donde está la sede física */
  sede: boolean;
  metaTitulo: string;
  metaDescripcion: string;
  heroEyebrow: string;
  heroTitulo: string;
  heroTexto: string;
  entregaTitulo: string;
  entregaTexto: string;
}

// Páginas de aterrizaje por ciudad, pensadas para campañas de publicidad.
// Cove Garage BCN tiene un único stock y una única sede física en Barcelona:
// Madrid y Valencia se venden como entrega a domicilio, nunca como sede
// propia, para no faltar a la verdad ni a las políticas de Google Ads.
export const ciudades: Ciudad[] = [
  {
    slug: "barcelona",
    nombre: "Barcelona",
    sede: true,
    metaTitulo: "Coches de segunda mano en Barcelona",
    metaDescripcion:
      "Concesionario de coches de segunda mano en Barcelona. Revisados, con garantía de 12 meses y trato directo. Visita con cita previa en Carrer de Moscou 22.",
    heroEyebrow: "Barcelona",
    heroTitulo: "Coches de segunda mano en Barcelona",
    heroTexto:
      "Somos un concesionario local en Barcelona. Cada coche pasa una revisión de 80 puntos antes de la venta, con garantía mecánica de 12 meses y sin letra pequeña.",
    entregaTitulo: "Visitanos en Barcelona",
    entregaTexto:
      "Con cita previa en Carrer de Moscou 22. Probás el coche, resolvés todas tus dudas y, si te convence, te lo llevás el mismo día.",
  },
  {
    slug: "madrid",
    nombre: "Madrid",
    sede: false,
    metaTitulo: "Coches de segunda mano en Madrid con entrega a domicilio",
    metaDescripcion:
      "Coches de segunda mano revisados y con garantía de 12 meses, desde nuestro concesionario en Barcelona con entrega a domicilio en Madrid. Trato directo, sin trámites.",
    heroEyebrow: "Madrid",
    heroTitulo: "Coches de segunda mano en Madrid",
    heroTexto:
      "Somos un concesionario en Barcelona: elegís el coche a distancia (fotos, vídeo-llamada y toda la documentación) y te lo entregamos en tu domicilio en Madrid.",
    entregaTitulo: "Cómo funciona la entrega en Madrid",
    entregaTexto:
      "Elegís el coche en la web, resolvemos tus dudas por WhatsApp o llamada y coordinamos la entrega en tu domicilio en Madrid. El coste de envío varía según la zona — te lo confirmamos antes de cerrar la compra.",
  },
  {
    slug: "valencia",
    nombre: "Valencia",
    sede: false,
    metaTitulo: "Coches de segunda mano en Valencia con entrega a domicilio",
    metaDescripcion:
      "Coches de segunda mano revisados y con garantía de 12 meses, desde nuestro concesionario en Barcelona con entrega a domicilio en Valencia. Trato directo, sin trámites.",
    heroEyebrow: "Valencia",
    heroTitulo: "Coches de segunda mano en Valencia",
    heroTexto:
      "Somos un concesionario en Barcelona: elegís el coche a distancia (fotos, vídeo-llamada y toda la documentación) y te lo entregamos en tu domicilio en Valencia.",
    entregaTitulo: "Cómo funciona la entrega en Valencia",
    entregaTexto:
      "Elegís el coche en la web, resolvemos tus dudas por WhatsApp o llamada y coordinamos la entrega en tu domicilio en Valencia. El coste de envío varía según la zona — te lo confirmamos antes de cerrar la compra.",
  },
];
