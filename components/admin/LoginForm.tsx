"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction, setupAction } from "@/app/admin/login/actions";
import { Btn, Field, inputClass, Notice } from "@/components/admin/ui";

export default function LoginForm({ mode }: { mode: "login" | "setup" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [f, setF] = useState({ email: "", password: "", confirm: "", token: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const r =
        mode === "login"
          ? await loginAction(f.email, f.password)
          : await setupAction({ email: f.email, password: f.password, confirm: f.confirm, token: f.token });
      if (r.ok) {
        router.replace("/");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "setup" && (
        <>
          <Notice tone="amber">
            Aún no hay ningún acceso. Crea el tuyo con el código de instalación que te dieron. Después este paso desaparece.
          </Notice>
          <Field label="Código de instalación">
            <input
              className={inputClass}
              type="password"
              autoComplete="off"
              required
              value={f.token}
              onChange={(e) => setF({ ...f, token: e.target.value })}
            />
          </Field>
        </>
      )}
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
      </Field>
      <Field label={mode === "setup" ? "Elige una contraseña" : "Contraseña"} hint={mode === "setup" ? "Mínimo 12 caracteres." : undefined}>
        <input
          className={inputClass}
          type="password"
          autoComplete={mode === "setup" ? "new-password" : "current-password"}
          required
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
      </Field>
      {mode === "setup" && (
        <Field label="Repite la contraseña">
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })}
          />
        </Field>
      )}
      {error && <Notice tone="red">{error}</Notice>}
      <Btn type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Un momento…" : mode === "setup" ? "Crear mi acceso" : "Entrar"}
      </Btn>
    </form>
  );
}
