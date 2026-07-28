export type FuelType = "gasolina" | "diésel" | "híbrido" | "eléctrico" | "gas";
export type TransmissionType = "manual" | "automático" | "semiautomático";
export type CarStatus = "disponible" | "reservado" | "vendido";
export type CarroceriaType = "Cabrio" | "Coupé" | "Familiar" | "Berlina" | "SUV" | "Monovolumen" | "Pick up" | "Utilitario";
export type EtiquetaType = "0" | "ECO" | "C" | "B" | "Sin etiqueta";
export type CarExtra =
  | "techo solar"
  | "carplay"
  | "asientos calefactables"
  | "faros led"
  | "tapizado de cuero"
  | "tapizado de alcántara"
  | "tracción total (4x4)";

export interface Car {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  año: number;
  kilometraje: number;
  combustible: FuelType;
  transmision: TransmissionType;
  precio: number;
  ubicacion: string;
  descripcion: string;
  imagenes: string[];
  estado: CarStatus;
  destacado: boolean;
  fechaPublicacion: string;
  potencia?: number;
  color?: string;
  puertas?: number;
  version?: string;
  carroceria?: CarroceriaType;
  etiqueta?: EtiquetaType;
  extras?: CarExtra[];
  plazas?: number;
  equipamiento?: string[];
  unicoPropietario?: boolean;
  segundoPropietario?: boolean;
  libroRevisiones?: boolean;
  // Specs técnicos opcionales
  velocidadMax?: number;
  aceleracion?: number;
  consumo?: number;
  emisiones?: number;
  peso?: number;
  maletero?: number;
  deposito?: number;
  longitud?: number;
  anchura?: number;
  altura?: number;
}

export interface CarFilters {
  marca?: string;
  modelo?: string;
  precioMin?: number;
  precioMax?: number;
  añoMin?: number;
  añoMax?: number;
  combustible?: FuelType;
  transmision?: TransmissionType;
  potenciaMin?: number;
  potenciaMax?: number;
  kmMax?: number;
  carroceria?: CarroceriaType;
  color?: string;
  extras?: CarExtra[];
  etiqueta?: EtiquetaType;
  plazas?: number;
  estado?: CarStatus;
}
