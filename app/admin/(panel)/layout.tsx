import { requireAdmin } from "@/lib/auth/session";
import { countUnreadInquiries } from "@/lib/admin/clients";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

// Todo lo que hay dentro del panel exige sesión; sin ella, se manda al login.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = await countUnreadInquiries();
  return (
    <Shell email={admin.email} unread={unread}>
      {children}
    </Shell>
  );
}
