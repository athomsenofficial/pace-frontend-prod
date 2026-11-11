import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Upload as UploadIcon,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Users,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EditMemberModal } from "./EditMemberModal";
import { AddMemberModal } from "./AddMemberModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { LogoUploadModal } from "./LogoUploadModal";
import { apiClient } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
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

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  color: "green" | "red" | "amber" | "teal" | "neutral";
  icon: React.ReactNode;
}> = [
  { key: "eligible", label: "Eligible", color: "green", icon: <CheckCircle2 className="w-5 h-5" /> },
  { key: "ineligible", label: "Ineligible", color: "red", icon: <XCircle className="w-5 h-5" /> },
  { key: "discrepancy", label: "Discrepancy", color: "amber", icon: <AlertTriangle className="w-5 h-5" /> },
  { key: "btz", label: "BTZ", color: "teal", icon: <Crown className="w-5 h-5" /> },
  { key: "small_unit", label: "Small Unit", color: "neutral", icon: <Users className="w-5 h-5" /> },
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

  return (
    <Card>
      <CardBody className="pt-6">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Roster Review - {data.cycle ?? "—"} {data.year ?? ""}
            </h2>
            <p className="text-sm text-slate-500">
              Session: {sessionData.session_id}
            </p>
          </div>
          {showLogo ? (
            <div className="flex flex-col items-end gap-3">
              {data.custom_logo?.uploaded ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold">Logo:</span>{" "}
                    {data.custom_logo.filename}
                  </span>
                </div>
              ) : null}
              <Button
                variant="primary"
                size="md"
                leftIcon={<UploadIcon className="w-5 h-5" />}
                onClick={() => setLogoOpen(true)}
                className="bg-success hover:bg-success-dark text-white border-success font-semibold px-6"
              >
                {data.custom_logo?.uploaded ? "Replace Image" : "Upload Logo"}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Statistics grid */}
        <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatTile
              icon={<CheckCircle2 className="w-6 h-6 text-success" />}
              bg="bg-success/20 border-success/50"
              value={stats.eligible ?? 0}
              label="Eligible"
            />
            <StatTile
              icon={<XCircle className="w-6 h-6 text-danger" />}
              bg="bg-danger/20 border-danger/50"
              value={stats.ineligible ?? 0}
              label="Ineligible"
            />
            <StatTile
              icon={<AlertTriangle className="w-6 h-6 text-warning" />}
              bg="bg-warning/20 border-warning/50"
              value={stats.discrepancy ?? 0}
              label="Discrepancy"
            />
            <StatTile
              icon={<Crown className="w-6 h-6 text-special" />}
              bg="bg-special/20 border-special/50"
              value={stats.btz ?? 0}
              label="BTZ"
            />
            <StatTile
              icon={<Users className="w-6 h-6 text-primary" />}
              bg="bg-primary/20 border-primary/50"
              value={data.categories?.small_unit?.length ?? 0}
              label="Small Unit"
            />
            <StatTile
              icon={<AlertCircle className="w-6 h-6 text-slate-500" />}
              bg="bg-slate-200 border-slate-300"
              value={stats.errors ?? 0}
              label="Errors"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="mb-4 border-b border-slate-200">
          <nav className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const count = data.categories?.[c.key]?.length ?? 0;
              const active = activeTab === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveTab(c.key)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  {c.label}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                      active ? "bg-primary text-white" : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filter row */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by name or PASCODE…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          {pasOptions.length > 1 ? (
            <select
              value={pasFilter}
              onChange={(e) => setPasFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All PASCODEs</option>
              {pasOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReprocess}
              loading={reprocessing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Re-process
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAdding(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Member
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-3 flex items-start gap-2 p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        ) : null}

        {loading && pageItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Loading roster…
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Grade</TH>
                <TH>DAFSC</TH>
                <TH>DOR</TH>
                <TH>PAS</TH>
                <TH>Status / Reason</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {pageItems.map((m, i) => (
                <TR key={m.member_id ?? `${m.FULL_NAME}-${i}`}>
                  <TD className="font-medium text-slate-900">{m.FULL_NAME}</TD>
                  <TD>{m.GRADE}</TD>
                  <TD className="font-mono text-xs">{m.DAFSC ?? "—"}</TD>
                  <TD>{formatDate(m.DOR)}</TD>
                  <TD className="font-mono text-xs">{m.ASSIGNED_PAS}</TD>
                  <TD>
                    <Badge color={badgeColor(activeTab)}>
                      {categoryToLabel(activeTab)}
                    </Badge>
                    {m.reason ? (
                      <p className="text-xs text-slate-500 mt-1">{m.reason}</p>
                    ) : null}
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(m)}
                        className="p-1 rounded text-primary hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(m)}
                        className="p-1 rounded text-danger hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
              {pageItems.length === 0 ? (
                <TR>
                  <TD className="text-center text-slate-500 py-8">
                    No members in this category.
                  </TD>
                </TR>
              ) : null}
            </TBody>
          </Table>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Page {page + 1} of {totalPages} — {filtered.length} member
              {filtered.length === 1 ? "" : "s"}
            </p>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              Per page:
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
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

        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={() => onContinue(data)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue to Force Distributor
          </Button>
        </div>
      </CardBody>

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

function StatTile({
  icon,
  bg,
  value,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={cn("p-3 rounded-full border-2", bg)}>{icon}</div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-xs font-medium text-slate-600">{label}</div>
    </div>
  );
}

function badgeColor(
  cat: CategoryKey,
): "green" | "red" | "amber" | "teal" | "neutral" {
  return (
    CATEGORIES.find((c) => c.key === cat)?.color ?? "neutral"
  );
}

function categoryToLabel(cat: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
}
