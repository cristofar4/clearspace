"use client";

import { useEffect, useRef, useState } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";
import { primaryNav } from "@/content/site";
import { MobileMenu } from "./MobileMenu";
import { ServicesMenu } from "./ServicesMenu";

/** Contract past this point, expand again only above the lower one. The gap stops flicker. */
const CONTRACT_AT = 112;
const EXPAND_AT = 72;

const SECTIONS = ["services", "difference", "standard", "visits", "book"];

export function SiteNav() {
  const [compact, setCompact] = useState(false);
  /** Counts each time the bar changes shape while scrolling; drives the light sweep. */
  const [moves, setMoves] = useState(0);
  const compactRef = useRef(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { draft } = useSite();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const was = compactRef.current;
      const next = was ? y > EXPAND_AT : y > CONTRACT_AT;
      if (next !== was) {
        compactRef.current = next;
        setCompact(next);
        setMoves((m) => m + 1);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Mark the section currently in view
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setCurrent(best);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const bookingStarted = Boolean(draft.service);
  // Each change of shape or booking choice gives the light a fresh burst
  const lightTrigger = `${compact}-${draft.service}-${draft.frequency}-${draft.focusRoom}`;

  return (
    <>
      <header className="site-nav" data-compact={compact} aria-label="Site">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-petrol-800 focus:px-4 focus:py-2 focus:text-porcelain-50"
        >
          Skip to content
        </a>
        {/* Each time the bar moves on scroll, a soft light sweeps once around its outline */}
        <span key={`sweep-${moves}`} aria-hidden="true" className="nav-sweep" data-run={moves > 0} />
        <nav aria-label="Main" className="flex items-center justify-between gap-2 sm:gap-4">
          <a href="#top" className="shrink-0 rounded-md" aria-label="Clearspace, back to top">
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
            <li>
              <ServicesMenu current={current === "services"} />
            </li>
            {primaryNav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={current === link.section ? "true" : undefined}
                  className="relative inline-flex h-11 items-center rounded-full px-4 text-[0.92rem] font-medium text-petrol-900/80 transition-colors hover:text-petrol-900 aria-[current]:text-petrol-900"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 bottom-2 h-px origin-left bg-brass-500 transition-transform duration-500 ease-[var(--ease-out-quint)] ${
                      current === link.section ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href="#book" className="btn btn-primary hidden gap-3 pl-5 lg:inline-flex">
              <NavLight trigger={lightTrigger} active={bookingStarted} />
              {bookingStarted ? "Continue booking" : "Book a clean"}
              <Icon name="arrow" size={18} className="btn-arrow" />
            </a>
            <a href="#book" className="btn btn-primary btn-sm gap-2.5 pl-3.5 lg:hidden">
              <NavLight trigger={lightTrigger} active={bookingStarted} />
              Book
            </a>
            <button
              ref={menuButton}
              type="button"
              className="btn btn-sm btn-outline gap-2 px-3 sm:px-3.5 lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" size={18} />
              <span className="sr-only sm:not-sr-only">Menu</span>
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={menuButton} />
    </>
  );
}

/**
 * The Clearspace light. Remounting on a new trigger restarts a short burst
 * of blinks (under five seconds); between bursts it glows steadily.
 * Brass while you browse, sea glass once a booking is under way.
 */
function NavLight({ trigger, active }: { trigger: string; active: boolean }) {
  return (
    <span
      key={trigger}
      aria-hidden="true"
      className="cs-light"
      data-blink="true"
      data-state={active ? "active" : "idle"}
    />
  );
}
