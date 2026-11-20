import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Menu, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { findNav } from "./nav";

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const { group, item } = findNav(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="-ml-1.5 rounded-md p-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          to="/"
          className="text-[15px] font-bold tracking-[0.18em] text-fg lg:hidden"
          aria-label="PACE dashboard"
        >
          PACE
        </Link>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
          <ol className="flex items-center gap-1.5 text-[13px]">
            {group ? (
              <>
                <li className="text-fg-subtle">{group.label}</li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-fg-subtle/70" />
                </li>
              </>
            ) : null}
            <li className="truncate font-medium text-fg" aria-current="page">
              {item?.label ?? "PACE"}
            </li>
          </ol>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span
            className="hidden items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs text-fg-muted md:inline-flex"
            title="PACE processes uploaded files for your session and does not store them."
          >
            <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Uploads processed, not stored
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
