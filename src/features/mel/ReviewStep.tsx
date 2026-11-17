import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ImageIcon,
  MoveRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Tag, type TagTone } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { controlClasses } from "@/components/ui/Field";
import { EditMemberModal } from "./EditMemberModal";
import { AddMemberModal } from "./AddMemberModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { MoveToEligibleForm } from "./MoveToEligibleDialog";
import { LogoUploadModal } from "./LogoUploadModal";
import { ActionBar, PageHeader } from "./WizardShell";
import { explainReason } from "./reasons";
import { apiClient } from "@/lib/api";
import { cn, formatDateMil } from "@/lib/utils";
import type { Member } from "@/types";

interface Statistics {
  total_uploaded: number;
  total_processed: number;
  eligible: number;
  ineligible: number;
  discrepancy: number;
  btz: number;
  errors: number;
}

interface SessionLike {
  session_id: string;
  cycle?: string;
  year?: string | number;
  categories?: {
    eligible?: Member[];
    ineligible?: Member[];
    discrepancy?: Member[];
    btz?: Member[];
    small_unit?: Member[];
  };
  statistics?: Partial<Statistics>;
  pascodes?: string[];
  pascode_unit_map?: Record<string, string>;
  custom_logo?: { uploaded: boolean; filename?: string | null };
  errors?: string[];
}

export interface ReviewSummary {
  total: number;
  discrepancy: number;
  ineligible: number;
  overrides: number;
  added: number;
}

interface ReviewStepProps {
  sessionData: SessionLike;
  showLogo?: boolean;
  onContinue: (updated: SessionLike) => void;
  onBack?: () => void;
  /** Header meta line (Step 2 of 4 · Initial MEL · SSG · 2026). */
  meta?: ReactNode;
  continueLabel?: string;
  /** Reports counts to the step rail. */
  onSummaryChange?: (s: ReviewSummary) => void;
}

type CategoryKey = "eligible" | "ineligible" | "discrepancy" | "btz" | "small_unit";
type TabKey = "all" | CategoryKey;

