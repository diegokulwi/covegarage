"use client";

import { useId } from "react";
import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { cn } from "@/lib/utils/cn";

export type ContactPref = "WhatsApp" | "Llamada telefónica";

const OPTIONS: ContactPref[] = ["WhatsApp", "Llamada telefónica"];

// "Prefiero que me contacten por": WhatsApp (con su logo) o llamada telefónica.
// WhatsApp va marcado por defecto para que no haga falta tocar nada.
export default function ContactPreference({
  value,
  onChange,
}: {
  value: ContactPref;
  onChange: (value: ContactPref) => void;
}) {
  const name = useId();

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700 mb-1.5">Prefiero que me contacten por:</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold cursor-pointer transition-all",
                "focus-within:ring-2 focus-within:ring-brand-500",
                selected
                  ? "border-brand-600 bg-brand-50 text-dark-900 ring-1 ring-brand-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option === "WhatsApp" ? (
                <WhatsAppIcon className="w-5 h-5 shrink-0 text-[#25D366]" />
              ) : (
                <Phone className="w-5 h-5 shrink-0" style={{ color: "#7DC832" }} />
              )}
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
