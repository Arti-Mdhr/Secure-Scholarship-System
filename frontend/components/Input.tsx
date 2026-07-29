"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Use for security-sensitive values (OTP codes, IDs) — renders in monospace. */
  mono?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, mono = false, className = "", type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink
              placeholder:text-slate-light
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal
              disabled:bg-surface disabled:text-slate disabled:cursor-not-allowed
              ${mono ? "font-mono tracking-wide" : ""}
              ${error ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border"}
              ${isPassword ? "pr-10" : ""}
              ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-slate"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
