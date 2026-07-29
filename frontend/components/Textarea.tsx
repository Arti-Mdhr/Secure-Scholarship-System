"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, rows = 4, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink
            placeholder:text-slate-light
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal
            disabled:bg-surface disabled:text-slate disabled:cursor-not-allowed
            ${error ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-border"}
            ${className}`}
          {...props}
        />

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

Textarea.displayName = "Textarea";

export default Textarea;