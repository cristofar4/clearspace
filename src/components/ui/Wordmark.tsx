import { site } from "@/content/site";

/**
 * The mark is a rounded square crossed by a single diagonal pass: the wipe
 * that runs through the Clearspace Reset interaction.
 */
export function LogoMark({ size = 28, tone = "dark" }: { size?: number; tone?: "dark" | "light" }) {
  const fill = tone === "dark" ? "var(--color-petrol-800)" : "var(--color-porcelain-50)";
  const pass = tone === "dark" ? "var(--color-seaglass-300)" : "var(--color-petrol-800)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill={fill} />
      <path d="M9.5 24.5 22.5 7.5" stroke={pass} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M15 25.2 24.6 12.6" stroke={pass} strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark tone={tone} />
      <span
        className={`text-[0.85rem] font-semibold tracking-[0.26em] sm:text-[0.95rem] sm:tracking-[0.34em] ${
          tone === "dark" ? "text-petrol-800" : "text-porcelain-50"
        }`}
      >
        {site.wordmark}
      </span>
    </span>
  );
}
