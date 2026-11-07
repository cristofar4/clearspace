"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";

/**
 * Before and after comparison.
 * Drag anywhere on the image (mouse, pen or touch), or focus the handle and
 * use the arrow keys, Page Up and Page Down, Home and End.
 * Vertical swipes still scroll the page on touch screens.
 */
export function CompareSlider({
  before,
  after,
  label,
  initial = 50,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: ReactNode;
  after: ReactNode;
  label: string;
  initial?: number;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [value, setValue] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const fromPointer = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.round(Math.max(0, Math.min(100, next)) * 10) / 10);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e.clientX);
    handleRef.current?.focus({ preventScroll: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) fromPointer(e.clientX);
  };
  const endDrag = () => setDragging(false);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const moves: Record<string, (v: number) => number> = {
      ArrowLeft: (v) => v - step,
      ArrowDown: (v) => v - step,
      ArrowRight: (v) => v + step,
      ArrowUp: (v) => v + step,
      PageDown: (v) => v - 10,
      PageUp: (v) => v + 10,
      Home: () => 0,
      End: () => 100,
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setValue((v) => Math.max(0, Math.min(100, move(v))));
  };

  const rounded = Math.round(value);

  return (
    <div
      ref={frameRef}
      className={`relative h-full w-full select-none overflow-hidden touch-pan-y ${dragging ? "cursor-grabbing" : "cursor-ew-resize"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="absolute inset-0">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        {before}
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-porcelain-50/92 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-petrol-800">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-petrol-800/92 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-porcelain-50">
        {afterLabel}
      </span>

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${value}%` }}>
        <div className="scan-line-v absolute inset-y-0 -left-px w-[2px]" />
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={`${rounded}% ${beforeLabel.toLowerCase()}, ${100 - rounded}% ${afterLabel.toLowerCase()}`}
          onKeyDown={onKeyDown}
          className={`pointer-events-auto absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-porcelain-50 bg-brass-500 text-porcelain-50 shadow-[0_10px_24px_-10px_rgba(13,47,53,0.7)] transition-transform duration-200 focus-visible:outline-offset-4 ${
            dragging ? "scale-110" : "hover:scale-105"
          }`}
        >
          <Icon name="drag" size={20} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
