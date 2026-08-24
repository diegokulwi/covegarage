export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPrecioTachado(precio: number): string {
  return formatPrice(Math.round(precio * 1.05));
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat("es-ES").format(km) + " km";
}

export function formatCarTitle(marca: string, modelo: string, año: number): string {
  return `${marca} ${modelo} ${año}`;
}
