"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { services, type ServiceId } from "@/content/services";
import { useDismiss } from "@/lib/hooks";

/**
 * Services disclosure. A button toggles a panel of real links, so it works
 * with a keyboard, a screen reader, a mouse or touch.
 */
export function ServicesMenu({ current }: { current: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const { showService } = useSite();
  const wrapRef = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const focusLink = (index: number) => {
    const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];
    links[(index + links.length) % links.length]?.focus();
  };

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusLink(0));
    }
  };

  const onPanelKey = (e: KeyboardEvent) => {
    const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusLink(index + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusLink(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusLink(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusLink(links.length - 1);
    }
  };

  const choose = (e: MouseEvent, serviceId: ServiceId) => {
    e.preventDefault();
    setOpen(false);
    showService(serviceId, { scroll: true });
  };

  const hoverOpen = () => {
    window.clearTimeout(hoverTimer.current);
    if (!openRef.current) hoverOpenedAt.current = Date.now();
    openRef.current = true;
    setOpen(true);
  };
  // A click that lands just after hover opened the menu should not close it again
  const onClick = () => {
    if (Date.now() - hoverOpenedAt.current < 700) {
      openRef.current = true;
      setOpen(true);
      return;
    }
    openRef.current = !openRef.current;
    setOpen(openRef.current);
  };
  const hoverClose = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onClick}
        onKeyDown={onButtonKey}
        className={`relative inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[0.92rem] font-medium transition-colors hover:text-petrol-900 ${
          current || open ? "text-petrol-900" : "text-petrol-900/80"
        }`}
      >
        Services
        <Icon
          name="chevronDown"
          size={16}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-x-4 bottom-2 h-px origin-left bg-brass-500 transition-transform duration-500 ${
            current ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-panel`}
            onKeyDown={onPanelKey}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-[calc(100%+14px)] w-[min(560px,80vw)] -translate-x-1/2 rounded-[var(--radius-card)] border border-petrol-800/10 bg-porcelain-50 p-2 shadow-[0_30px_60px_-30px_rgba(13,47,53,0.45)]"
          >
            <ul className="grid grid-cols-2 gap-1">
              {services.map((s, i) => (
                <li key={s.id}>
                  <a
                    ref={(el) => {
                      linkRefs.current[i] = el;
                    }}
                    href="#services"
                    onClick={(e) => choose(e, s.id)}
                    className="group flex h-full flex-col rounded-[14px] p-4 transition-colors hover:bg-seaglass-50 focus-visible:bg-seaglass-50"
                  >
                    <span className="flex items-center gap-2 text-xs text-brass-700">
                      <span className="tabular-nums">{s.number}</span>
                      {s.badge && (
                        <span className="rounded-full bg-seaglass-100 px-2 py-0.5 text-[0.68rem] font-medium text-petrol-700">
                          {s.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 flex items-center justify-between font-display text-[1.2rem] text-petrol-900">
                      {s.name}
                      <Icon
                        name="arrow"
                        size={16}
                        className="text-petrol-700 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                    </span>
                    <span className="mt-1 text-[0.84rem] leading-snug text-ink-muted">{s.short}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between rounded-[14px] bg-petrol-800 px-4 py-3 text-sm text-porcelain-50 transition-colors hover:bg-petrol-700"
            >
              Not sure which fits? Tell us about your space.
              <Icon name="arrow" size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
