"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";
import { primaryNav } from "@/content/site";
import { services, type ServiceId } from "@/content/services";
import { useScrollLock } from "@/lib/hooks";
import { goToSection, prefersReducedMotion } from "@/lib/scroll";

/**
 * A purpose built phone menu: a full screen modal dialog with large,
 * thumb friendly targets. Native <dialog> keeps focus inside while open.
 */
export function MobileMenu({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusTo: RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  const { showService } = useSite();
  useScrollLock(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => setShown(true));
    } else if (!open && dialog.open) {
      setShown(false);
      const t = window.setTimeout(
        () => {
          dialog.close();
          returnFocusTo.current?.focus();
        },
        prefersReducedMotion() ? 0 : 260,
      );
      return () => window.clearTimeout(t);
    }
  }, [open, returnFocusTo]);

  // Close on desktop resize so the dialog never lingers behind the full nav
  useEffect(() => {
    if (!open) return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mql.matches && onClose();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [open, onClose]);

  const go = (id: string, after?: () => void) => {
    onClose();
    window.setTimeout(() => {
      if (after) after();
      else goToSection(id);
    }, prefersReducedMotion() ? 0 : 280);
  };

  const pickService = (id: ServiceId) => go("services", () => showService(id, { scroll: true }));

  return (
    <dialog
      ref={dialogRef}
      className="cs-sheet"
      aria-label="Menu"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className={`flex h-full flex-col transition-[opacity,transform] duration-300 ease-[var(--ease-out-quint)] ${
          shown ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <Wordmark />
          <button type="button" onClick={onClose} className="btn btn-sm btn-outline gap-2 px-3.5">
            <Icon name="close" size={18} />
            Close
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pb-6">
          <p className="eyebrow mt-6 text-brass-700">Services</p>
          <ul className="mt-3 divide-y divide-petrol-800/10 border-y border-petrol-800/10">
            {services.map((s) => (
              <li key={s.id}>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    pickService(s.id);
                  }}
                  className="flex min-h-14 items-center gap-4 py-3"
                >
                  <span className="w-6 text-xs tabular-nums text-brass-700">{s.number}</span>
                  <span className="font-display text-[1.45rem] leading-tight text-petrol-900">{s.name}</span>
                  <Icon name="arrow" size={18} className="ml-auto text-petrol-700" />
                </a>
              </li>
            ))}
          </ul>

          <ul className="mt-8 space-y-1">
            {primaryNav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(link.section);
                  }}
                  className="flex min-h-12 items-center font-display text-[1.9rem] leading-tight text-petrol-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-petrol-800/10 bg-porcelain-50 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <a
            href="#book"
            onClick={(e) => {
              e.preventDefault();
              go("book");
            }}
            className="btn btn-primary w-full"
          >
            Book a clean
            <Icon name="arrow" size={18} className="btn-arrow" />
          </a>
        </div>
      </div>
    </dialog>
  );
}
