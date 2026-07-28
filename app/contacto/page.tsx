import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { siteSettings } from "@/lib/data/mockSettings";
import { generateWhatsAppUrl } from "@/lib/utils/whatsapp";

export const metadata: Metadata = {
  title: "Contacto — Hablemos",
  description:
    "Contáctanos por WhatsApp, teléfono o formulario. Te respondemos en menos de 2 horas. Estamos en Barcelona.",
};

const contactItems = [
  {
    icon: Phone,
    label: "Teléfono",
    value: siteSettings.telefono,
    href: `tel:${siteSettings.telefono}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteSettings.email,
    href: `mailto:${siteSettings.email}`,
  },
  {
    icon: MapPin,
    label: "Dirección",
    value: siteSettings.direccion,
    href: "https://www.google.com/maps/place/Carrer+de+Moscou,+22,+Sant+Mart%C3%AD,+08005+Barcelona/@41.3881943,2.191939,17z/data=!3m1!4b1!4m6!3m5!1s0x12a4a30555ee0b77:0xd8a3108b2ee7e703!8m2!3d41.3881903!4d2.1945139!16s%2Fg%2F11c5dkdr0p",
  },
  {
    icon: Clock,
    label: "Horario",
    value: siteSettings.horario,
    href: null,
  },
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-dark-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">
            Contacto
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5">
            ¿Hablamos?
          </h1>
          <p className="text-xl text-slate-300">
            Estamos aquí para ayudarte. Elige la forma de contacto que prefieras.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="space-y-5">
            {/* WhatsApp CTA */}
            <div className="bg-[#25D366] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">WhatsApp</h3>
              </div>
              <p className="text-green-100 text-sm mb-4">
                La forma más rápida de contactarnos. Respondemos en minutos.
              </p>
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#25D366] font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                Abrir WhatsApp
              </a>
            </div>

            {/* Contact details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-900 font-medium text-sm hover:text-brand-600 transition-colors underline-offset-2 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-dark-900 font-medium text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-dark-900 mb-2">
                Envíanos un mensaje
              </h2>
              <p className="text-slate-500 mb-6">
                Te responderemos en menos de 2 horas en horario de atención.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
