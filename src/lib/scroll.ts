export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll to a section and move keyboard focus to a target inside it, so
 * screen reader and keyboard users land where sighted users do.
 */
export function goToSection(id: string, focusSelector?: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const reduce = prefersReducedMotion();
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (window.location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
  const target = (focusSelector && section.querySelector<HTMLElement>(focusSelector)) || section;
  if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  window.setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 450);
}
