import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Clock } from "lucide-react";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-slate-300 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex mb-5">
              <Image
                src="/logo1.png"
                alt="Cove Garage BCN"
                width={80}
                height={80}
                className="w-20 h-20 object-contain mix-blend-screen"
              />
            </Link>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#7DC832" }}>
              Navegación
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Inicio" },
                { href: "/coches", label: "Coches en venta" },
                { href: "/vender-coche", label: "Vender mi coche" },
                { href: "/sobre-nosotros", label: "Sobre nosotros" },
                { href: "/contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#7DC832" }}>
              Contacto
            </h3>
            <ul className="space-y-4">
              <li>
                <a href={`tel:${siteSettings.telefono}`} className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#7DC832" }} />
                  {siteSettings.telefono}
                </a>
              </li>
              <li>
                <a href={generateWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 fill-current" style={{ color: "#25D366" }} viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.1 1.524 5.823L0 24l6.338-1.503A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.034-1.378l-.361-.214-3.735.98.999-3.648-.235-.374A9.86 9.86 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.467 0 9.882 4.415 9.882 9.882 0 5.467-4.415 9.882-9.882 9.882z"/>
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/place/Carrer+de+Moscou,+22,+Sant+Mart%C3%AD,+08005+Barcelona/@41.3881943,2.191939,17z/data=!3m1!4b1!4m6!3m5!1s0x12a4a30555ee0b77:0xd8a3108b2ee7e703!8m2!3d41.3881903!4d2.1945139!16s%2Fg%2F11c5dkdr0p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#7DC832" }} />
                  <span>{siteSettings.direccion}</span>
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-sm text-slate-400">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#7DC832" }} />
                  {siteSettings.horario}
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Cove Garage BCN. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-700">
            Tu próximo coche, nueva historia.
          </p>
        </div>
      </div>
    </footer>
  );
}
