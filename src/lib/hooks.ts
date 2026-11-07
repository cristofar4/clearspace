"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/** Media query state that is safe during server rendering (false on the server). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Lock page scroll while a modal surface is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    root.classList.add("scroll-locked");
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    return () => {
      root.classList.remove("scroll-locked");
      root.style.paddingRight = "";
    };
  }, [locked]);
}

/** Close a popover when focus or a pointer press lands outside it. */
export function useDismiss<T extends HTMLElement>(open: boolean, onDismiss: () => void) {
  const ref = useRef<T>(null);
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) dismissRef.current();
    };
    const onFocus = (e: FocusEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) dismissRef.current();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);
  return ref;
}

const noopSubscribe = () => () => {};

/**
 * A value that only exists in the browser (today's date, for example).
 * Renders the fallback on the server and during hydration, then the real value.
 */
export function useClientValue<T extends string | number>(read: () => T, fallback: T): T {
  return useSyncExternalStore(noopSubscribe, read, () => fallback);
}
