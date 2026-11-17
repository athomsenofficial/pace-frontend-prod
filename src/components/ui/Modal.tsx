import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Extra line under the title (e.g. member name, PAS and category tag). */
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Left-aligned note in the footer (edit count, shortcuts). */
  footerNote?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Extra key handling inside the dialog (e.g. Ctrl+Enter to save). */
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-[720px]",
  xl: "max-w-4xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog: flat navy scrim, Newsreader title, focus trapped inside, Esc closes,
 * focus returns to the element that opened it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  meta,
  children,
  footer,
  footerNote,
  size = "md",
  onKeyDown,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first field (or whatever used autoFocus), else the panel.
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      if (panel.contains(document.activeElement)) return;
      const first = panel.querySelector<HTMLElement>(
        "[data-autofocus], .dlg-body " + FOCUSABLE.split(", ").join(", .dlg-body "),
      );
      (first ?? panel).focus();
    }, 0);

    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", handler, true);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgb(var(--scrim)/0.55)] px-2 py-4 sm:px-4 sm:py-12"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-6rem)] flex-col rounded-2 border border-line bg-surface shadow-1 focus:outline-none",
          sizeClasses[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-4 pb-3.5 pt-4 sm:px-[22px]">
          <div className="min-w-0">
            {title ? (
              <h2 id={titleId} className="font-display text-[26px] font-normal leading-[1.1] text-ink">
                {title}
              </h2>
            ) : null}
            {meta ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
                {meta}
              </div>
            ) : null}
            {description ? (
              <p id={descId} className="mt-1.5 text-sm text-ink-3">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-1 border border-transparent text-ink-2 hover:border-line-strong"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="dlg-body flex-1 overflow-y-auto px-4 py-[18px] sm:px-[22px]">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line px-4 py-3.5 sm:px-[22px]">
            {footerNote ? (
              <div className="mr-auto min-w-[180px] flex-1 text-[13px] text-ink-3">{footerNote}</div>
            ) : null}
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
