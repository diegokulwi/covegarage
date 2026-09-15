export interface FAQ {
  pregunta: string;
  respuesta: string;
}

// Preguntas frecuentes: se muestran al pie de todas las páginas y
// alimentan el marcado FAQPage (Schema.org) para SEO/GEO.
export const faqs: FAQ[] = [
  {
    pregunta: "¿Los coches tienen garantía?",
    respuesta:
      "Sí. Todos los vehículos incluyen garantía mecánica de 12 meses y pasan una revisión de 80 puntos antes de la venta.",
  },
  {
    pregunta: "¿El precio publicado incluye todo, sin sorpresas?",
    respuesta:
      "Sí. El precio que ves en la ficha es el precio final — sin letra pequeña ni costes ocultos.",
  },
  {
    pregunta: "¿Puedo probar el coche antes de comprarlo?",
    respuesta:
      "Sí. Podés visitar nuestras instalaciones en Barcelona, probar el coche y tomarte tu tiempo, sin presiones.",
  },
  {
    pregunta: "¿Cómo verifican el historial y el kilometraje de los coches?",
    respuesta:
      "Comprobamos el historial completo de cada coche antes de publicarlo: accidentes, número de propietarios y kilometraje real.",
  },
  {
    pregunta: "¿Puedo entregar mi coche actual como parte del pago?",
    respuesta:
      "Sí. Tasamos tu coche y descontamos su valor del precio del coche que compres.",
  },
  {
    pregunta: "¿Compran mi coche aunque no compre uno nuevo con ustedes?",
    respuesta:
      "Sí, lo tasamos y podemos comprarlo igual. Si no llegamos a un acuerdo, te ofrecemos gestionar su venta sin coste.",
  },
  {
    pregunta: "¿Qué documentación necesito para vender mi coche?",
    respuesta:
      "Lo básico: tu DNI, el permiso de circulación, la ficha técnica y el último recibo de la ITV en vigor. Nosotros nos ocupamos del resto del papeleo.",
  },
  {
    pregunta: "¿Hacen envíos fuera de Barcelona?",
    respuesta:
      "Sí. Podés recoger el coche en Barcelona o pedir envío a domicilio en cualquier punto de España; el coste varía según el destino.",
  },
  {
    pregunta: "¿Necesito cita previa para ver un coche?",
    respuesta: "Sí. Las visitas son con cita previa en Carrer de Moscou 22, Barcelona.",
  },
  {
    pregunta: "¿Cuál es el horario de atención?",
    respuesta: "Lunes a viernes de 10:00 a 20:00, y sábados de 10:00 a 19:00.",
  },
  {
    pregunta: "¿En cuánto tiempo responden una consulta?",
    respuesta: "Por WhatsApp, teléfono o formulario respondemos en menos de 2 horas.",
  },
  {
    pregunta: "¿Los coches son nacionales o de importación?",
    respuesta:
      "Trabajamos con stock nacional permanente, y también gestionamos importación bajo pedido desde toda Europa.",
  },
  {
    pregunta: "¿Ofrecen financiación?",
    respuesta: "No, por ahora no ofrecemos financiación. Consultanos las formas de pago disponibles.",
  },
];
