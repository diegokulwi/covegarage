"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { AdminCar } from "@/lib/admin/cars";
import type { VideoRow } from "@/lib/admin/videos";
import VideoPanel from "@/components/admin/VideoPanel";

/** Los vídeos de un coche desde el listado: pensado para usarlo desde el móvil cuando un cliente los pide. */
export default function VideosDialog({ car, videos, onClose }: { car: AdminCar; videos: VideoRow[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const name = `${car.marca} ${car.modelo} ${car.año}`;

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
        <div className="min-w-0">
          <h2 className="font-bold">Vídeos para clientes</h2>
          <p className="text-sm text-slate-500 truncate">{name}</p>
        </div>
        <button type="button" onClick={() => ref.current?.close()} className="p-1 text-slate-500 hover:text-slate-900" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto max-h-[75vh]">
        <VideoPanel carId={car.id} carName={name} videos={videos} />
      </div>
    </dialog>
  );
}
