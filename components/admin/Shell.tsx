"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  Inbox,
  Star,
  HelpCircle,
  UserCog,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SITE_URL } from "@/lib/site";
import { logoutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/coches", label: "Coches", icon: Car },
  { href: "/consultas", label: "Consultas", icon: Inbox, badge: true },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/contabilidad", label: "Contabilidad", icon: Wallet },
  { href: "/resenas", label: "Reseñas", icon: Star },
  { href: "/preguntas", label: "Preguntas frecuentes", icon: HelpCircle },
  { href: "/cuenta", label: "Mi cuenta", icon: UserCog },
];

export default function Shell({
  email,
  unread,
  children,
}: {
  email: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [leaving, startLeaving] = useTransition();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ href, label, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(href) ? "bg-brand-500/15 text-brand-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{label}</span>
          {badge && unread > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-500 text-dark-900 text-xs font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </Link>
      ))}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        <ExternalLink className="w-4 h-4 shrink-0" />
        Ver la web
      </a>
    </nav>
  );

  const footer = (
    <div className="px-3 pb-4 pt-3 border-t border-white/10">
      <p className="px-3 text-xs text-slate-500 truncate" title={email}>
        {email}
      </p>
      <button
        type="button"
        disabled={leaving}
        onClick={() => startLeaving(() => logoutAction())}
        className="mt-2 w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        {leaving ? "Saliendo…" : "Salir"}
      </button>
    </div>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-3 px-5 h-16 shrink-0">
      <Image src="/logo1.png" alt="" width={36} height={36} className="w-9 h-9 object-contain mix-blend-screen" />
      <span className="text-white font-bold leading-tight">
        Cove Garage
        <span className="block text-xs font-medium text-slate-400">Panel de administración</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Escritorio */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-dark-900 sticky top-0 h-screen">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Móvil: barra superior + cajón */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-dark-900">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo1.png" alt="" width={28} height={28} className="w-7 h-7 object-contain mix-blend-screen" />
          <span className="text-white font-bold text-sm">Cove Garage · Panel</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(!open)}
          className="relative p-2 text-white"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          {!open && unread > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-500" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-14 bottom-0 z-20 bg-dark-900 flex flex-col overflow-y-auto">
          {nav}
          {footer}
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
