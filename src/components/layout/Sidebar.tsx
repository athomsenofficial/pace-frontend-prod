import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_ITEM, NAV_GROUPS, type NavItem } from "./nav";

export function Wordmark({ onDark = true }: { onDark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/air_force_no_bg_navy.png"
        alt=""
        aria-hidden="true"
        className={cn("h-7 w-auto", onDark && "brightness-0 invert")}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[17px] font-bold tracking-[0.18em]",
            onDark ? "text-white" : "text-fg",
          )}
        >
          PACE
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.08em]",
            onDark ? "text-sidebar-muted" : "text-fg-subtle",
          )}
        >
          Personnel tools
        </span>
      </span>
    </span>
  );
}

function Item({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13.5px] font-medium transition-colors",
          "focus-visible:outline-offset-0",
          isActive
            ? "bg-sidebar-active text-white"
            : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span
              className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-gold"
              aria-hidden="true"
            />
          ) : null}
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-white" : "text-sidebar-muted group-hover:text-sidebar-fg",
            )}
            aria-hidden="true"
          />
          <span className="truncate">{item.label}</span>
          {item.badge ? (
            <span className="ml-auto rounded bg-gold/20 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-gold-light">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-fg">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-line px-4">
        <NavLink to="/" onClick={onNavigate} className="rounded-md" aria-label="PACE dashboard">
          <Wordmark />
        </NavLink>
      </div>

      <nav aria-label="Primary" className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
        <Item item={DASHBOARD_ITEM} onNavigate={onNavigate} />
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-5">
            <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-sidebar-muted/80">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Item key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-line p-3">
        <div className="flex gap-2 rounded-md bg-sidebar-hover px-3 py-2.5 text-xs leading-[1.125rem] text-sidebar-muted">
          <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-gold-light" aria-hidden="true" />
          <p>
            <span className="font-semibold text-sidebar-fg">Processed, not stored.</span>{" "}
            Uploaded rosters are used only for your session.
          </p>
        </div>
      </div>
    </div>
  );
}
