import { requireAdmin } from "@/lib/auth/session";
import { dbQuery } from "@/lib/db/schema";
import { Card, CardTitle, PageHeader, dateTime } from "@/components/admin/ui";
import PasswordForm from "@/components/admin/PasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const admin = await requireAdmin();
  const rows = await dbQuery<{ created_at: Date; last_login_at: Date | null }>(
    "select created_at, last_login_at from admin_users where id = $1",
    [admin.id]
  );
  return (
    <>
      <PageHeader title="Mi cuenta" />
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardTitle>Tu acceso</CardTitle>
          <dl className="p-5 grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{admin.email}</dd>
            <dt className="text-slate-500">Creado</dt>
            <dd className="text-slate-700">{rows[0] ? dateTime(rows[0].created_at) : "—"}</dd>
          </dl>
        </Card>
        <Card>
          <CardTitle>Cambiar la contraseña</CardTitle>
          <PasswordForm />
        </Card>
      </div>
    </>
  );
}
