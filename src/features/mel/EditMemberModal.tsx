import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Tag, type TagTone } from "@/components/ui/Badge";
import { parseFlexibleDate } from "@/lib/utils";
import type { Member } from "@/types";
import { MemberFields, sectionOrderFor, type MemberFieldKey } from "./MemberFields";
import { explainReason } from "./reasons";

interface EditMemberModalProps {
  open: boolean;
  member: Member | null;
  /** Category of the row the dialog was opened from (shown as a tag). */
  category?: { key: string; label: string; tone: TagTone };
  onClose: () => void;
  onSave: (updates: Partial<Member>) => Promise<void> | void;
}

// Stored dates look like "01-JAN-2024" (or ISO). Parse them as calendar dates: the
// old `new Date(v).toISOString()` shifted the day for anyone east of UTC (e.g. bases
// in Europe / Asia), so every save moved DOR / TAFMSD back a day.
const toDateInput = (v: string | null | undefined): string => {
  if (!v) return "";
  return parseFlexibleDate(String(v)) ?? "";
};

export function EditMemberModal({
  open,
  member,
  category,
  onClose,
  onSave,
}: EditMemberModalProps) {
  const [form, setForm] = useState<Partial<Member>>({});
  const [initial, setInitial] = useState<Partial<Member>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (!member) {
      setForm({});
      setInitial({});
      return;
    }
    const next: Partial<Member> = {
      FULL_NAME: member.FULL_NAME ?? "",
      GRADE: member.GRADE ?? "",
      ASSIGNED_PAS: member.ASSIGNED_PAS ?? "",
      ASSIGNED_PAS_CLEARTEXT: member.ASSIGNED_PAS_CLEARTEXT ?? "",
      PAFSC: member.PAFSC ?? "",
      DAFSC: member.DAFSC ?? "",
      DOR: toDateInput(member.DOR),
      TAFMSD: toDateInput(member.TAFMSD),
      DATE_ARRIVED_STATION: toDateInput(member.DATE_ARRIVED_STATION),
      REENL_ELIG_STATUS: member.REENL_ELIG_STATUS ?? "",
      UIF_CODE: member.UIF_CODE == null ? "" : String(member.UIF_CODE),
      UIF_DISPOSITION_DATE: toDateInput(member.UIF_DISPOSITION_DATE),
    };
    setForm(next);
    setInitial(next);
  }, [member]);

  const update = (k: keyof Member, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const val = (k: keyof Member): string =>
    (form[k] as string | undefined) ?? "";

  const isEdited = (k: MemberFieldKey) =>
    ((form[k] as string | undefined) ?? "") !== ((initial[k] as string | undefined) ?? "");
  const editedCount = (Object.keys(initial) as MemberFieldKey[]).filter(isEdited).length;

  const flagged =
    !!member?.reason && (category?.key === "ineligible" || category?.key === "discrepancy");
  const order = useMemo(
    () => sectionOrderFor(flagged ? member?.reason : null),
    [flagged, member?.reason],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit member"
      meta={
        member ? (
          <>
            <b className="font-semibold text-ink">{member.FULL_NAME}</b>
            {member.ASSIGNED_PAS ? <span className="code">{member.ASSIGNED_PAS}</span> : null}
            {category ? <Tag tone={category.tone}>{category.label}</Tag> : null}
          </>
        ) : null
      }
      size="lg"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          submit();
        }
      }}
      footerNote={
        error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : (
          <span>
            {editedCount === 1 ? "1 field edited" : `${editedCount} fields edited`} &middot;{" "}
            <kbd>Esc</kbd> cancels &middot; <kbd>Ctrl</kbd>+<kbd>Enter</kbd> saves
          </span>
        )
      }
      footer={
        <>
          <Button variant="tertiary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            Save and re-check
          </Button>
        </>
      }
    >
      {flagged ? (
        <div className="msg msg-warn mb-1.5">
          <b>Why it's flagged:</b> {explainReason(member!.reason)}.{" "}
          <span className="font-mono text-[12px] text-ink-3">{member!.reason}</span>
          <br />
          Correct it below; PACE re-checks this member when you save and moves them to the
          right list automatically.
        </div>
      ) : (
        <p className="mb-1.5 text-sm text-ink-3">
          Saving re-checks this member against the eligibility filter; they move to the right
          list automatically.
        </p>
      )}
      <MemberFields
        idPrefix="edit"
        val={(k) => val(k)}
        set={(k, v) => update(k, v)}
        edited={isEdited}
        order={order}
      />
    </Modal>
  );
}
