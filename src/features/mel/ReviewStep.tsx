import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Upload as UploadIcon,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Users,
  Search,
  ImageIcon,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Stat } from "@/components/ui/Stat";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { EditMemberModal } from "./EditMemberModal";
import { AddMemberModal } from "./AddMemberModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { LogoUploadModal } from "./LogoUploadModal";
import { apiClient } from "@/lib/api";
import { formatDate } from "@/lib/utils";
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

interface ReviewStepProps {
  sessionData: SessionLike;
  showLogo?: boolean;
  onContinue: (updated: SessionLike) => void;
  onBack?: () => void;
}

type CategoryKey = "eligible" | "ineligible" | "discrepancy" | "btz" | "small_unit";

type CategoryColor = "green" | "red" | "amber" | "violet" | "navy";
type StatTone = "success" | "danger" | "warning" | "violet" | "primary";

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  color: CategoryColor;
  tone: StatTone;
  icon: React.ReactNode;
}> = [
  { key: "eligible", label: "Eligible", color: "green", tone: "success", icon: <CheckCircle2 /> },
  { key: "ineligible", label: "Ineligible", color: "red", tone: "danger", icon: <XCircle /> },
  { key: "discrepancy", label: "Discrepancy", color: "amber", tone: "warning", icon: <AlertTriangle /> },
  { key: "btz", label: "BTZ", color: "violet", tone: "violet", icon: <Crown /> },
  { key: "small_unit", label: "Small Unit", color: "navy", tone: "primary", icon: <Users /> },
];

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

