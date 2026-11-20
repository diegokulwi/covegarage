"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import type { Car } from "@/types/car";
import { Btn, Field, inputClass, textareaClass } from "@/components/admin/ui";
import { wallapopDescription, wallapopTitle } from "@/lib/admin/wallapop";

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Btn
      size="sm"
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* el navegador no dejó copiar: se puede seleccionar el texto a mano */
        }
      }}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {done ? "Copiado" : label}
    </Btn>
  );
}

/** Texto del anuncio de Wallapop de un coche, listo para copiar y pegar. */
export default function WallapopDialog({ car, onClose }: { car: Car; onClose: () => void }) {
  const [itv, setItv] = useState("");
  const [title, setTitle] = useState(() => wallapopTitle(car));
  const [text, setText] = useState(() => wallapopDescription(car, ""));
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="rounded-2xl p-0 w-[min(680px,94vw)] max-h-[92vh] backdrop:bg-black/50 text-slate-900"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <h2 className="font-bold">Anuncio de Wallapop</h2>
        <button type="button" onClick={() => ref.current?.close()} className="p-1 text-slate-500 hover:text-slate-900" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
        <Field label="ITV hasta (mes/año)" hint="Si no lo sabes, déjalo vacío y quedará «__/____» para rellenar a mano.">
          <input
            className={inputClass}
            placeholder="MM/AAAA"
            value={itv}
            onChange={(e) => {
              setItv(e.target.value);
              setText(wallapopDescription(car, e.target.value));
            }}
          />
        </Field>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-600">Título</span>
            <CopyBtn text={title} label="Copiar título" />
          </div>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          <p className="text-xs text-slate-400 mt-1">{title.length} caracteres (Wallapop recomienda unos 50 como máximo).</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-600">Descripción</span>
            <CopyBtn text={text} label="Copiar descripción" />
          </div>
          <textarea className={textareaClass + " font-mono text-[13px] leading-relaxed"} rows={18} value={text} onChange={(e) => setText(e.target.value)} />
          <p className="text-xs text-slate-400 mt-1">
            Revisa que las viñetas estándar (aire, crucero, elevalunas…) coincidan con este coche y quita las que no lleve.
          </p>
        </div>
      </div>
    </dialog>
  );
}
