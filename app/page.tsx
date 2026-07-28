import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import QuickCategories from "@/components/sections/QuickCategories";
import Marcas from "@/components/sections/Marcas";
import Benefits from "@/components/sections/Benefits";
import FeaturedCars from "@/components/sections/FeaturedCars";
import BuySection from "@/components/sections/BuySection";
import SellSection from "@/components/sections/SellSection";
import HowItWorks from "@/components/sections/HowItWorks";
import TrustSection from "@/components/sections/TrustSection";
import FinalCTA from "@/components/sections/FinalCTA";
import { getFeaturedCars } from "@/lib/services/cars";
import { siteSettings } from "@/lib/data/mockSettings";

export const metadata: Metadata = {
  title: `${siteSettings.nombreEmpresa} — Compra y venta de coches premium en Barcelona`,
  description:
    "Especialistas en compra y venta de vehículos de segunda mano en Barcelona. Más de 5 años de experiencia, trato directo y precios competitivos.",
};

export default async function HomePage() {
  const featuredCars = await getFeaturedCars();

  return (
    <>
      <Hero />
      <QuickCategories />
      <Marcas />
      <Benefits />
      <FeaturedCars cars={featuredCars} />
      <BuySection />
      <SellSection />
      <HowItWorks />
      <TrustSection />
      <FinalCTA />
    </>
  );
}
