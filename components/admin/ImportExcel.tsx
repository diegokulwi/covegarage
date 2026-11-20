"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Btn, Card, Notice, dateTime } from "@/components/admin/ui";

interface Last {
  at: string;
  filename: string;
  entries: number;
  cars: number;
}

/** Subir el Excel de compra-venta para actualizar la contabilidad del panel. */
export default function ImportExcel({ last }: { last: Last | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/contabilidad/importar", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        const avisos: string[] = Array.isArray(data.warnings) ? data.warnings : [];
        setMsg({ ok: true, text: `Listo: ${data.entries} movimientos y ${data.cars} coches leídos.${avisos.length ? " " + avisos.join(" ") : ""}` });
        router.refresh();
      } else {
        setMsg({ ok: false, text: data.error || "No se pudo importar el archivo." });
      }
    } catch {
      setMsg({ ok: false, text: "No se pudo subir el archivo. Inténtalo de nuevo." });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="w-10 h-10 shrink-0 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {last ? "Última actualización" : "Todavía no has subido el Excel"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {last ? `${dateTime(last.at)} · ${last.filename} · ${last.entries} movimientos` : "Sube tu Excel de compra-venta (el que tiene la hoja LIBRO DIARIO)."}
            </p>
          </div>
        </div>
        <Btn disabled={busy} onClick={() => input.current?.click()}>
          <Upload className="w-4 h-4" /> {busy ? "Subiendo…" : "Subir Excel"}
        </Btn>
        <input
          ref={input}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
        />
      </Card>
      {msg && <Notice tone={msg.ok ? "green" : "red"}>{msg.text}</Notice>}
    </div>
  );
}
