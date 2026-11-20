"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/admin/actions";
import { Btn, Field, Notice, inputClass } from "@/components/admin/ui";

export default function PasswordForm() {
  const [pending, start] = useTransition();
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      className="p-5 space-y-4 max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        if (f.next !== f.confirm) return setMsg({ ok: false, text: "Las dos contraseñas nuevas no coinciden." });
        start(async () => {
          const r = await changePasswordAction(f.current, f.next);
          if (r.ok) {
            setMsg({ ok: true, text: "Contraseña cambiada. Las demás sesiones abiertas se han cerrado." });
            setF({ current: "", next: "", confirm: "" });
          } else setMsg({ ok: false, text: r.error });
        });
      }}
    >
      {msg && <Notice tone={msg.ok ? "green" : "red"}>{msg.text}</Notice>}
      <Field label="Contraseña actual">
        <input className={inputClass} type="password" autoComplete="current-password" required value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} />
      </Field>
      <Field label="Contraseña nueva" hint="Mínimo 12 caracteres. Una frase larga es mejor que una palabra con símbolos.">
        <input className={inputClass} type="password" autoComplete="new-password" required value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
      </Field>
      <Field label="Repite la contraseña nueva">
        <input className={inputClass} type="password" autoComplete="new-password" required value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
      </Field>
      <Btn type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Btn>
    </form>
  );
}
