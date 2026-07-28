"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/coches", label: "Comprar coche" },
  { href: "/vender-coche", label: "Vender mi coche" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Cove Garage BCN"
              width={64}
              height={64}
              className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`tel:${siteSettings.telefono}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" style={{ color: "#7DC832" }} />
              {siteSettings.telefono}
            </a>
            <button
              onClick={() => window.open(generateWhatsAppUrl(), "_blank")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L0 24l6.338-1.503A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.034-1.378l-.361-.214-3.735.98.999-3.648-.235-.374A9.86 9.86 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.467 0 9.882 4.415 9.882 9.882 0 5.467-4.415 9.882-9.882 9.882z"/>
              </svg>
              WhatsApp
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            aria-label="Menú"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden border-t border-dark-700 bg-dark-800 overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 pb-2 flex flex-col gap-2 border-t border-dark-700 mt-2">
            <a
              href={`tel:${siteSettings.telefono}`}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-dark-700 rounded-lg"
            >
              <Phone className="w-4 h-4" style={{ color: "#7DC832" }} />
              {siteSettings.telefono}
            </a>
            <button
              onClick={() => window.open(generateWhatsAppUrl(), "_blank")}
              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider text-dark-900"
              style={{ backgroundColor: "#7DC832" }}
            >
              Contactar por WhatsApp
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
