import { useMemo, useState, type ChangeEvent } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Download,
  ChevronRight,
  CornerDownRight,
  AlertCircle,
  FileStack,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { controlClasses } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Page } from "@/components/Page";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import {
  downloadBlob,
  OFFICER_RANKS,
  ENLISTED_RANKS,
  CIVILIAN_RANKS,
  US_STATES,
} from "@/lib/utils";
import type {
  DateFormat,
  MemoParagraph,
  MemoType,
  MfrEndorsement,
  MfrRequest,
} from "@/types";

/* ----------------------------- constants ----------------------------- */

const BRANCHES = [
  { value: "USAF", label: "USAF – United States Air Force" },
  { value: "ANG", label: "ANG – Air National Guard" },
  { value: "AFRC", label: "AFRC – Air Force Reserve Command" },
  { value: "DAF", label: "DAF – Dept of the Air Force (Civilian)" },
];

const DATE_FORMATS = [
  { value: "long", label: "1 January 2026  (T&Q Standard)" },
  { value: "short", label: "1 Jan 2026  (Abbreviated month)" },
];

const PARAGRAPH_LEVELS = [
  { value: "0", label: "Main paragraph  (1, 2, 3…)" },
  { value: "1", label: "Sub-paragraph  (a, b, c…)" },
  { value: "2", label: "Sub-sub-paragraph  ((1), (2)…)" },
];

const MEMO_TYPES = [
  { value: "record", label: "MEMORANDUM FOR RECORD" },
  { value: "for", label: "MEMORANDUM FOR [Recipient]" },
];

const INDENT_CLASSES = ["", "ml-4 sm:ml-6", "ml-8 sm:ml-12"];

const ALL_RANKS = [
  { group: "Officer", options: OFFICER_RANKS },
  { group: "Enlisted", options: ENLISTED_RANKS },
  { group: "Civilian", options: CIVILIAN_RANKS },
];

const STATE_OPTIONS = [{ value: "", label: "Select state…" }, ...US_STATES];

const INDORSEMENT_ORDINAL = ["1st", "2nd", "3rd", "4th", "5th"];

/* ----------------------------- paragraph numbering ----------------------------- */

function paragraphLabels(paragraphs: MemoParagraph[]): string[] {
  const numbered =
    paragraphs.filter((p) => p.text.trim()).filter((p) => p.level === 0).length >
    1;
  const counters = [0, 0, 0];
  return paragraphs.map((p) => {
    if (!p.text.trim()) return "";
    if (p.level === 0) {
      counters[0]++;
      counters[1] = 0;
      counters[2] = 0;
    } else if (p.level === 1) {
      counters[1]++;
      counters[2] = 0;
    } else if (p.level === 2) {
      counters[2]++;
    }
    if (p.level === 0 && !numbered) return "";
    if (p.level === 0) return `${counters[0]}.`;
    if (p.level === 1) return `${String.fromCharCode(96 + counters[1])}.`;
    return `(${counters[2]})`;
  });
}

/* ----------------------------- main page ----------------------------- */

interface FormState {
  organization: string;
  address_line_1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  date: string;
  date_format: DateFormat;
  office_symbol: string;
  memo_type: MemoType;
  memo_for: string;
  subject: string;
  paragraphs: MemoParagraph[];
  signer_name: string;
  signer_rank: string;
  signer_branch: string;
  signer_title: string;
}

const today = () => new Date().toISOString().split("T")[0];

const initialState: FormState = {
  organization: "",
  address_line_1: "",
  address_city: "",
  address_state: "",
  address_zip: "",
  date: today(),
  date_format: "long",
  office_symbol: "",
  memo_type: "record",
  memo_for: "",
  subject: "",
  paragraphs: [{ text: "", level: 0 }],
  signer_name: "",
  signer_rank: "",
  signer_branch: "USAF",
  signer_title: "",
};

function newEndorsement(): MfrEndorsement {
  return {
    office_symbol: "",
    date: today(),
    date_format: "long",
    paragraphs: [{ text: "", level: 0 }],
    signer_name: "",
    signer_rank: "",
    signer_branch: "USAF",
    signer_title: "",
    attachments: [""],
  };
}

