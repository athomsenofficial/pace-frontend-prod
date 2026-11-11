import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { ChevronDown, Menu, X, Wrench, Calculator, FileText, Compass, BookOpen, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  to: string;
  label: string;
  description?: string;
  icon?: typeof Wrench;
}

interface NavItem {
  to?: string;
  label: string;
  icon?: typeof LayoutDashboard;
  items?: DropdownItem[];
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/features", label: "Features", icon: Compass },
  {
    label: "MEL Tools",
    icon: Wrench,
    items: [
      { to: "/initial-mel", label: "Initial MEL", description: "Generate initial promotion eligibility list", icon: FileText },
      { to: "/final-mel", label: "Final MEL", description: "Generate interactive final MEL with NRN/P/MP/PN", icon: FileText },
      { to: "/mpf-roster", label: "MPF Roster", description: "Generate MPF distribution lists by PAS code", icon: FileText },
    ],
  },
  {
    label: "Calculators",
    icon: Calculator,
    items: [
      { to: "/calculators/promotion", label: "Promotion Eligibility", description: "Check eligibility for a single member", icon: Calculator },
      { to: "/calculators/btz", label: "BTZ Eligibility", description: "Check Below-the-Zone eligibility", icon: Calculator },
    ],
  },
  { to: "/memo-generator", label: "Memorandum", icon: FileText },
  { to: "/how-to", label: "How To", icon: BookOpen },
];

export default function Navigation() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/air_force_no_bg_navy.png"
              alt="USAF"
              className="h-8 w-auto"
            />
            <span className="font-brand text-2xl text-navy-900 tracking-wider">
              PACE
            </span>
          </Link>

          <nav
            ref={ref}
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {NAV.map((item) => {
              if (item.items) {
                const isOpen = openMenu === item.label;
                return (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(isOpen ? null : item.label)
                      }
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium",
                        isOpen
                          ? "bg-slate-100 text-navy-900"
                          : "text-slate-700 hover:text-navy-900 hover:bg-slate-50",
                      )}
                    >
                      {item.icon ? <item.icon className="h-4 w-4" /> : null}
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen ? (
                      <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setOpenMenu(null)}
                            className="block px-4 py-2 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium text-navy-900">
                              {sub.icon ? (
                                <sub.icon className="h-4 w-4 text-navy-700" />
                              ) : null}
                              {sub.label}
                            </div>
                            {sub.description ? (
                              <div className="text-xs text-slate-500 mt-0.5 pl-6">
                                {sub.description}
                              </div>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to!}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium",
                      isActive
                        ? "bg-slate-100 text-navy-900"
                        : "text-slate-700 hover:text-navy-900 hover:bg-slate-50",
                    )
                  }
                >
                  {item.icon ? <item.icon className="h-4 w-4" /> : null}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            className="md:hidden text-slate-700"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="md:hidden pb-4 space-y-2">
            {NAV.flatMap((item) =>
              item.items
                ? item.items.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {sub.label}
                    </Link>
                  ))
                : [
                    <Link
                      key={item.to}
                      to={item.to!}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {item.label}
                    </Link>,
                  ],
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
