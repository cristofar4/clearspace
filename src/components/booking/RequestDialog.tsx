"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { useScrollLock } from "@/lib/hooks";
import type { BookingRequestPayload } from "@/lib/booking";
import { prefersReducedMotion } from "@/lib/scroll";

export type RequestOutcome =
  | { kind: "demo"; payload: BookingRequestPayload }
  | { kind: "sent"; name: string }
  | { kind: "error"; message: string };

/**
 * Result of a submission. In demo mode this says plainly that nothing was
 * sent. Even in live mode it never claims a confirmed booking: availability
 * is confirmed by a person afterwards.
 */
export function RequestDialog({
  outcome,
  onClose,
  onStartAgain,
}: {
  outcome: RequestOutcome | null;
  onClose: () => void;
  onStartAgain: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  const [view, setView] = useState<RequestOutcome | null>(outcome);
  const open = Boolean(outcome);
  useScrollLock(open);

  // Keep showing the last outcome while the dialog animates closed
  if (outcome && outcome !== view) setView(outcome);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => setShown(true));
    } else if (!open && dialog.open) {
      setShown(false);
      const t = window.setTimeout(() => dialog.close(), prefersReducedMotion() ? 0 : 220);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const title =
    view?.kind === "demo"
      ? "Demo request prepared"
      : view?.kind === "sent"
        ? "Request received"
        : "We could not send your request";

  return (
    <dialog
      ref={ref}
      className="cs-dialog"
      aria-labelledby="request-dialog-title"
      aria-describedby="request-dialog-body"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className={`rounded-[var(--radius-panel)] bg-porcelain-50 p-6 shadow-2xl transition-[opacity,transform] duration-300 ease-[var(--ease-out-quint)] sm:p-9 ${
          shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={`grid h-12 w-12 place-items-center rounded-full ${
              view?.kind === "error" ? "bg-danger/10 text-danger" : "bg-seaglass-100 text-petrol-800"
            }`}
          >
            <Icon name={view?.kind === "error" ? "info" : view?.kind === "sent" ? "check" : "info"} size={22} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-petrol-800 hover:bg-porcelain-200"
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <h2 id="request-dialog-title" className="display-md mt-5 text-petrol-900">
          {title}
        </h2>

        <div id="request-dialog-body" className="mt-3 space-y-3 text-[1rem] leading-relaxed text-ink-muted">
          {view?.kind === "demo" && (
            <>
              <p>
                <strong className="font-semibold text-petrol-900">Nothing was sent and no visit has been booked.</strong>{" "}
                This site is running in demo mode.
              </p>
              <p>
                Once connected to a booking service, this request would go to the Clearspace team, who would check
                availability and reply to confirm.
              </p>
            </>
          )}
          {view?.kind === "sent" && (
            <>
              <p>Thank you{view.name ? `, ${view.name}` : ""}. Your request has reached us.</p>
              <p>
                This is not yet a confirmed booking. We will check availability for your preferred date and reply by
                email.
              </p>
            </>
          )}
          {view?.kind === "error" && (
            <>
              <p>{view.message}</p>
              <p>Your details are still in the form, so you can try again in a moment.</p>
            </>
          )}
        </div>

        {view?.kind === "demo" && (
          <details className="group mt-5 rounded-[14px] border border-petrol-800/10 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-petrol-900">
              View the request data
              <Icon name="chevronDown" size={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <pre className="max-h-56 overflow-auto border-t border-petrol-800/10 px-4 py-3 text-[0.75rem] leading-relaxed text-petrol-900">
              {JSON.stringify(view.payload, null, 2)}
            </pre>
          </details>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {view?.kind === "error" ? (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Back to the form
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Back to the form
              </button>
              <button type="button" className="btn btn-primary" onClick={onStartAgain}>
                Start a new request
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