const CATEGORIES: Array<{ key: CategoryKey; label: string; tone: TagTone; dot: string }> = [
  { key: "eligible", label: "Eligible", tone: "elig", dot: "rgb(var(--elig))" },
  { key: "ineligible", label: "Ineligible", tone: "inel", dot: "rgb(var(--inel))" },
  { key: "discrepancy", label: "Discrepancy", tone: "disc", dot: "rgb(var(--disc))" },
  { key: "btz", label: "BTZ", tone: "btz", dot: "rgb(var(--btz))" },
  { key: "small_unit", label: "Small unit", tone: "small", dot: "rgb(var(--small))" },
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<
  CategoryKey,
  (typeof CATEGORIES)[number]
>;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;
// Pagination is client-side, so fetch the full category lists up front.
const FETCH_PAGE_SIZE = 100000;

function getErrorMessage(e: unknown, fallback: string): string {
  const err = e as {
    response?: { data?: { detail?: string; message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

function normalize(s: SessionLike): SessionLike {
  return {
    ...s,
    categories: {
      eligible: s.categories?.eligible ?? [],
      ineligible: s.categories?.ineligible ?? [],
      discrepancy: s.categories?.discrepancy ?? [],
      btz: s.categories?.btz ?? [],
      small_unit: s.categories?.small_unit ?? [],
    },
    statistics: {
      total_uploaded: 0,
      total_processed: 0,
      eligible: s.categories?.eligible?.length ?? 0,
      ineligible: s.categories?.ineligible?.length ?? 0,
      discrepancy: s.categories?.discrepancy?.length ?? 0,
      btz: s.categories?.btz?.length ?? 0,
      errors: s.errors?.length ?? 0,
      ...s.statistics,
    },
    pascodes: s.pascodes ?? [],
    pascode_unit_map: s.pascode_unit_map ?? {},
    custom_logo: s.custom_logo ?? { uploaded: false, filename: null },
    errors: s.errors ?? [],
  };
}

interface Row {
  key: string;
  m: Member;
  cats: CategoryKey[];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function ReviewStep({
  sessionData,
  showLogo = true,
  onContinue,
  onBack,
  meta,
  continueLabel = "Continue to force distributor",
  onSummaryChange,
}: ReviewStepProps) {
  const [data, setData] = useState<SessionLike>(() => normalize(sessionData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [pasFilter, setPasFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editing, setEditing] = useState<Member | null>(null);
  const [editingCat, setEditingCat] = useState<CategoryKey | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [moving, setMoving] = useState<Member | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  // Client-side only: changes since the last processing run, and which members
  // this reviewer touched ("Only my changes").
  const [changesSinceProcess, setChangesSinceProcess] = useState(0);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const markChanged = (memberId?: string) => {
    setChangesSinceProcess((n) => n + 1);
    if (memberId) setTouched((s) => new Set(s).add(memberId));
  };

  // Try to refresh from the preview API; fall back silently to the in-session data.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(
          `/api/roster/preview/${sessionData.session_id}`,
          { params: { category: "all", page: 1, page_size: FETCH_PAGE_SIZE } },
        );
        if (!cancelled && res?.data) {
          setData(normalize(res.data as SessionLike));
        }
      } catch {
        // Preview API not available: use session data as-is. Already normalized.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionData.session_id]);

  // Return to page 1 whenever the visible set or page size changes.
  useEffect(() => {
    setPage(0);
  }, [activeTab, pageSize, search, pasFilter, onlyMine]);

  const counts = useMemo(() => {
    const c = {} as Record<CategoryKey, number>;
    CATEGORIES.forEach((k) => (c[k.key] = data.categories?.[k.key]?.length ?? 0));
    return c;
  }, [data.categories]);

  // "All" merges the category lists; a member listed in two categories shows both tags.
  const allRows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    CATEGORIES.forEach(({ key }) => {
      (data.categories?.[key] ?? []).forEach((m, i) => {
        // The backend gives every member a stable `_uid`; the same person appears in
        // eligible + discrepancy (and small_unit) with different member_ids, so merge on it.
        const uid = (m as Member & { _uid?: string })._uid;
        const k = uid ?? m.member_id ?? `${key}-${m.FULL_NAME}-${i}`;
        const existing = map.get(k);
        if (existing) {
          existing.cats.push(key);
          // Show the discrepancy copy (it carries the reason and the Fix / Move actions).
          if (key === "discrepancy") existing.m = m;
        } else map.set(k, { key: k, m, cats: [key] });
      });
    });
    return Array.from(map.values());
  }, [data.categories]);

  const tabRows = useMemo<Row[]>(() => {
    if (activeTab === "all") return allRows;
    return (data.categories?.[activeTab] ?? []).map((m, i) => ({
      key: m.member_id ?? `${activeTab}-${m.FULL_NAME}-${i}`,
      m,
      cats: [activeTab],
    }));
  }, [activeTab, allRows, data.categories]);

  const overrides = useMemo(() => allRows.filter((r) => r.m.override).length, [allRows]);
  const added = useMemo(() => allRows.filter((r) => r.m.manual).length, [allRows]);

  useEffect(() => {
    onSummaryChange?.({
      total: allRows.length,
      discrepancy: counts.discrepancy,
      ineligible: counts.ineligible,
      overrides,
      added,
    });
  }, [allRows.length, counts, overrides, added]); // eslint-disable-line react-hooks/exhaustive-deps

  const pasOptions = useMemo(() => {
    const set = new Set<string>();
    allRows.forEach((r) => {
      if (r.m.ASSIGNED_PAS) set.add(r.m.ASSIGNED_PAS);
    });
    return Array.from(set).sort();
  }, [allRows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tabRows
      .filter(({ m }) => {
        if (pasFilter !== "all" && m.ASSIGNED_PAS !== pasFilter) return false;
        if (onlyMine && !(m.override || m.manual || touched.has(m.member_id))) return false;
        if (q) {
          const name = m.FULL_NAME?.toLowerCase() ?? "";
          const pas = m.ASSIGNED_PAS?.toLowerCase() ?? "";
          const afsc = `${m.DAFSC ?? ""} ${m.PAFSC ?? ""}`.toLowerCase();
          if (!name.includes(q) && !pas.includes(q) && !afsc.includes(q)) return false;
        }
        return true;
      })
      // Alphabetical by name so added members slot into place (matches the PDF).
      .sort((a, b) =>
        (a.m.FULL_NAME ?? "")
          .toUpperCase()
          .localeCompare((b.m.FULL_NAME ?? "").toUpperCase()),
      );
  }, [tabRows, pasFilter, search, onlyMine, touched]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/api/roster/preview/${sessionData.session_id}`,
        { params: { category: "all", page: 1, page_size: FETCH_PAGE_SIZE } },
      );
      if (res?.data) setData(normalize(res.data as SessionLike));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_LABEL: Record<string, string> = {
    eligible: "Eligible",
    ineligible: "Ineligible",
    discrepancy: "Discrepancy (also on the eligible list)",
    btz: "BTZ",
  };

  // Each handler throws on failure so the open dialog / inline form can show the
  // message and stay open with the user's input intact.
  const handleEdit = async (updates: Partial<Member>) => {
    if (!editing) return;
    setError(null);
    setNotice(null);
    try {
      const res = await apiClient.put(
        `/api/roster/member/${sessionData.session_id}/${editing.member_id}`,
        updates,
      );
      const moved = res?.data?.category_changed ? res.data.new_category : null;
      await refresh();
      markChanged(editing.member_id);
      setNotice(
        moved
          ? `${updates.FULL_NAME || editing.FULL_NAME} was re-checked and is now in ${CATEGORY_LABEL[moved] ?? moved}.`
          : `${updates.FULL_NAME || editing.FULL_NAME} updated.`,
      );
    } catch (e: unknown) {
      throw new Error(getErrorMessage(e, "Edit failed"));
    }
  };

  const handleAdd = async (memberData: Partial<Member>) => {
    setError(null);
    setNotice(null);
    try {
      const res = await apiClient.post(
        `/api/roster/member/${sessionData.session_id}`,
        {
          category: "eligible",
          data: memberData,
          reason: "Manual add via roster editor",
          run_eligibility_check: true,
        },
      );
      await refresh();
      markChanged();
      const cat = res?.data?.category as string | undefined;
      setNotice(
        `${memberData.FULL_NAME} added and checked against the eligibility filter: ${CATEGORY_LABEL[cat ?? ""] ?? cat ?? "placed"}.`,
      );
      if (cat && cat in CATEGORY_LABEL) setActiveTab(cat as CategoryKey);
    } catch (e: unknown) {
      throw new Error(getErrorMessage(e, "Add failed"));
    }
  };

  const handleDelete = async (reason: string) => {
    if (!deleting) return;
    setError(null);
    setNotice(null);
    try {
      await apiClient.delete(
        `/api/roster/member/${sessionData.session_id}/${deleting.member_id}`,
        { params: { hard_delete: true, reason: reason || "Removed via roster editor" } },
      );
      await refresh();
      markChanged();
      setNotice(`${deleting.FULL_NAME} was permanently deleted.`);
    } catch (e: unknown) {
      throw new Error(getErrorMessage(e, "Delete failed"));
    }
  };

  const handleMoveToEligible = async (reason: string) => {
    if (!moving) return;
    setError(null);
    setNotice(null);
    try {
      await apiClient.post(
        `/api/roster/member/${sessionData.session_id}/${moving.member_id}/move-to-eligible`,
        { reason },
      );
      await refresh();
      markChanged(moving.member_id);
      setNotice(`${moving.FULL_NAME} moved to Eligible.`);
      setMoving(null);
    } catch (e: unknown) {
      throw new Error(getErrorMessage(e, "Could not move member"));
    }
  };

  const handleClearOverride = async (m: Member) => {
    setError(null);
    setNotice(null);
    try {
      const res = await apiClient.post(
        `/api/roster/member/${sessionData.session_id}/${m.member_id}/clear-override`,
        {},
      );
      await refresh();
      markChanged(m.member_id);
      const cat = res?.data?.new_category as string | undefined;
      setNotice(`Override removed. ${m.FULL_NAME} was re-checked: ${CATEGORY_LABEL[cat ?? ""] ?? cat}.`);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not undo override"));
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.post(`/api/roster/reprocess/${sessionData.session_id}`, {});
      await refresh();
      setChangesSinceProcess(0);
      setNotice("Roster re-processed. Your adds, deletes, edits and overrides were kept.");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Reprocess failed"));
    } finally {
      setReprocessing(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setError(null);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      await apiClient.post(
        `/api/roster/logo/${sessionData.session_id}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Logo upload failed"));
    }
  };

  const handleLogoRemove = async () => {
    setError(null);
    try {
      await apiClient.delete(`/api/roster/logo/${sessionData.session_id}`);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Logo removal failed"));
    }
  };

  const anyDialogOpen = !!editing || adding || !!deleting || logoOpen;

  // Page shortcuts: "/" focuses search, "N" adds a member.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (anyDialogOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      const tag = (t?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || t?.isContentEditable) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if ((e.key === "n" || e.key === "N") && !t.closest("tr[data-row]")) {
        e.preventDefault();
        setAdding(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [anyDialogOpen]);

  const canMove = (cats: CategoryKey[]) =>
    cats.includes("ineligible") || cats.includes("discrepancy");

  const openEdit = (r: Row) => {
    setEditing(r.m);
    setEditingCat(r.cats[0]);
  };

  // Row shortcuts: arrows move between rows, E edits, M moves, Delete deletes.
  const onRowKey = (e: KeyboardEvent<HTMLTableRowElement>, r: Row) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const rows = Array.from(
        tbodyRef.current?.querySelectorAll<HTMLTableRowElement>("tr[data-row]") ?? [],
      );
      const i = rows.indexOf(e.currentTarget) + (e.key === "ArrowDown" ? 1 : -1);
      rows[i]?.focus();
    } else if (e.key === "e" || e.key === "E" || e.key === "Enter") {
      e.preventDefault();
      openEdit(r);
    } else if ((e.key === "m" || e.key === "M") && canMove(r.cats)) {
      e.preventDefault();
      setMoving(r.m);
    } else if (e.key === "Delete") {
      e.preventDefault();
      setDeleting(r.m);
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      setAdding(true);
    }
  };

  const showTab = (k: TabKey) => {
    setActiveTab(k);
    setSearch("");
  };

  const errorsList = data.errors ?? [];
  const attention: ReactNode[] = [];
  if (counts.discrepancy > 0)
    attention.push(
      <li key="d" style={{ ["--dot" as string]: "rgb(var(--disc))" }}>
        <LinkButton onClick={() => showTab("discrepancy")}>
          {plural(counts.discrepancy, "discrepancy", "discrepancies")}
        </LinkButton>{" "}
        to review
      </li>,
    );
  if (counts.ineligible > 0)
    attention.push(
      <li key="i" style={{ ["--dot" as string]: "rgb(var(--inel))" }}>
        <LinkButton onClick={() => showTab("ineligible")}>
          {counts.ineligible} ineligible
        </LinkButton>{" "}
        &mdash; move any you have a waiver for
      </li>,
    );
  if (overrides > 0)
    attention.push(
      <li key="o" style={{ ["--dot" as string]: "rgb(var(--primary))" }}>
        {plural(overrides, "manual override", "manual overrides")} this session
      </li>,
    );
  if (added > 0)
    attention.push(
      <li key="a" style={{ ["--dot" as string]: "rgb(var(--ink-3))" }}>
        {plural(added, "member", "members")} added by hand
      </li>,
    );

  const firstShown = filtered.length === 0 ? 0 : page * pageSize + 1;
  const lastShown = Math.min(filtered.length, (page + 1) * pageSize);

  return (
    <>
      <PageHeader
        meta={meta}
        title="Review the roster"
        description="Check each category, fix anything flagged, then continue. Changes are kept for this session only."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReprocess}
              loading={reprocessing}
              leftIcon={<RefreshCw />}
            >
              Re-process
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAdding(true)}
              leftIcon={<Plus />}
              aria-keyshortcuts="N"
            >
              Add member
            </Button>
            {showLogo ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLogoOpen(true)}
                leftIcon={<ImageIcon />}
                title={
                  data.custom_logo?.uploaded
                    ? `Logo: ${data.custom_logo.filename ?? "uploaded"}`
                    : "Optional unit logo for the PDF"
                }
              >
                {data.custom_logo?.uploaded ? "Replace logo" : "Unit logo"}
              </Button>
            ) : null}
          </>
        }
      />

      {showLogo && data.custom_logo?.uploaded ? (
        <p className="mt-3 text-[13px] text-ink-3">
          Unit logo: <span className="text-ink">{data.custom_logo.filename}</span> (prints on the
          PDF)
        </p>
      ) : null}

      {attention.length || changesSinceProcess > 0 || errorsList.length ? (
        <section
          aria-labelledby="attn-h"
          className="mt-[18px] grid grid-cols-1 gap-x-4 gap-y-1 rounded-1 border border-l-[3px] border-line border-l-disc bg-surface px-4 py-3 sm:grid-cols-[auto_1fr]"
        >
          <h2 id="attn-h" className="whitespace-nowrap pt-px text-sm font-semibold text-ink sm:row-span-3">
            Needs attention
          </h2>
          {attention.length ? (
            <ul className="flex flex-wrap gap-x-[22px] gap-y-1 text-sm [&>li]:before:mr-2 [&>li]:before:inline-block [&>li]:before:h-2 [&>li]:before:w-2 [&>li]:before:rounded-full [&>li]:before:bg-[var(--dot)] [&>li]:before:align-[1px] [&>li]:before:content-['']">
              {attention}
            </ul>
          ) : null}
          {changesSinceProcess > 0 ? (
            <p className="flex items-center gap-2 text-[13px] text-disc-ink">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {plural(changesSinceProcess, "change", "changes")} since the last processing run.
              Each change was re-checked; Re-process to re-sort the whole roster.
            </p>
          ) : null}
          {errorsList.length ? (
            <details className="text-[13px] text-ink-2">
              <summary className="cursor-pointer text-ink">
                {plural(errorsList.length, "row", "rows")} reported a processing error
              </summary>
              <ul className="mt-1 list-disc pl-5">
                {errorsList.map((er, i) => (
                  <li key={i}>{er}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}

      <Tabs
        className="mt-[18px]"
        ariaLabel="Category"
        idBase="review"
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabKey)}
        items={[
          { value: "all", label: "All", count: allRows.length },
          ...CATEGORIES.map((c) => ({
            value: c.key,
            label: c.label,
            count: counts[c.key],
            dot: c.dot,
            flag: c.key === "discrepancy" && counts.discrepancy > 0 ? "Review" : undefined,
          })),
        ]}
      />

      <div className="flex flex-wrap items-center gap-2.5 py-3.5">
        <div className="relative w-full sm:w-[300px]">
          <label htmlFor="roster-search" className="vh">
            Search members
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            id="roster-search"
            type="search"
            autoComplete="off"
            placeholder="Search name, PAS or AFSC"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-keyshortcuts="/"
            className={cn(controlClasses, "h-9 pl-9 pr-9 text-sm")}
          />
          <kbd aria-hidden="true" className="absolute right-2.5 top-1/2 -translate-y-1/2">
            /
          </kbd>
        </div>
        {pasOptions.length > 1 ? (
          <div className="w-full sm:w-auto">
            <label htmlFor="roster-unit" className="vh">
              Unit
            </label>
            <select
              id="roster-unit"
              value={pasFilter}
              onChange={(e) => setPasFilter(e.target.value)}
              className={cn(controlClasses, "h-9 w-full text-sm sm:w-auto sm:min-w-[190px]")}
            >
              <option value="all">All units ({pasOptions.length})</option>
              {pasOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                  {data.pascode_unit_map?.[p] ? ` · ${data.pascode_unit_map[p]}` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Only my changes
        </label>
      </div>

      {notice ? (
        <div role="status" className="msg msg-ok mb-3 flex items-start gap-3">
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-[13px] text-ink-3 underline decoration-line-strong underline-offset-4 hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="msg msg-error mb-3 flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <div
        id="review-panel"
        role="tabpanel"
        aria-labelledby={`review-tab-${activeTab}`}
        className="min-w-0"
      >
        {loading && pageItems.length === 0 ? (
          <div className="rounded-2 border border-line bg-surface py-12 text-center text-sm text-ink-3">
            Loading roster…
          </div>
        ) : (
          <div
            className="relative w-full overflow-x-auto rounded-2 border border-line bg-surface"
            role="region"
            aria-label="Roster members"
            tabIndex={0}
          >
            <table className="w-full border-collapse text-sm">
              <caption className="vh">Roster members, sorted by name A to Z</caption>
              <thead>
                <tr>
                  <Th aria-sort="ascending">
                    <span className="inline-flex items-center gap-1 text-ink">
                      Name
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </Th>
                  <Th>Grade</Th>
                  <Th>DAFSC</Th>
                  <Th>DOR</Th>
                  <Th>PAS</Th>
                  <Th>Status &amp; reason</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {pageItems.map((r) => (
                  <Fragment key={r.key}>
                    <MemberRow
                      r={r}
                      isMoving={moving?.member_id === r.m.member_id}
                      onKey={(e) => onRowKey(e, r)}
                      onEdit={() => openEdit(r)}
                      onMove={canMove(r.cats) ? () => setMoving(r.m) : undefined}
                      onUndo={r.m.override ? () => handleClearOverride(r.m) : undefined}
                      onDelete={() => setDeleting(r.m)}
                    />
                    {moving && moving.member_id === r.m.member_id ? (
                      <tr id={`mv-row-${r.key}`}>
                        <td
                          colSpan={7}
                          className="border-b border-line bg-elig-tint/60 px-4 pb-4 pt-3.5"
                        >
                          <MoveToEligibleForm
                            member={moving}
                            onCancel={() => setMoving(null)}
                            onConfirm={handleMoveToEligible}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-7 text-center text-ink-3">
                      {search || pasFilter !== "all" || onlyMine
                        ? "No members match. Clear the search or pick another category."
                        : "No members in this category."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 pt-3 text-[13px] text-ink-3">
        <span className="num">
          Showing {firstShown}–{lastShown} of {filtered.length}
        </span>
        <div className="hidden flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] md:flex" aria-label="Keyboard shortcuts">
          <span className="inline-flex items-center gap-1.5"><kbd>/</kbd> search</span>
          <span className="inline-flex items-center gap-1.5"><kbd>↑</kbd><kbd>↓</kbd> move between rows</span>
          <span className="inline-flex items-center gap-1.5"><kbd>E</kbd> edit</span>
          <span className="inline-flex items-center gap-1.5"><kbd>M</kbd> move to eligible</span>
          <span className="inline-flex items-center gap-1.5"><kbd>N</kbd> add member</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 whitespace-nowrap">
            Per page
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={cn(controlClasses, "h-8 w-auto px-2 text-[13px]")}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="num">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex-1" />
      <ActionBar
        back={
          onBack ? (
            <Button variant="tertiary" onClick={onBack} leftIcon={<ArrowLeft />}>
              Back to upload
            </Button>
          ) : null
        }
        statusTone={counts.discrepancy > 0 ? "warn" : "muted"}
        status={
          counts.discrepancy > 0
            ? `${plural(counts.discrepancy, "discrepancy", "discrepancies")} flagged. You can continue; discrepancy members stay on the eligible list.`
            : `${plural(allRows.length, "member", "members")} sorted into categories.`
        }
        primary={
          <Button onClick={() => onContinue(data)} rightIcon={<ArrowRight />}>
            {continueLabel}
          </Button>
        }
      />

      <EditMemberModal
        open={!!editing}
        member={editing}
        category={editingCat ? CAT_BY_KEY[editingCat] : undefined}
        onClose={() => setEditing(null)}
        onSave={handleEdit}
      />
      <AddMemberModal
        open={adding}
        onClose={() => setAdding(false)}
        onSave={handleAdd}
      />
      <DeleteConfirmDialog
        open={!!deleting}
        memberName={deleting?.FULL_NAME}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
      <LogoUploadModal
        open={logoOpen}
        onClose={() => setLogoOpen(false)}
        onUpload={handleLogoUpload}
        onRemove={handleLogoRemove}
        currentLogoUrl={null}
      />
    </>
  );
}

function Th({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-line bg-surface-2 px-2.5 py-[9px] text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-2",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current"
    >
      {children}
    </button>
  );
}

const actBase =
  "inline-flex h-7 items-center gap-[5px] rounded-1 border border-transparent px-[7px] text-[13px] font-medium text-ink-2 hover:border-line-strong hover:bg-surface hover:text-ink [&>svg]:h-4 [&>svg]:w-4";

function MemberRow({
  r,
  isMoving,
  onKey,
  onEdit,
  onMove,
  onUndo,
  onDelete,
}: {
  r: Row;
  isMoving: boolean;
  onKey: (e: KeyboardEvent<HTMLTableRowElement>) => void;
  onEdit: () => void;
  onMove?: () => void;
  onUndo?: () => void;
  onDelete: () => void;
}) {
  const { m, cats } = r;
  const name = m.FULL_NAME;
  const isDisc = cats.includes("discrepancy");
  const dor = formatDateMil(m.DOR);
  const plain = explainReason(m.reason, cats[0]);

  return (
    <tr
      data-row
      tabIndex={0}
      onKeyDown={onKey}
      className="hover:bg-ground/70 focus-visible:outline-offset-[-2px]"
    >
      <td
        className={cn(
          "whitespace-nowrap border-b border-line px-2.5 py-2 font-medium text-ink",
          m.override && "shadow-[inset_3px_0_0_rgb(var(--primary))]",
        )}
      >
        {name}
      </td>
      <td className="border-b border-line px-2.5 py-2 text-ink-2">{m.GRADE}</td>
      <td className="border-b border-line px-2.5 py-2 font-mono text-[13px] text-ink-2">
        {m.DAFSC ?? "—"}
      </td>
      <td className="num whitespace-nowrap border-b border-line px-2.5 py-2 text-ink-2">
        {dor ? dor : <span className="font-medium text-error">Missing</span>}
      </td>
      <td className="border-b border-line px-2.5 py-2 font-mono text-[13px] text-ink-2">
        {m.ASSIGNED_PAS}
      </td>
      <td className="min-w-[190px] border-b border-line px-2.5 py-2 text-[13.5px] text-ink-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {cats.map((c) => (
            <Tag key={c} tone={CAT_BY_KEY[c].tone}>
              {CAT_BY_KEY[c].label}
            </Tag>
          ))}
          {m.override ? (
            <Badge color="primary" title="Moved to eligible by a reviewer">
              Override
            </Badge>
          ) : null}
          {m.manual ? <Badge color="neutral">Added</Badge> : null}
        </div>
        {m.override ? (
          <span className="mt-1 block text-ink-2">
            Moved to eligible
            {m.override_reason ? <>: &ldquo;{m.override_reason}&rdquo;</> : null}
          </span>
        ) : plain ? (
          <span className="mt-1 block text-ink-2">{plain}</span>
        ) : null}
        {m.reason && (m.override || plain !== m.reason) ? (
          <span className="mt-px block font-mono text-[11.5px] text-ink-3">{m.reason}</span>
        ) : null}
      </td>
      <td className="border-b border-line px-2.5 py-2">
        <div className="flex justify-end gap-0.5 whitespace-nowrap">
          {onUndo ? (
            <button type="button" className={actBase} onClick={onUndo} aria-label={`Undo move to eligible for ${name}`}>
              <Undo2 aria-hidden="true" />
              Undo move
            </button>
          ) : null}
          <button
            type="button"
            className={cn(actBase, isDisc && "border-line-strong text-ink")}
            onClick={onEdit}
            aria-label={`${isDisc ? "Fix" : "Edit"} ${name}`}
          >
            <Pencil aria-hidden="true" />
            {isDisc ? "Fix" : "Edit"}
          </button>
          {onMove ? (
            <button
              type="button"
              className={cn(
                actBase,
                "text-elig hover:border-elig hover:text-elig",
                isMoving && "border-elig bg-elig-tint",
              )}
              onClick={onMove}
              aria-expanded={isMoving}
              aria-controls={isMoving ? `mv-row-${r.key}` : undefined}
              aria-label={`Move ${name} to eligible`}
            >
              <MoveRight aria-hidden="true" />
              Move to eligible
            </button>
          ) : null}
          <button
            type="button"
            className={cn(actBase, "px-1.5 text-ink-3 hover:border-inel hover:text-inel")}
            onClick={onDelete}
            aria-label={`Delete ${name}`}
            title="Delete permanently"
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}
