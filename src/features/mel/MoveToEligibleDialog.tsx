import { useState, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Member } from "@/types";

interface MoveToEligibleFormProps {
  member: Member;
  onCancel: () => void;
  /** Throw to keep the form open with the message. */
  onConfirm: (reason: string) => Promise<void> | void;
}

/**
 * Reviewer override for a member the filter marked ineligible / discrepancy when the
 * roster data is wrong. Opens inline under the member's row (no modal) and requires a
 * reason. Prefer fixing the data with Edit: the filter then re-checks the member
 * automatically; this is for when the data can't be fixed here.
 */
export function MoveToEligibleForm({ member, onCancel, onConfirm }: MoveToEligibleFormProps) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  const run = async () => {
    setTried(true);
    if (!reason.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
    } catch (e) {
      setError((e as Error)?.message || "Could not move member");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    }
  };

  const id = `mv-${member.member_id}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
      onKeyDown={onKey}
      noValidate
      className="ml-auto grid max-w-[860px] grid-cols-1 items-end gap-x-3 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <Input
        id={id}
        label={
          <>
            Why should {member.FULL_NAME} be eligible?{" "}
            <span className="text-[13px] font-normal text-ink-3">Required</span>
          </>
        }
        placeholder="e.g. vMPF shows DOR 01-JAN-2024; roster is out of date"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        error={tried && !reason.trim() ? "Enter a reason for the override." : undefined}
        autoFocus
      />
      <div className="flex gap-2 sm:pb-0">
        <Button variant="tertiary" size="sm" onClick={onCancel} disabled={saving} className="h-10">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          loading={saving}
          aria-disabled={!reason.trim() || undefined}
          leftIcon={<Check />}
          className="h-10 !border-elig !text-elig hover:!bg-elig hover:!text-white"
        >
          Move to eligible
        </Button>
      </div>
      {error ? (
        <p role="alert" className="col-span-full text-[13px] text-error">
          {error}
        </p>
      ) : null}
      <p className="col-span-full text-[13px] text-ink-3">
        {member.reason ? (
          <>
            Flagged because: <span className="font-mono text-[12px]">{member.reason}</span>.{" "}
          </>
        ) : null}
        If a date, AFSC or code on the roster is wrong, use Edit instead; the member is
        re-checked automatically. The member will show an OVERRIDE badge with this reason,
        which stays through later edits and Re-process until you undo it.
      </p>
    </form>
  );
}