export function ReviewStep({
  sessionData,
  showLogo = true,
  onContinue,
  onBack,
}: ReviewStepProps) {
  const [data, setData] = useState<SessionLike>(() => normalize(sessionData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryKey>("eligible");
  const [pasFilter, setPasFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editing, setEditing] = useState<Member | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

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
        // Preview API not available — use session data as-is. Already normalized.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionData.session_id]);

  useEffect(() => {
    setPage(0);
    setPasFilter("all");
  }, [activeTab]);

  // Return to page 1 whenever the visible set or page size changes.
  useEffect(() => {
    setPage(0);
  }, [pageSize, search, pasFilter]);

  const currentList = useMemo<Member[]>(
    () => data.categories?.[activeTab] ?? [],
    [data.categories, activeTab],
  );

  const pasOptions = useMemo(() => {
    const set = new Set<string>();
    currentList.forEach((m) => {
      if (m.ASSIGNED_PAS) set.add(m.ASSIGNED_PAS);
    });
    return Array.from(set).sort();
  }, [currentList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return currentList
      .filter((m) => {
        if (pasFilter !== "all" && m.ASSIGNED_PAS !== pasFilter) return false;
        if (q) {
          const name = m.FULL_NAME?.toLowerCase() ?? "";
          const pas = m.ASSIGNED_PAS?.toLowerCase() ?? "";
          if (!name.includes(q) && !pas.includes(q)) return false;
        }
        return true;
      })
      // Alphabetical by name so added members slot into place (matches the PDF).
      .sort((a, b) =>
        (a.FULL_NAME ?? "")
          .toUpperCase()
          .localeCompare((b.FULL_NAME ?? "").toUpperCase()),
      );
  }, [currentList, pasFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const stats = data.statistics ?? {};

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

  const handleEdit = async (updates: Partial<Member>) => {
    if (!editing) return;
    setError(null);
    try {
      await apiClient.put(
        `/api/roster/member/${sessionData.session_id}/${editing.member_id}`,
        updates,
      );
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Edit failed"));
    }
  };

  const handleAdd = async (memberData: Partial<Member>) => {
    setError(null);
    try {
      await apiClient.post(
        `/api/roster/member/${sessionData.session_id}`,
        {
          category: "eligible",
          data: memberData,
          reason: "Manual add via roster editor",
        },
      );
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Add failed"));
    }
  };

  const handleDelete = async (hard: boolean) => {
    if (!deleting) return;
    setError(null);
    try {
      await apiClient.delete(
        `/api/roster/member/${sessionData.session_id}/${deleting.member_id}`,
        { params: { hard_delete: hard, reason: "Removed via roster editor" } },
      );
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Delete failed"));
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    setError(null);
    try {
      await apiClient.post(`/api/roster/reprocess/${sessionData.session_id}`, {});
      await refresh();
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

  const statValue = (key: CategoryKey): number =>
    key === "small_unit"
      ? data.categories?.small_unit?.length ?? 0
      : (stats as Record<string, number | undefined>)[key] ?? 0;

  return (
    <Card>
      <CardHeader
        title={`Roster review — ${data.cycle ?? "—"} ${data.year ?? ""}`}
        description={
          <>
            Check each category, fix any discrepancies, then continue.{" "}
            <span className="whitespace-nowrap font-mono text-xs text-fg-subtle">
              Session {sessionData.session_id}
            </span>
          </>
        }
        actions={
          showLogo ? (
            <>
              {data.custom_logo?.uploaded ? (
                <span className="inline-flex max-w-[14rem] items-center gap-1.5 truncate rounded-md border border-line bg-surface-muted px-2.5 py-1 text-xs text-fg-muted">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{data.custom_logo.filename}</span>
                </span>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UploadIcon className="h-4 w-4" />}
                onClick={() => setLogoOpen(true)}
              >
                {data.custom_logo?.uploaded ? "Replace logo" : "Upload unit logo"}
              </Button>
            </>
          ) : null
        }
      />

      <CardBody className="space-y-5">
        {/* Statistics — click a tile to jump to that category */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Stat
              key={c.key}
              label={c.label}
              value={statValue(c.key)}
              icon={c.icon}
              tone={c.tone}
              active={activeTab === c.key}
              onClick={() => setActiveTab(c.key)}
            />
          ))}
          <Stat label="Errors" value={stats.errors ?? 0} icon={<AlertCircle />} tone="neutral" />
        </div>

        <Tabs
          ariaLabel="Eligibility categories"
          items={CATEGORIES.map((c) => ({
            value: c.key,
            label: c.label,
            count: data.categories?.[c.key]?.length ?? 0,
          }))}
          value={activeTab}
          onChange={(v) => setActiveTab(v as CategoryKey)}
        />

        {/* Filter row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="sm:w-72">
              <Input
                leadingIcon={<Search />}
                aria-label="Search members"
                placeholder="Search name or PASCODE…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {pasOptions.length > 1 ? (
              <Select
                aria-label="Filter by PASCODE"
                value={pasFilter}
                onChange={(e) => setPasFilter(e.target.value)}
                containerClassName="sm:w-48"
              >
                <option value="all">All PASCODEs</option>
                {pasOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReprocess}
              loading={reprocessing}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Re-process
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAdding(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add member
            </Button>
          </div>
        </div>

        {error ? (
          <Alert tone="danger" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <Table maxHeight="60vh" dense zebra>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Grade</TH>
              <TH>DAFSC</TH>
              <TH>DOR</TH>
              <TH>PAS</TH>
              <TH>Status / reason</TH>
              <TH align="right">
                <span className="sr-only">Actions</span>
              </TH>
            </TR>
          </THead>
          <TBody>
            {loading && pageItems.length === 0 ? (
              <TR>
                <TD colSpan={7}>
                  <div className="flex items-center justify-center gap-2 py-10 text-fg-muted">
                    <Spinner />
                    Loading roster…
                  </div>
                </TD>
              </TR>
            ) : pageItems.length === 0 ? (
              <TR>
                <TD colSpan={7}>
                  <EmptyState
                    compact
                    icon={<Users />}
                    title={
                      search || pasFilter !== "all"
                        ? "No members match your filters"
                        : "No members in this category"
                    }
                    description={
                      search || pasFilter !== "all"
                        ? "Try a different name or PASCODE."
                        : undefined
                    }
                  />
                </TD>
              </TR>
            ) : (
              pageItems.map((m, i) => (
                <TR key={m.member_id ?? `${m.FULL_NAME}-${i}`}>
                  <TD className="whitespace-nowrap font-medium">{m.FULL_NAME}</TD>
                  <TD className="whitespace-nowrap">{m.GRADE}</TD>
                  <TD className="whitespace-nowrap font-mono text-xs">{m.DAFSC ?? "—"}</TD>
                  <TD className="whitespace-nowrap tabular-nums">{formatDate(m.DOR)}</TD>
                  <TD className="whitespace-nowrap font-mono text-xs">{m.ASSIGNED_PAS}</TD>
                  <TD className="min-w-[14rem]">
                    <Badge color={badgeColor(activeTab)}>{categoryToLabel(activeTab)}</Badge>
                    {m.reason ? (
                      <p className="mt-1 text-xs leading-4 text-fg-muted">{m.reason}</p>
                    ) : null}
                  </TD>
                  <TD align="right" className="whitespace-nowrap">
                    <div className="inline-flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => setEditing(m)}
                        className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-primary-text"
                        aria-label={`Edit ${m.FULL_NAME}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(m)}
                        className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                        aria-label={`Delete ${m.FULL_NAME}`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-muted">
            <span className="tabular-nums">
              {filtered.length === 0
                ? "0 members"
                : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} of ${filtered.length} member${filtered.length === 1 ? "" : "s"}`}
            </span>
            <label className="flex items-center gap-1.5">
              Rows per page
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 rounded-md border border-line-strong/60 bg-surface px-1.5 text-xs text-fg"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-fg-subtle">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardBody>

      <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to upload
          </Button>
        ) : (
          <span />
        )}
        <Button
          onClick={() => onContinue(data)}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue to Force Distributor
        </Button>
      </CardFooter>

      <EditMemberModal
        open={!!editing}
        member={editing}
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
    </Card>
  );
}

function badgeColor(cat: CategoryKey): CategoryColor {
  return CATEGORIES.find((c) => c.key === cat)?.color ?? "navy";
}

function categoryToLabel(cat: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
}
