import { cn } from "@/lib/utils/cn";
import { CarStatus } from "@/types/car";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
        {
          "bg-slate-100 text-slate-700": variant === "default",
          "bg-emerald-100 text-emerald-700": variant === "success",
          "bg-amber-100 text-amber-700": variant === "warning",
          "bg-red-100 text-red-700": variant === "error",
          "bg-blue-100 text-blue-700": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: CarStatus }) {
  const config = {
    disponible: { label: "Disponible", variant: "success" as const, dot: "bg-emerald-500" },
    reservado: { label: "Reservado", variant: "warning" as const, dot: "bg-amber-500" },
    vendido: { label: "Vendido", variant: "error" as const, dot: "bg-red-500" },
  };

  const { label, variant, dot } = config[status];

  return (
    <Badge variant={variant}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {label}
    </Badge>
  );
}
