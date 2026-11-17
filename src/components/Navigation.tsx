import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOL_GROUPS } from "@/lib/tools";

interface MenuGroup {
  label: string;
  items: Array<{ to: string; label: string }>;
}

const MENU: MenuGroup[] = [
  { label: "Start", items: [{ to: "/", label: "Home" }, { to: "/rosters", label: "Roster tools" }] },
  ...TOOL_GROUPS.map((g) => ({
    label: g.navLabel,
    items: g.tools.map((t) => ({ to: t.to, label: t.name })),
  })),
  {
    label: "Help",
    items: [
      { to: "/how-to", label: "How to use" },
      { to: "/features", label: "Features" },
    ],
  },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Top bar: wordmark on the left, one "Menu" button on the far right. The menu
 * is a dialog panel that slides in from the right edge at every width (full
 * width on phones). Esc, the close button and the scrim close it; focus moves
 * in on open, is trapped while open and returns to the Menu button on close.
 */
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const panelId = "site-menu";

  // Close when the route changes (a link was followed).
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const btn = btnRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      btn?.focus();
    };
  }, [open]);

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 text-white no-underline"
          aria-label="PACE home"
        >
          <img src="/air_force_no_bg_navy.png" alt="" className="h-6 w-auto brightness-0 invert" />
          <span className="font-display text-2xl font-semibold leading-none tracking-[0.06em]">PACE</span>
        </Link>

        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-haspopup="dialog"
          className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-1 border border-white/40 px-3 text-sm text-white transition-colors duration-1 hover:border-white"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          Menu
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[rgb(var(--scrim)/0.55)]"
            onMouseDown={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="drawer-in absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface text-ink-2 shadow-1 sm:w-[340px]"
          >
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 bg-navy px-4 text-white sm:px-5">
              <h2 id={titleId} className="text-base font-semibold text-white">
                Menu
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center gap-1.5 rounded-1 border border-white/40 px-3 text-sm text-white hover:border-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </button>
            </div>
            <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4 sm:px-4">
              <ul className="grid gap-5">
                {MENU.map((group) => (
                  <li key={group.label}>
                    <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                      {group.label}
                    </p>
                    <ul className="grid gap-0.5">
                      {group.items.map((it) => (
                        <li key={it.to}>
                          <NavLink
                            to={it.to}
                            end
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                "relative block rounded-1 px-3 py-2 text-[15px] no-underline transition-colors duration-1",
                                isActive
                                  ? "bg-ground font-medium text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:bg-gold"
                                  : "text-ink-2 hover:bg-ground hover:text-ink",
                              )
                            }
                          >
                            {it.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
