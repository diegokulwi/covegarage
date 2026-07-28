"use client";

import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm hover:shadow-md":
              variant === "primary",
            "bg-dark-900 text-white hover:bg-dark-800 focus:ring-dark-700 shadow-sm hover:shadow-md":
              variant === "secondary",
            "border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-500":
              variant === "outline",
            "text-slate-600 hover:text-brand-600 hover:bg-brand-50 focus:ring-brand-500":
              variant === "ghost",
            "bg-[#25D366] text-white hover:bg-[#20b858] focus:ring-[#25D366] shadow-sm hover:shadow-md":
              variant === "whatsapp",
          },
          {
            "text-sm px-3 py-2": size === "sm",
            "text-base px-5 py-2.5": size === "md",
            "text-lg px-7 py-3.5": size === "lg",
          },
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
