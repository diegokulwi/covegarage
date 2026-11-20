import CochesExplorer from "@/components/cars/CochesExplorer";
import { getCars } from "@/lib/services/cars";

// El listado se monta en el servidor con todos los coches, para que el HTML ya traiga los enlaces a
// cada ficha (Google y las IA no tienen que ejecutar JavaScript). Los filtros se aplican luego en el navegador.
export default async function CochesPage() {
  const cars = await getCars();
  return <CochesExplorer initialCars={cars} />;
}
