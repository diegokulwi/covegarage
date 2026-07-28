export interface SiteSettings {
  nombreEmpresa: string;
  slogan: string;
  descripcion: string;
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: string;
  ciudad: string;
  horario: string;
  logoUrl?: string;
  redes: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

export interface SiteContent {
  hero: {
    titulo: string;
    subtitulo: string;
    ctaCompra: string;
    ctaVenta: string;
    imagenFondo?: string;
  };
  beneficios: Array<{
    icono: string;
    titulo: string;
    descripcion: string;
  }>;
  comoFunciona: Array<{
    paso: number;
    titulo: string;
    descripcion: string;
  }>;
  testimonios: Array<{
    nombre: string;
    texto: string;
    puntuacion: number;
    fecha: string;
  }>;
}
