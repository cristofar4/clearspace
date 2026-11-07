"use client";

import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";

export function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[0.9rem] font-medium text-petrol-900">
        {label}
        {optional && <span className="text-xs font-normal text-ink-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.82rem] text-ink-muted">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className={`text-[0.84rem] text-danger ${message ? "mt-1.5 flex items-start gap-1.5" : "sr-only"}`} aria-live="polite">
      {message && <Icon name="info" size={16} className="mt-0.5 shrink-0" />}
      {message}
    </p>
  );
}

export function describedBy(id: string, error?: string, hint?: string) {
  return [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
}

/** Card style radio built on a real radio input, so arrow keys and forms work natively. */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  detail,
  icon,
  disabled,
  describedById,
  inputId,
  compact,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  detail?: string;
  icon?: ReactNode;
  disabled?: boolean;
  describedById?: string;
  inputId?: string;
  compact?: boolean;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer gap-3 rounded-[var(--radius-field)] border bg-white transition-[border-color,background-color,box-shadow] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-petrol-700 ${
        compact ? "items-center px-4 py-3" : "items-start p-4"
      } ${
        checked
          ? "border-petrol-800 bg-seaglass-50 shadow-[inset_0_0_0_1px_var(--color-petrol-800)]"
          : "border-porcelain-300 hover:border-porcelain-400"
      } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        aria-describedby={describedById}
        className="sr-only"
      />
      {icon && (
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${
            checked ? "bg-petrol-800 text-porcelain-50" : "bg-porcelain-100 text-petrol-800"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[0.95rem] font-semibold leading-snug text-petrol-900">{title}</span>
        {detail && <span className="mt-0.5 block text-[0.82rem] leading-snug text-ink-muted">{detail}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
          checked ? "border-petrol-800 bg-petrol-800 text-porcelain-50" : "border-porcelain-400"
        } ${compact ? "" : "mt-0.5"}`}
      >
        {checked && <Icon name="check" size={12} strokeWidth={2.4} />}
      </span>
    </label>
  );
}
