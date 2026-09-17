import { SiteSettings, SiteContent } from "@/types/settings";

export const siteSettings: SiteSettings = {
  nombreEmpresa: "Cove Garage BCN",
  slogan: "Encontramos tu próximo coche",
  descripcion:
    "Especialistas en compra y venta de vehículos de segunda mano en Barcelona. Coches nacionales o de importación bajo pedido de Europa. Revisados. Garantía de 12 meses. Trato directo, sin vueltas.",
  telefono: "+34 647 138 383",
  whatsapp: "34647138383",
  email: "",
  direccion: "Carrer de Moscou 22, Barcelona — Con cita previa",
  ciudad: "Barcelona",
  horario: "Lun–Vie 10:00–20:00 · Sáb 10:00–20:00",
  redes: {
    instagram: "",
    facebook: "",
  },
};

export const siteContent: SiteContent = {
  hero: {
    titulo: "Coches seleccionados como si fueran para nosotros.",
    subtitulo:
      "Revisados, garantizados y listos para disfrutar. Cada coche en nuestro stock ha pasado por nuestras manos como si lo fuéramos a conducir nosotros.",
    ctaCompra: "Ver coches disponibles",
    ctaVenta: "Vender mi coche",
  },
  beneficios: [
    {
      icono: "Shield",
      titulo: "Garantía incluida",
      descripcion:
        "Todos nuestros vehículos incluyen garantía mecánica y pasan por una revisión de 80 puntos.",
    },
    {
      icono: "FileCheck",
      titulo: "Historial verificado",
      descripcion:
        "Comprobamos el historial completo de cada coche: accidentes, propietarios y kilometraje real.",
    },
    {
      icono: "Banknote",
      titulo: "Precios transparentes",
      descripcion:
        "Sin letra pequeña ni sorpresas. El precio que ves es el precio que pagas.",
    },
    {
      icono: "Handshake",
      titulo: "Trato personalizado",
      descripcion:
        "Un asesor personal te acompaña durante todo el proceso, sin presiones y con total transparencia.",
    },
    {
      icono: "RefreshCw",
      titulo: "Tomamos tu coche en parte de pago",
      descripcion:
        "Valoramos tu coche actual y descontamos el importe del precio de tu próxima compra. Rápido, sin complicaciones.",
    },
    {
      icono: "MapPin",
      titulo: "Entrega en Barcelona o envío a domicilio",
      descripcion:
        "Recoge en Barcelona o te lo llevamos a cualquier punto de España. Consulta el coste de envío a domicilio según tu destino.",
    },
  ],
  comoFunciona: [
    {
      paso: 1,
      titulo: "Elige tu coche",
      descripcion:
        "Explora nuestra selección online o visítanos en Barcelona. Filtra por marca, precio y más.",
    },
    {
      paso: 2,
      titulo: "Solicita información",
      descripcion:
        "Contáctanos por WhatsApp, teléfono o formulario. Te respondemos en menos de 2 horas.",
    },
    {
      paso: 3,
      titulo: "Prueba y decide",
      descripcion:
        "Visita nuestras instalaciones, prueba el coche y tómate tu tiempo. Sin presiones.",
    },
    {
      paso: 4,
      titulo: "Cierra el trato",
      descripcion:
        "Gestionamos toda la documentación y transferencia. Tú solo firmas.",
    },
  ],
  testimonios: [
    {
      nombre: "Javi F.",
      texto:
        "Todo genial, Diego nos ayudó en todo momento a gestionar los papeles y el coche estaba impecable como decía el anuncio.",
      puntuacion: 5,
      fecha: "",
    },
    {
      nombre: "tombon S.",
      texto:
        "La verdad son los mejores vendedores, compré un coche Hyundai i20, el coche es seminuevo, me ha gustado mucho el coche y sobre todo el vendedor que me ha vendido el coche es muy amable y un hombre con palabra.",
      puntuacion: 5,
      fecha: "",
    },
    {
      nombre: "Sebastian T.",
      texto:
        "Los recomiendo ampliamente! Diego me generó mucha confianza desde el primer momento. Profesional, responsable y confiable. Ya sé con quiénes venderé mi coche.",
      puntuacion: 5,
      fecha: "",
    },
    {
      nombre: "Sergio S.",
      texto:
        "Todo el servicio muy bien, siempre atento a responder rápido para cualquier consulta y muy buena predisposición.",
      puntuacion: 5,
      fecha: "",
    },
    {
      nombre: "Endika",
      texto:
        "Diego es un tio de 10. Excelente vendedor, siempre atento a lo que necesitaba y resolviendo todas las dudas al instante. Muy recomendable.",
      puntuacion: 5,
      fecha: "",
    },
  ],
};
