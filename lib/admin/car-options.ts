/** Opciones de los desplegables del formulario de coches (compartidas entre el navegador y el servidor). */
import type {
  CarExtra,
  CarStatus,
  CarroceriaType,
  EtiquetaType,
  FuelType,
  TransmissionType,
} from "@/types/car";

export const COMBUSTIBLES: FuelType[] = ["gasolina", "diésel", "híbrido", "eléctrico", "gas"];
export const TRANSMISIONES: TransmissionType[] = ["manual", "automático", "semiautomático"];
export const ESTADOS: CarStatus[] = ["disponible", "reservado", "vendido"];
export const CARROCERIAS: CarroceriaType[] = [
  "Berlina",
  "Cabrio",
  "Coupé",
  "Familiar",
  "Monovolumen",
  "Pick up",
  "SUV",
  "Utilitario",
];
export const ETIQUETAS: EtiquetaType[] = ["0", "ECO", "C", "B", "Sin etiqueta"];
export const EXTRAS: CarExtra[] = [
  "techo solar",
  "carplay",
  "asientos calefactables",
  "faros led",
  "tapizado de cuero",
  "tapizado de alcántara",
  "tracción total (4x4)",
];
export const COLORES = [
  "Beige", "Blanco", "Azul", "Burdeos", "Dorado", "Gris", "Marrón",
  "Naranja", "Negro", "Plata", "Rojo", "Verde", "Amarillo",
];

export const ESTADO_LABELS: Record<CarStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const MARCAS = [
  "Abarth", "Alfa Romeo", "Audi", "BMW", "Citroen", "Cupra", "Dacia", "DS", "Fiat", "Ford",
  "Honda", "Hyundai", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Mazda", "Mercedes-Benz",
  "MG", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche", "Renault", "SEAT",
  "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
];
