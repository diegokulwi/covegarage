import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Panel · Cove Garage", template: "%s · Panel Cove Garage" },
  description: "Panel de administración",
  keywords: undefined,
  openGraph: undefined,
  robots: { index: false, follow: false, nocache: true },
};

// Marco del panel: fondo claro y estilos propios (no hereda la cabecera ni el pie de la web).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root flex-1 bg-slate-100 text-slate-900">{children}</div>;
}