export default function MemoGenerator() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showReferences, setShowReferences] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEndorsements, setShowEndorsements] = useState(false);
  const [references, setReferences] = useState<string[]>([""]);
  const [attachments, setAttachments] = useState<string[]>([""]);
  const [endorsements, setEndorsements] = useState<MfrEndorsement[]>([]);

  /* ---- form mutators ---- */

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setParagraph = (
    i: number,
    key: keyof MemoParagraph,
    value: string | number,
  ) =>
    setForm((f) => {
      const next = [...f.paragraphs];
      next[i] = { ...next[i], [key]: value } as MemoParagraph;
      return { ...f, paragraphs: next };
    });

  const addParagraph = (level: 0 | 1 | 2 = 0) =>
    setForm((f) => ({
      ...f,
      paragraphs: [...f.paragraphs, { text: "", level }],
    }));

  const removeParagraph = (i: number) =>
    setForm((f) => ({
      ...f,
      paragraphs:
        f.paragraphs.length > 1
          ? f.paragraphs.filter((_, idx) => idx !== i)
          : [{ text: "", level: 0 }],
    }));

  /* ---- references ---- */

  const setReference = (i: number, value: string) =>
    setReferences((arr) => arr.map((r, idx) => (idx === i ? value : r)));
  const addReference = () => setReferences((arr) => [...arr, ""]);
  const removeReference = (i: number) =>
    setReferences((arr) =>
      arr.length > 1 ? arr.filter((_, idx) => idx !== i) : [""],
    );

  /* ---- attachments ---- */

  const setAttachment = (i: number, value: string) =>
    setAttachments((arr) => arr.map((a, idx) => (idx === i ? value : a)));
  const addAttachment = () => setAttachments((arr) => [...arr, ""]);
  const removeAttachment = (i: number) =>
    setAttachments((arr) =>
      arr.length > 1 ? arr.filter((_, idx) => idx !== i) : [""],
    );

  /* ---- endorsements ---- */

  const addEndorsement = () =>
    setEndorsements((arr) => [...arr, newEndorsement()]);
  const removeEndorsement = (i: number) =>
    setEndorsements((arr) => arr.filter((_, idx) => idx !== i));
  const setEndorsementField = (
    i: number,
    key: keyof MfrEndorsement,
    value: unknown,
  ) =>
    setEndorsements((arr) =>
      arr.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)),
    );
  const setEndorsementParagraph = (
    ei: number,
    pi: number,
    key: keyof MemoParagraph,
    value: string | number,
  ) =>
    setEndorsements((arr) =>
      arr.map((e, idx) => {
        if (idx !== ei) return e;
        const ps = [...e.paragraphs];
        ps[pi] = { ...ps[pi], [key]: value } as MemoParagraph;
        return { ...e, paragraphs: ps };
      }),
    );
  const addEndorsementParagraph = (ei: number, level: 0 | 1 | 2 = 0) =>
    setEndorsements((arr) =>
      arr.map((e, idx) =>
        idx === ei
          ? { ...e, paragraphs: [...e.paragraphs, { text: "", level }] }
          : e,
      ),
    );
  const removeEndorsementParagraph = (ei: number, pi: number) =>
    setEndorsements((arr) =>
      arr.map((e, idx) => {
        if (idx !== ei) return e;
        return {
          ...e,
          paragraphs:
            e.paragraphs.length > 1
              ? e.paragraphs.filter((_, x) => x !== pi)
              : [{ text: "", level: 0 }],
        };
      }),
    );
  const setEndorsementAttachment = (ei: number, ai: number, value: string) =>
    setEndorsements((arr) =>
      arr.map((e, idx) => {
        if (idx !== ei) return e;
        const att = [...e.attachments];
        att[ai] = value;
        return { ...e, attachments: att };
      }),
    );
  const addEndorsementAttachment = (ei: number) =>
    setEndorsements((arr) =>
      arr.map((e, idx) =>
        idx === ei ? { ...e, attachments: [...e.attachments, ""] } : e,
      ),
    );
  const removeEndorsementAttachment = (ei: number, ai: number) =>
    setEndorsements((arr) =>
      arr.map((e, idx) => {
        if (idx !== ei) return e;
        return {
          ...e,
          attachments:
            e.attachments.length > 1
              ? e.attachments.filter((_, x) => x !== ai)
              : [""],
        };
      }),
    );

  /* ---- validation ---- */

  const canSubmit =
    form.organization &&
    form.address_line_1 &&
    form.address_city &&
    form.address_state &&
    form.address_zip &&
    form.date &&
    form.office_symbol &&
    form.subject &&
    form.paragraphs.some((p) => p.text.trim()) &&
    form.signer_name &&
    form.signer_rank &&
    form.signer_title &&
    (form.memo_type === "record" || form.memo_for.trim());

  /* ---- submit ---- */

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const addressLine2 = [form.address_city, form.address_state, form.address_zip]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();
      const payload: MfrRequest = {
        organization: form.organization,
        address_line_1: form.address_line_1,
        address_line_2: addressLine2,
        date: form.date,
        date_format: form.date_format,
        office_symbol: form.office_symbol,
        memo_for: form.memo_type === "for" ? form.memo_for : "",
        subject: form.subject,
        paragraphs: form.paragraphs.filter((p) => p.text.trim()),
        signer_name: form.signer_name,
        signer_rank: form.signer_rank,
        signer_branch: form.signer_branch,
        signer_title: form.signer_title,
        references: showReferences ? references.filter((r) => r.trim()) : [],
        attachments: showAttachments ? attachments.filter((a) => a.trim()) : [],
        endorsements: showEndorsements
          ? endorsements.map((e) => ({
              office_symbol: e.office_symbol,
              date: e.date,
              date_format: e.date_format,
              paragraphs: e.paragraphs.filter((p) => p.text.trim()),
              signer_name: e.signer_name,
              signer_rank: e.signer_rank,
              signer_branch: e.signer_branch,
              signer_title: e.signer_title,
              attachments: e.attachments.filter((a) => a.trim()),
            }))
          : [],
      };
      const res = await apiClient.post("/api/generate/mfr", payload, {
        responseType: "blob",
      });
      const safeSubject = form.subject
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .substring(0, 40);
      downloadBlob(res.data, `MFR_${safeSubject}_${form.date}.docx`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: Blob }; message?: string };
      let msg = err?.message || "Generation failed";
      if (err?.response?.data instanceof Blob) {
        try {
          msg = await err.response.data.text();
        } catch {
          // keep default
        }
      }
      setError(typeof msg === "string" ? msg : "Generation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const labels = useMemo(() => paragraphLabels(form.paragraphs), [form.paragraphs]);

  /* ---- render ---- */

  return (
    <Page>
      <PageHeader
        eyebrow="Documents"
        icon={<FileText />}
        title="Memorandum generator"
        badge={<Badge color="navy">AFH 33-337</Badge>}
        description="Generates a properly formatted USAF Memorandum per The Tongue and Quill Chapter 14 — official letterhead, floating Dept seal, T&Q paragraph numbering, right-indented signature block."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Letterhead */}
          <SectionCard
            title="Letterhead"
            description="Centered in the document header — appears below the Dept of War seal"
          >
            <StepHeader number={1} title="Organization & Address" />
            <div className="space-y-4">
              <Input
                label="Organization / Unit Name *"
                placeholder="e.g., 1st Information Operations Squadron"
                value={form.organization}
                onChange={(e) => setField("organization", e.target.value)}
                hint="Centered in the letterhead below 'DEPARTMENT OF THE AIR FORCE'"
              />
              <Input
                label="Address Line 1 — Street / Unit *"
                placeholder="e.g., 123 E Street NW, Suite 1000"
                value={form.address_line_1}
                onChange={(e) => setField("address_line_1", e.target.value)}
                hint="Unit street address or box number"
              />
              <div>
                <p className="mb-1.5 text-[13px] font-medium leading-5 text-fg">
                  Address Line 2 — City / State / ZIP *
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  <div className="col-span-3 sm:col-span-2">
                    <Input
                      aria-label="City"
                      placeholder="City"
                      value={form.address_city}
                      onChange={(e) => setField("address_city", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      aria-label="State"
                      value={form.address_state}
                      onChange={(e) =>
                        setField("address_state", e.target.value)
                      }
                      options={STATE_OPTIONS}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      aria-label="ZIP code"
                      inputMode="numeric"
                      placeholder="ZIP"
                      value={form.address_zip}
                      onChange={(e) => setField("address_zip", e.target.value)}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-fg-subtle">
                  Formats as "CITY STATE ZIP" per T&amp;Q — e.g., LANGLEY AFB VA
                  23665
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Date *"
                  type="date"
                  value={form.date}
                  onChange={(e) => setField("date", e.target.value)}
                />
                <Select
                  label="Date Format (T&Q Ch. 14)"
                  value={form.date_format}
                  onChange={(e) =>
                    setField("date_format", e.target.value as DateFormat)
                  }
                  options={DATE_FORMATS}
                />
              </div>
            </div>
          </SectionCard>

          {/* Addressing */}
          <SectionCard
            title="Addressing"
            description="FROM, title line, and SUBJECT"
          >
            <StepHeader number={2} title="FROM, Title & Subject" />
            <div className="space-y-4">
              <Input
                label="FROM (Office Symbol) *"
                placeholder="e.g., 1 ISS/CC"
                value={form.office_symbol}
                onChange={(e) => setField("office_symbol", e.target.value)}
                hint="Appears on the FROM: line"
              />
              <Select
                label="Memorandum Title"
                value={form.memo_type}
                onChange={(e) =>
                  setField("memo_type", e.target.value as MemoType)
                }
                options={MEMO_TYPES}
              />
              {form.memo_type === "for" ? (
                <Input
                  label="MEMORANDUM FOR (Recipient) *"
                  placeholder="e.g., ALL ASSIGNED PERSONNEL"
                  value={form.memo_for}
                  onChange={(e) => setField("memo_for", e.target.value)}
                  hint="Appears on the MEMORANDUM FOR line"
                />
              ) : null}
              <Input
                label="SUBJECT *"
                placeholder="Brief, specific subject line"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
                hint="Keep concise — 10 words or fewer per T&Q"
              />
            </div>
          </SectionCard>

          {/* Body Paragraphs */}
          <SectionCard
            title="Body Paragraphs"
            description="T&Q Ch. 14: numbered 1, 2, 3 when multiple; sub-paragraphs a, b, c; sub-sub (1), (2)"
          >
            <StepHeader number={3} title="Paragraph Text & Levels" />
            <div className="space-y-3">
              {form.paragraphs.map((p, i) => (
                <div
                  key={i}
                  className={`flex gap-2 items-start ${INDENT_CLASSES[p.level] ?? ""}`}
                >
                  <div className="w-7 shrink-0 pt-2 text-right text-xs font-semibold tabular-nums text-fg-subtle">
                    {labels[i] || ""}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <textarea
                      aria-label={`Paragraph ${i + 1} text`}
                      className={cn(controlClasses, "min-h-[80px] resize-y py-2 leading-6")}
                      placeholder={
                        p.level === 0
                          ? i === 0
                            ? "State the purpose of this memorandum…"
                            : "Additional paragraph text…"
                          : p.level === 1
                          ? "Sub-paragraph text (a, b, c)…"
                          : "Sub-sub-paragraph text ((1), (2))…"
                      }
                      value={p.text}
                      onChange={(e) => setParagraph(i, "text", e.target.value)}
                    />
                    <select
                      className={LEVEL_SELECT}
                      value={String(p.level)}
                      onChange={(e) =>
                        setParagraph(i, "level", Number(e.target.value))
                      }
                      title="Paragraph level"
                    >
                      {PARAGRAPH_LEVELS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.paragraphs.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeParagraph(i)}
                      className={cn(REMOVE_BTN, "mt-1.5")}
                      title="Remove paragraph"
                      aria-label={`Remove paragraph ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addParagraph(0)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add paragraph
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addParagraph(1)}
                  leftIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Add sub-paragraph
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addParagraph(2)}
                  leftIcon={<CornerDownRight className="h-4 w-4" />}
                >
                  Add sub-sub
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Signature Block */}
          <SectionCard
            title="Signature Block"
            description={'Right-indented at 3.5" per T&Q — appears 4 blank lines below last paragraph'}
          >
            <StepHeader number={4} title="Signer Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g., John A. Smith"
                value={form.signer_name}
                onChange={(e) => setField("signer_name", e.target.value)}
                hint="T&Q format: First MI Last — auto-uppercased in doc"
              />
              <Select
                label="Rank / Grade *"
                value={form.signer_rank}
                onChange={(e) => setField("signer_rank", e.target.value)}
              >
                <option value="">Select rank…</option>
                {ALL_RANKS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              <Select
                label="Branch / Component"
                value={form.signer_branch}
                onChange={(e) => setField("signer_branch", e.target.value)}
                options={BRANCHES}
              />
              <Input
                label="Title / Position *"
                placeholder="e.g., Commander"
                value={form.signer_title}
                onChange={(e) => setField("signer_title", e.target.value)}
              />
            </div>
          </SectionCard>

          {/* References */}
          <ToggleSection
            checked={showReferences}
            onChange={setShowReferences}
            title="References"
            description="T&Q Ch. 14: lettered (a), (b), (c)… list placed below SUBJECT line"
          >
            <StepHeader number={5} title="Reference List" />
            <div className="space-y-2">
              {references.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 shrink-0 text-right text-xs font-semibold text-fg-subtle">
                    ({String.fromCharCode(97 + i)})
                  </span>
                  <Input
                    aria-label={`Reference ${String.fromCharCode(97 + i)}`}
                    placeholder={
                      i === 0
                        ? "e.g., AFMAN 33-326, 25 November 2011, Preparing Official Communications"
                        : "e.g., SAF/CIO A6 Memo, 12 October 2011, Air Force Guidance Memorandum…"
                    }
                    value={r}
                    onChange={(e) => setReference(i, e.target.value)}
                  />
                  {references.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeReference(i)}
                      className={REMOVE_BTN}
                      aria-label={`Remove reference ${String.fromCharCode(97 + i)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addReference}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add reference
              </Button>
            </div>
          </ToggleSection>

          {/* Attachments */}
          <ToggleSection
            checked={showAttachments}
            onChange={setShowAttachments}
            title="Attachments"
            description={'T&Q Ch. 14: "Attachment:" / "N Attachments:" placed 3 lines below signature'}
          >
            <StepHeader number={6} title="Attachment List" />
            <div className="space-y-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  {attachments.length > 1 ? (
                    <span className="w-5 shrink-0 text-right text-xs font-semibold text-fg-subtle">
                      {i + 1}.
                    </span>
                  ) : null}
                  <Input
                    aria-label={`Attachment ${i + 1}`}
                    placeholder={
                      i === 0
                        ? "e.g., ACC/CC Leave Policy Memo, 30 Jun 14"
                        : "e.g., 380 FMS/CC Msg, 232300Z May 12 (NOTAL)"
                    }
                    value={a}
                    onChange={(e) => setAttachment(i, e.target.value)}
                  />
                  {attachments.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className={REMOVE_BTN}
                      aria-label={`Remove attachment ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addAttachment}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add attachment
              </Button>
            </div>
          </ToggleSection>

          {/* Endorsements */}
          <ToggleSection
            checked={showEndorsements}
            onChange={(checked) => {
              setShowEndorsements(checked);
              if (checked && endorsements.length === 0) addEndorsement();
            }}
            title="Endorsements (Indorsements)"
            description={'T&Q Ch. 14: numbered "1st Ind, OFFICE  Date" blocks — each with own sig block'}
          >
            <StepHeader number={7} title="Indorsement Blocks" />
            <div className="space-y-6">
              {endorsements.map((e, i) => {
                const ordinal = INDORSEMENT_ORDINAL[i] ?? `${i + 1}th`;
                const eLabels = paragraphLabels(e.paragraphs);
                return (
                  <div
                    key={i}
                    className="space-y-4 rounded-lg border border-line bg-surface-muted p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-fg">
                        {ordinal} Ind
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEndorsement(i)}
                        className={REMOVE_BTN}
                        aria-label={`Remove ${ordinal} Ind`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Office Symbol"
                        placeholder="e.g., 1 FW/CC"
                        value={e.office_symbol}
                        onChange={(ev) =>
                          setEndorsementField(i, "office_symbol", ev.target.value)
                        }
                      />
                      <Input
                        label="Date"
                        type="date"
                        value={e.date}
                        onChange={(ev) =>
                          setEndorsementField(i, "date", ev.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className="eyebrow mb-2">Body paragraphs</p>
                      <div className="space-y-2">
                        {e.paragraphs.map((p, pi) => (
                          <div
                            key={pi}
                            className={`flex gap-2 items-start ${INDENT_CLASSES[p.level] ?? ""}`}
                          >
                            <div className="w-7 shrink-0 pt-2 text-right text-xs font-semibold tabular-nums text-fg-subtle">
                              {eLabels[pi] || ""}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <textarea
                                aria-label={`${ordinal} Ind paragraph ${pi + 1} text`}
                                className={cn(controlClasses, "min-h-[64px] resize-y py-2 leading-6")}
                                placeholder="Endorsement paragraph text…"
                                value={p.text}
                                onChange={(ev) =>
                                  setEndorsementParagraph(
                                    i,
                                    pi,
                                    "text",
                                    ev.target.value,
                                  )
                                }
                              />
                              <select
                                className={LEVEL_SELECT}
                                value={String(p.level)}
                                onChange={(ev) =>
                                  setEndorsementParagraph(
                                    i,
                                    pi,
                                    "level",
                                    Number(ev.target.value),
                                  )
                                }
                              >
                                {PARAGRAPH_LEVELS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {e.paragraphs.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeEndorsementParagraph(i, pi)}
                                className={cn(REMOVE_BTN, "mt-1.5")}
                                aria-label={`Remove paragraph ${pi + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => addEndorsementParagraph(i, 0)}
                            leftIcon={<Plus className="h-4 w-4" />}
                          >
                            Add paragraph
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addEndorsementParagraph(i, 1)}
                            leftIcon={<ChevronRight className="h-4 w-4" />}
                          >
                            Sub-paragraph
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="eyebrow mb-2">Signature block</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                          label="Full Name"
                          placeholder="e.g., Jane B. Doe"
                          value={e.signer_name}
                          onChange={(ev) =>
                            setEndorsementField(
                              i,
                              "signer_name",
                              ev.target.value,
                            )
                          }
                        />
                        <Select
                          label="Rank / Grade"
                          value={e.signer_rank}
                          onChange={(ev) =>
                            setEndorsementField(
                              i,
                              "signer_rank",
                              ev.target.value,
                            )
                          }
                        >
                          <option value="">Select rank…</option>
                          {ALL_RANKS.map((g) => (
                            <optgroup key={g.group} label={g.group}>
                              {g.options.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </Select>
                        <Select
                          label="Branch"
                          value={e.signer_branch}
                          onChange={(ev) =>
                            setEndorsementField(
                              i,
                              "signer_branch",
                              ev.target.value,
                            )
                          }
                          options={BRANCHES}
                        />
                        <Input
                          label="Title / Position"
                          placeholder="e.g., Commander"
                          value={e.signer_title}
                          onChange={(ev) =>
                            setEndorsementField(
                              i,
                              "signer_title",
                              ev.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <p className="eyebrow mb-2">
                        Attachments for this endorsement{" "}
                        <span className="font-normal normal-case tracking-normal">
                          (optional)
                        </span>
                      </p>
                      <div className="space-y-2">
                        {e.attachments.map((a, ai) => (
                          <div key={ai} className="flex items-center gap-2">
                            {e.attachments.length > 1 ? (
                              <span className="w-5 shrink-0 text-right text-xs font-semibold text-fg-subtle">
                                {ai + 1}.
                              </span>
                            ) : null}
                            <Input
                              aria-label={`${ordinal} Ind attachment ${ai + 1}`}
                              placeholder="e.g., Unit Training Report, 15 Mar 26"
                              value={a}
                              onChange={(ev) =>
                                setEndorsementAttachment(i, ai, ev.target.value)
                              }
                            />
                            {e.attachments.length > 1 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  removeEndorsementAttachment(i, ai)
                                }
                                className={REMOVE_BTN}
                                aria-label={`Remove attachment ${ai + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addEndorsementAttachment(i)}
                          leftIcon={<Plus className="h-4 w-4" />}
                        >
                          Add attachment
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button
                variant="secondary"
                size="sm"
                onClick={addEndorsement}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add endorsement
              </Button>
            </div>
          </ToggleSection>

          {error ? (
            <Alert tone="danger" title="Couldn't generate the memorandum" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          <Card className="sticky bottom-0 z-10 shadow-raised lg:static lg:shadow-card">
            <CardBody className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-fg-muted">
                {canSubmit ? (
                  "Ready — generates a Word document (.docx)."
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                    Complete the required (*) fields to generate.
                  </>
                )}
              </p>
              <Button
                size="lg"
                disabled={!canSubmit || submitting}
                loading={submitting}
                onClick={submit}
                leftIcon={<Download className="h-4 w-4" />}
              >
                {submitting ? "Generating Word Doc…" : "Generate & Download Word Doc"}
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <Preview
            form={form}
            references={references}
            attachments={attachments}
            showReferences={showReferences}
            showAttachments={showAttachments}
          />
          <SidebarCard title="AFH 33-337 Ch. 14 reference">
            <dl className="divide-y divide-line text-xs">
              {[
                { label: "Font", value: "12pt Times New Roman" },
                { label: "Margins", value: "1 inch all sides" },
                { label: "Date", value: '1.75" from top, right-aligned' },
                { label: "Date fmt", value: "Day Month Year (long or abbrev.)" },
                { label: "Para nums", value: "1, 2, 3 → a, b, c → (1), (2)" },
                { label: "Signature", value: "NAME, Rank, Branch" },
                { label: "Sig gap", value: "4 blank lines before signer" },
                { label: "Sig indent", value: '3.5" from left margin' },
              ].map((kv) => (
                <div
                  key={kv.label}
                  className="flex items-start justify-between gap-3 py-1.5"
                >
                  <dt className="shrink-0 font-medium text-fg">{kv.label}</dt>
                  <dd className="text-right text-fg-muted">{kv.value}</dd>
                </div>
              ))}
            </dl>
          </SidebarCard>
          <SidebarCard title="Tips">
            <ul className="list-disc space-y-1.5 pl-4 text-xs leading-5 text-fg-muted marker:text-fg-subtle">
              <li>
                Name format: <strong className="text-fg">First MI Last</strong> (e.g., John A. Smith)
              </li>
              <li>Single paragraph = no number; 2+ paragraphs = auto-numbered</li>
              <li>Sub-paragraphs (a, b, c) reset under each new main paragraph</li>
              <li>APO/FPO addresses: select AE, AP, or AA as the state</li>
              <li>Civilians: select GS grade and DAF as branch</li>
            </ul>
          </SidebarCard>
        </div>
      </div>
    </Page>
  );
}

/* ----------------------------- helper components ----------------------------- */

const LEVEL_SELECT =
  "h-7 rounded-md border border-line-strong/50 bg-surface-muted px-2 text-xs text-fg-muted hover:border-line-strong focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25";

const REMOVE_BTN =
  "shrink-0 rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="py-5">{children}</CardBody>
    </Card>
  );
}

function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-fg">
        {number}
      </span>
      <h4 className="text-sm font-semibold text-fg">{title}</h4>
    </div>
  );
}

function ToggleSection({
  checked,
  onChange,
  title,
  description,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className={cn("px-4 py-3.5 sm:px-5", checked && "border-b border-line")}>
        <label className="flex cursor-pointer select-none items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.checked)
            }
            className="mt-1 h-4 w-4 shrink-0 rounded border-line-strong accent-[rgb(var(--primary))]"
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[15px] font-semibold text-fg">{title}</span>
              <span className="text-xs text-fg-subtle">Optional</span>
            </span>
            <span className="mt-0.5 block text-[13px] leading-5 text-fg-muted">
              {description}
            </span>
          </span>
        </label>
      </div>
      {checked ? <CardBody className="py-5">{children}</CardBody> : null}
    </Card>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="py-3" title={<span className="text-sm">{title}</span>} />
      <CardBody className="py-3">{children}</CardBody>
    </Card>
  );
}

/* ----------------------------- preview ----------------------------- */

function Preview({
  form,
  references,
  attachments,
  showReferences,
  showAttachments,
}: {
  form: FormState;
  references: string[];
  attachments: string[];
  showReferences: boolean;
  showAttachments: boolean;
}) {
  const dateStr = form.date
    ? new Date(form.date + "T12:00:00").toLocaleDateString("en-US", {
        day: "numeric",
        month: form.date_format === "short" ? "short" : "long",
        year: "numeric",
      })
    : "__ ___ ____";
  const memoForLine =
    form.memo_type === "for" && form.memo_for
      ? `MEMORANDUM FOR  ${form.memo_for.toUpperCase()}`
      : "MEMORANDUM FOR  RECORD";
  const addressLine2 = [form.address_city, form.address_state, form.address_zip]
    .filter(Boolean)
    .join(" ");
  const signerLine = [
    form.signer_name?.toUpperCase(),
    form.signer_rank,
    form.signer_branch,
  ]
    .filter(Boolean)
    .join(", ");
  const labels = paragraphLabels(form.paragraphs);
  const refs = showReferences ? references.filter((r) => r.trim()) : [];
  const atts = showAttachments ? attachments.filter((a) => a.trim()) : [];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line bg-surface-muted px-4 py-2.5">
        <FileStack className="h-4 w-4 text-fg-subtle" aria-hidden="true" />
        <span className="eyebrow">Live preview</span>
      </div>
      <div className="bg-surface-hover p-3">
      <div className="space-y-2 rounded-sm bg-white p-5 font-serif text-[10px] leading-relaxed text-slate-800 shadow-card ring-1 ring-slate-900/5">
        <div className="text-center space-y-0.5">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
            <span className="text-slate-400 text-[8px] font-bold">SEAL</span>
          </div>
          <p className="font-bold text-[10px]">DEPARTMENT OF THE AIR FORCE</p>
          {form.organization ? <p>{form.organization}</p> : null}
          {form.address_line_1 ? <p>{form.address_line_1}</p> : null}
          {addressLine2 ? <p>{addressLine2.toUpperCase()}</p> : null}
        </div>
        <div className="text-right text-[9px]">{dateStr}</div>
        <div className="border-t border-slate-300 my-1" />
        <p className="font-bold text-[10px]">{memoForLine}</p>
        <div className="space-y-0.5 mt-1">
          {form.office_symbol ? (
            <p>
              <strong>FROM:</strong> {form.office_symbol}
            </p>
          ) : null}
          {form.subject ? (
            <p>
              <strong>SUBJECT:</strong> {form.subject}
            </p>
          ) : null}
        </div>
        {refs.length ? (
          <div className="mt-2">
            <p className="font-bold">References:</p>
            {refs.map((r, i) => (
              <p key={i} className="pl-3">
                ({String.fromCharCode(97 + i)}) {r}
              </p>
            ))}
          </div>
        ) : null}
        <div className="space-y-1 mt-2">
          {form.paragraphs.map((p, i) =>
            p.text.trim() ? (
              <p
                key={i}
                className={INDENT_CLASSES[p.level] ?? ""}
              >
                {labels[i] ? <strong>{labels[i]} </strong> : null}
                {p.text}
              </p>
            ) : null,
          )}
        </div>
        <div className="text-right mt-6">
          <p className="font-bold">{signerLine || "NAME, Rank, Branch"}</p>
          {form.signer_title ? <p>{form.signer_title}</p> : null}
        </div>
        {atts.length ? (
          <div className="mt-3">
            <p className="font-bold">
              {atts.length === 1 ? "Attachment:" : `${atts.length} Attachments:`}
            </p>
            {atts.map((a, i) => (
              <p key={i} className="pl-3">
                {i + 1}. {a}
              </p>
            ))}
          </div>
        ) : null}
      </div>
      </div>
    </Card>
  );
}
