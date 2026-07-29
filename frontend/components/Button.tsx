"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-signal text-white hover:bg-signal-dark shadow-sm shadow-signal/20 disabled:hover:bg-signal",
  secondary:
    "bg-white text-ink border border-border hover:bg-surface disabled:hover:bg-white",
  ghost: "bg-transparent text-slate hover:bg-surface hover:text-ink",
  danger: "bg-danger text-white hover:bg-red-700 disabled:hover:bg-danger",
};

const sizeStyles: Record<string, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3 rounded-xl gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium
          transition-all duration-150 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-signal focus-visible:ring-offset-2
          active:scale-[0.98]
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
