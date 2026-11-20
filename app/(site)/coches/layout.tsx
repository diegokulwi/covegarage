import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coches en venta en Barcelona — Segunda mano y ocasión",
  description:
    "Explora nuestro catálogo de coches de segunda mano en Barcelona: SUVs, cabrios, automáticos y más. Todos revisados, con garantía de 12 meses y trato directo.",
  alternates: {
    canonical: "/coches",
  },
};

export default function CochesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
