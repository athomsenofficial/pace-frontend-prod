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

const INDENT_CLASSES = ["", "ml-6", "ml-12"];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "rgba(47,84,150,0.1)" }}
          >
            <FileText className="w-6 h-6" style={{ color: "#2F5496" }} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Memorandum Generator
          </h2>
          <Badge color="navy">AFH 33-337</Badge>
        </div>
        <p className="text-slate-500 text-sm">
          Generates a properly formatted USAF Memorandum per The Tongue and Quill
          Chapter 14 — official letterhead, floating Dept seal, T&amp;Q paragraph
          numbering, right-indented signature block.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Address Line 2 — City / State / ZIP{" "}
                  <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <Input
                      placeholder="City"
                      value={form.address_city}
                      onChange={(e) => setField("address_city", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={form.address_state}
                      onChange={(e) =>
                        setField("address_state", e.target.value)
                      }
                      options={STATE_OPTIONS}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      placeholder="ZIP"
                      value={form.address_zip}
                      onChange={(e) => setField("address_zip", e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Formats as "CITY STATE ZIP" per T&amp;Q — e.g., LANGLEY AFB VA
                  23665
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <div className="pt-2 text-xs font-bold text-slate-400 w-7 shrink-0 text-right">
                    {labels[i] || ""}
                  </div>
                  <div className="flex-1 space-y-1">
                    <textarea
                      className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-slate-400"
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
                      className="text-xs rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40"
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
                      onClick={() => removeParagraph(i)}
                      className="mt-2 p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-red-50 transition-colors"
                      title="Remove paragraph"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <button
                  onClick={() => addParagraph(0)}
                  className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add paragraph
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => addParagraph(1)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" /> Add sub-paragraph
                </button>
                <button
                  onClick={() => addParagraph(2)}
                  className="flex items-center gap-1.5 text-sm text-slate-400 font-medium hover:text-slate-600 transition-colors"
                >
                  <CornerDownRight className="w-4 h-4" /> Add sub-sub
                </button>
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
                  <span className="text-xs font-bold text-slate-400 w-6 shrink-0 text-right">
                    ({String.fromCharCode(97 + i)})
                  </span>
                  <Input
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
                      onClick={() => removeReference(i)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                onClick={addReference}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-dark transition-colors mt-1"
              >
                <Plus className="w-4 h-4" /> Add reference
              </button>
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
                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-right">
                      {i + 1}.
                    </span>
                  ) : null}
                  <Input
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
                      onClick={() => removeAttachment(i)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                onClick={addAttachment}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-dark transition-colors mt-1"
              >
                <Plus className="w-4 h-4" /> Add attachment
              </button>
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
                    className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">
                        {ordinal} Ind
                      </span>
                      <button
                        onClick={() => removeEndorsement(i)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Body Paragraphs
                      </p>
                      <div className="space-y-2">
                        {e.paragraphs.map((p, pi) => (
                          <div
                            key={pi}
                            className={`flex gap-2 items-start ${INDENT_CLASSES[p.level] ?? ""}`}
                          >
                            <div className="pt-2 text-xs font-bold text-slate-400 w-7 shrink-0 text-right">
                              {eLabels[pi] || ""}
                            </div>
                            <div className="flex-1 space-y-1">
                              <textarea
                                className="w-full min-h-[64px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-slate-400"
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
                                className="text-xs rounded border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600 focus:outline-none"
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
                                onClick={() => removeEndorsementParagraph(i, pi)}
                                className="mt-2 p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <button
                            onClick={() => addEndorsementParagraph(i, 0)}
                            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary-dark transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add paragraph
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => addEndorsementParagraph(i, 1)}
                            className="flex items-center gap-1.5 text-xs text-slate-500 font-medium hover:text-slate-700 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" /> Sub-paragraph
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Signature Block
                      </p>
                      <div className="grid grid-cols-2 gap-3">
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
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Attachments for this endorsement{" "}
                        <span className="font-normal text-slate-400">
                          (optional)
                        </span>
                      </p>
                      <div className="space-y-2">
                        {e.attachments.map((a, ai) => (
                          <div key={ai} className="flex items-center gap-2">
                            {e.attachments.length > 1 ? (
                              <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-right">
                                {ai + 1}.
                              </span>
                            ) : null}
                            <Input
                              placeholder="e.g., Unit Training Report, 15 Mar 26"
                              value={a}
                              onChange={(ev) =>
                                setEndorsementAttachment(i, ai, ev.target.value)
                              }
                            />
                            {e.attachments.length > 1 ? (
                              <button
                                onClick={() =>
                                  removeEndorsementAttachment(i, ai)
                                }
                                className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-red-50 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <button
                          onClick={() => addEndorsementAttachment(i)}
                          className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary-dark transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add attachment
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={addEndorsement}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" /> Add endorsement
              </button>
            </div>
          </ToggleSection>

          {error ? (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canSubmit || submitting}
            loading={submitting}
            onClick={submit}
            leftIcon={<Download className="w-5 h-5" />}
          >
            {submitting ? "Generating Word Doc…" : "Generate & Download Word Doc"}
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Preview
            form={form}
            references={references}
            attachments={attachments}
            showReferences={showReferences}
            showAttachments={showAttachments}
          />
          <SidebarCard title="AFH 33-337 Ch. 14 Reference" tinted>
            <div className="space-y-3 text-xs text-slate-600">
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
                  className="flex justify-between items-start gap-2"
                >
                  <span className="font-semibold text-slate-700 shrink-0">
                    {kv.label}
                  </span>
                  <span className="text-right">{kv.value}</span>
                </div>
              ))}
            </div>
          </SidebarCard>
          <SidebarCard title="Tips">
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                • Name format: <strong>First MI Last</strong> (e.g., John A. Smith)
              </li>
              <li>• Single paragraph = no number; 2+ paragraphs = auto-numbered</li>
              <li>• Sub-paragraphs (a, b, c) reset under each new main paragraph</li>
              <li>• APO/FPO addresses: select AE, AP, or AA as the state</li>
              <li>• Civilians: select GS grade and DAF as branch</li>
            </ul>
          </SidebarCard>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- helper components ----------------------------- */

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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">
        {number}
      </span>
      <h3 className="font-bold text-slate-800">{title}</h3>
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.checked)
            }
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-lg font-semibold text-slate-900">{title}</span>
          <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {checked ? <div className="px-6 py-6">{children}</div> : null}
    </div>
  );
}

function SidebarCard({
  title,
  tinted,
  children,
}: {
  title: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border rounded-xl shadow-sm ${
        tinted
          ? "bg-primary/5 border-primary/30"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="border-b border-slate-200/60 px-5 py-3">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
        <FileStack className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Preview
        </span>
      </div>
      <div className="p-6 font-mono text-[10px] leading-relaxed text-slate-700 space-y-2">
        <div className="text-center space-y-0.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 mx-auto mb-1 flex items-center justify-center">
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
  );
}
