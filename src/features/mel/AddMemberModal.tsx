import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types";
import { MemberFields } from "./MemberFields";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void> | void;
}


interface FormState {
  FULL_NAME: string;
  GRADE: string;
  ASSIGNED_PAS: string;
  ASSIGNED_PAS_CLEARTEXT: string;
  PAFSC: string;
  DAFSC: string;
  DOR: string;
  TAFMSD: string;
  DATE_ARRIVED_STATION: string;
  REENL_ELIG_STATUS: string;
  UIF_CODE: string;
  UIF_DISPOSITION_DATE: string;
}

const REQUIRED_KEYS: Array<keyof FormState> = [
  "FULL_NAME", "GRADE", "ASSIGNED_PAS", "ASSIGNED_PAS_CLEARTEXT", "PAFSC", "DAFSC",
  "DOR", "TAFMSD", "DATE_ARRIVED_STATION", "REENL_ELIG_STATUS",
];

const initial: FormState = {
  FULL_NAME: "",
  GRADE: "",
  ASSIGNED_PAS: "",
  ASSIGNED_PAS_CLEARTEXT: "",
  PAFSC: "",
  DAFSC: "",
  DOR: "",
  TAFMSD: "",
  DATE_ARRIVED_STATION: "",
  REENL_ELIG_STATUS: "",
  UIF_CODE: "",
  UIF_DISPOSITION_DATE: "",
};

export function AddMemberModal({ open, onClose, onSave }: AddMemberModalProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      setForm(initial);
      onClose();
    } catch (e) {
      setError((e as Error)?.message || "Add failed");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    !!form.FULL_NAME.trim() &&
    !!form.GRADE &&
    !!form.ASSIGNED_PAS.trim() &&
    !!form.ASSIGNED_PAS_CLEARTEXT.trim() &&
    !!form.PAFSC.trim() &&
    !!form.DAFSC.trim() &&
    !!form.DOR &&
    !!form.TAFMSD &&
    !!form.DATE_ARRIVED_STATION &&
    !!form.REENL_ELIG_STATUS.trim();

  const missing = REQUIRED_KEYS.filter((k) => !String(form[k] ?? "").trim()).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add member"
      description="The member is run through the same eligibility filter as the uploaded roster and placed on the right list."
      size="lg"
      footerNote={
        error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : canSubmit ? (
          "Ready to add."
        ) : (
          `${missing} required field${missing === 1 ? "" : "s"} left. Only the UIF fields are optional.`
        )
      }
      footer={
        <>
          <Button variant="tertiary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={saving}
            disabled={!canSubmit}
          >
            Add member
          </Button>
        </>
      }
    >
      <MemberFields
        idPrefix="add"
        val={(k) => form[k]}
        set={(k, v) => update(k, v)}
      />
    </Modal>
  );
}
