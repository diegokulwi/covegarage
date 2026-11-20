import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/* Piezas visuales compartidas del panel (sin estado: sirven en servidor y en navegador). */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>{children}</div>;
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3 border-b border-slate-100">
      <h2 className="text-sm font-semibold text-slate-700">{children}</h2>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 hover:bg-brand-600 text-dark-900",
  secondary: "bg-white border border-slate-300 hover:bg-slate-50 text-slate-700",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "text-slate-600 hover:bg-slate-100",
};
const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function btnClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors whitespace-nowrap",
    "disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export function Btn({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={btnClass(variant, size, className)} {...props} />;
}

export function LinkBtn({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: { href: string; variant?: Variant; size?: Size; className?: string; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className"
>) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={btnClass(variant, size, className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={btnClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export const inputClass =
  "w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-100 disabled:text-slate-500";

export const textareaClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

type Tone = "green" | "amber" | "slate" | "red" | "blue" | "violet";
const TONES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function Badge({ tone = "slate", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", TONES[tone], className)}>
      {children}
    </span>
  );
}

export function Notice({ tone = "slate", children }: { tone?: "slate" | "red" | "green" | "amber"; children: React.ReactNode }) {
  const t = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    red: "bg-red-50 border-red-200 text-red-800",
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
  }[tone];
  return <div className={cn("rounded-lg border px-4 py-3 text-sm", t)}>{children}</div>;
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-14 px-6">
      <p className="font-semibold text-slate-700">{title}</p>
      {text && <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Con céntimos y siempre con punto de miles (para la contabilidad: 3.100,00 € y 12.656,19 €). */
export const moneyCents = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" }).format(n);

export const dateTime = (d: Date | string) =>
  new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(
    new Date(d)
  );

export const dateOnly = (d: Date | string) =>
  new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Madrid" }).format(new Date(d));
