"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { Notice } from "@/components/admin/ui";

const MAX_SIDE = 1920;
const SKIP_BELOW_BYTES = 1_800_000;
const UPLOAD_LIMIT = 4_000_000;

/**
 * Prepara la foto antes de subirla: si ya es razonable (≤ 1920 px y pesa poco) se sube tal cual, que es lo que
 * hay que hacer con las portadas ya compuestas (no se recomprimen); si es grande se reduce a 1920 px, calidad 82.
 */
async function prepare(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const long = Math.max(bitmap.width, bitmap.height);
  const needsResize = long > MAX_SIDE;
  const needsShrink = file.size > SKIP_BELOW_BYTES;
  if (!needsResize && !needsShrink) {
    bitmap.close();
    return file;
  }
  const scale = needsResize ? MAX_SIDE / long : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no puede preparar la foto.");
  ctx.fillStyle = "#ffffff"; // si la foto tiene transparencia, que quede blanca y no negra
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
  if (!blob) throw new Error("No se pudo preparar la foto.");
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export default function PhotoManager({
  images,
  onChange,
  folder,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  folder: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    const rejected = Array.from(list).length - files.length;
    const errs: string[] = rejected > 0 ? [`${rejected} archivo(s) no son fotos JPG, PNG o WebP y se han ignorado.`] : [];
    if (files.length === 0) {
      setErrors(errs);
      return;
    }
    setBusy(true);
    let current = images;
    for (let i = 0; i < files.length; i++) {
      setStatus(`Subiendo foto ${i + 1} de ${files.length}…`);
      try {
        const ready = await prepare(files[i]);
        if (ready.size > UPLOAD_LIMIT) throw new Error("pesa demasiado incluso reducida");
        const body = new FormData();
        body.append("file", ready);
        body.append("folder", folder);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error || "error al subir");
        current = [...current, data.url as string];
        onChange(current);
      } catch (e) {
        errs.push(`${files[i].name}: ${e instanceof Error ? e.message : "no se pudo subir"}`);
      }
    }
    setBusy(false);
    setStatus("");
    setErrors(errs);
    if (input.current) input.current.value = "";
  }

  const move = (i: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(i, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          drag ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <ImagePlus className="w-7 h-7 mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-600">
          Arrastra las fotos aquí o{" "}
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="font-semibold text-brand-700 hover:underline disabled:opacity-50">
            elígelas del ordenador
          </button>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          JPG, PNG o WebP. Las muy grandes se reducen solas a 1920 px; las portadas ya compuestas se suben tal cual.
        </p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && void addFiles(e.target.files)}
        />
      </div>

      <div className="mt-3">
        <Notice tone="amber">Recuerda: matrículas tapadas de blanco <strong>antes</strong> de subir las fotos, como siempre.</Notice>
      </div>

      {status && <p className="text-sm text-slate-600 mt-3">{status}</p>}
      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((e, i) => (
            <Notice key={i} tone="red">
              {e}
            </Notice>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <li key={src + i} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image src={src} alt={`Foto ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-brand-500 text-dark-900 text-[11px] font-bold px-2 py-0.5">
                    <Star className="w-3 h-3" /> Portada
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-1.5 py-1">
                <div className="flex">
                  <button type="button" title="Mover antes" onClick={() => move(i, i - 1)} disabled={i === 0} className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button type="button" title="Mover después" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex">
                  {i !== 0 && (
                    <button type="button" title="Hacer portada" onClick={() => move(i, 0)} className="p-1.5 text-slate-500 hover:text-brand-700">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Quitar foto"
                    onClick={() => onChange(images.filter((_, k) => k !== i))}
                    className="p-1.5 text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
