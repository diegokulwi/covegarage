import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/data/faqs";

export default function FAQSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.respuesta,
      },
    })),
  };

  return (
    <section id="faqs" className="py-20 bg-white border-t border-slate-100 scroll-mt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7DC832" }}>
            Ayuda
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-dark-900">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.pregunta}
              className="group bg-slate-50 rounded-xl border border-slate-200 open:border-[#7DC832]/40 transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-semibold text-dark-900 text-sm sm:text-base">
                {f.pregunta}
                <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="px-5 pb-4 text-slate-500 text-sm leading-relaxed font-sans normal-case tracking-normal">
                {f.respuesta}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
