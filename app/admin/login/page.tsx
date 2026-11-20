import { redirect } from "next/navigation";
import Image from "next/image";
import { isDbConfigured, queryOne } from "@/lib/db";
import { ensureReady } from "@/lib/db/schema";
import { getAdmin, sessionConfigured } from "@/lib/auth/session";
import LoginForm from "@/components/admin/LoginForm";
import { Notice } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  let mode: "login" | "setup" | "no-db" | "no-secret" | "db-error" = "login";

  if (!isDbConfigured()) mode = "no-db";
  else if (!sessionConfigured()) mode = "no-secret";
  else {
    try {
      await ensureReady();
      if (await getAdmin()) redirect("/");
      const n = await queryOne<{ n: number }>("select count(*)::int as n from admin_users");
      if ((n?.n ?? 0) === 0) mode = "setup";
    } catch (e) {
      // redirect() lanza una excepción especial que no hay que tragarse
      if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
      console.error("[login] error de base de datos:", e);
      mode = "db-error";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-dark-900 flex items-center justify-center mb-3">
            <Image src="/logo1.png" alt="Cove Garage" width={44} height={44} className="w-11 h-11 object-contain mix-blend-screen" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Panel de administración</h1>
          <p className="text-sm text-slate-500">Cove Garage BCN</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {mode === "login" || mode === "setup" ? (
            <LoginForm mode={mode} />
          ) : (
            <Notice tone="amber">
              {mode === "no-db" && "Falta conectar la base de datos (DATABASE_URL) en el servidor. Sin ella el panel no puede funcionar."}
              {mode === "no-secret" && "Falta la clave de sesión del panel en el servidor."}
              {mode === "db-error" && "No se pudo conectar con la base de datos. Inténtalo de nuevo en un minuto."}
            </Notice>
          )}
        </div>
      </div>
    </div>
  );
}
