"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, MessageCircle, Plus, Trash2 } from "lucide-react";
import type { VideoRow } from "@/lib/admin/videos";
import { addVideoAction, deleteVideoAction } from "@/app/admin/actions";
import { Btn, Notice, inputClass } from "@/components/admin/ui";

type Video = Pick<VideoRow, "id" | "title" | "url">;

const SUGERENCIAS = ["Exterior", "Interior", "Motor", "Arranque en frío", "Prueba de conducción", "Maletero"];

function sitio(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    if (/(^|\.)youtube\.com$/.test(h) || h === "youtu.be") return "YouTube";
    if (h === "drive.google.com") return "Google Drive";
    return h;
  } catch {
    return "";
  }
}

/** Abre WhatsApp para elegir a quién enviárselo; el mensaje y el enlace ya van escritos. */
export function whatsappVideoUrl(carName: string, v: Pick<Video, "title" | "url">): string {
  const text = `Hola, te paso el vídeo del ${carName}${v.title ? ` (${v.title})` : ""}: ${v.url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Lista de vídeos de un coche (enviar por WhatsApp, copiar, abrir, quitar) y formulario para añadir otro enlace. */
export default function VideoPanel({ carId, carName, videos }: { carId: string; carName: string; videos: Video[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const r = await addVideoAction(carId, { title, url });
      if (r.ok) {
        setTitle("");
        setUrl("");
        router.refresh();
      } else setError(r.error);
    });
  };

  const copy = async (v: Video) => {
    try {
      await navigator.clipboard.writeText(v.url);
      setCopied(v.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* el navegador no dejó copiar: se puede copiar el enlace a mano desde «Abrir» */
    }
  };

  const small = "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap";

  return (
    <div>
      {videos.length === 0 ? (
        <p className="text-sm text-slate-500 mb-4">Todavía no hay vídeos de este coche.</p>
      ) : (
        <ul className="divide-y divide-slate-100 mb-4">
          {videos.map((v) => (
            <li key={v.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{v.title || "Vídeo"}</p>
                <p className="text-xs text-slate-400 truncate">
                  {sitio(v.url)} · {v.url}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={whatsappVideoUrl(carName, v)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${small} bg-emerald-600 text-white hover:bg-emerald-700`}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button type="button" onClick={() => copy(v)} className={`${small} border border-slate-300 text-slate-700 hover:bg-slate-50`}>
                  {copied === v.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === v.id ? "Copiado" : "Copiar enlace"}
                </button>
                <a href={v.url} target="_blank" rel="noopener noreferrer" className={`${small} border border-slate-300 text-slate-700 hover:bg-slate-50`}>
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir
                </a>
                <button
                  type="button"
                  title="Quitar vídeo de la lista"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm("¿Quitar este vídeo de la lista? No se borra de YouTube ni de Drive.")) {
                      start(async () => {
                        await deleteVideoAction(v.id);
                        router.refresh();
                      });
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <p className="text-xs text-slate-500">
          Sube el vídeo a YouTube como «No listado» (o a Google Drive) y pega aquí el enlace. Aquí solo se guarda el enlace:
          no cuesta nada y la web pública no lo muestra.
        </p>
        {error && <Notice tone="red">{error}</Notice>}
        <div className="grid sm:grid-cols-[190px,1fr,auto] gap-2">
          <input
            className={inputClass}
            list={`titulos-${carId}`}
            placeholder="Título (Exterior…)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <datalist id={`titulos-${carId}`}>
            {SUGERENCIAS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <input
            className={inputClass}
            type="url"
            inputMode="url"
            required
            placeholder="https://youtu.be/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Btn type="submit" disabled={pending}>
            <Plus className="w-4 h-4" /> Añadir
          </Btn>
        </div>
      </form>
    </div>
  );
}
