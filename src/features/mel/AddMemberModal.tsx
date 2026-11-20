import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import type { Member } from "@/types";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void> | void;
}

const MEMBER_GRADES = [
  { value: "AB", label: "AB – Airman Basic" },
  { value: "AMN", label: "AMN – Airman" },
  { value: "A1C", label: "A1C – Airman First Class" },
  { value: "SRA", label: "SRA – Senior Airman" },
  { value: "SSG", label: "SSG – Staff Sergeant" },
  { value: "TSG", label: "TSG – Technical Sergeant" },
  { value: "MSG", label: "MSG – Master Sergeant" },
  { value: "SMS", label: "SMS – Senior Master Sergeant" },
  { value: "CMS", label: "CMS – Chief Master Sergeant" },
];

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

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setForm(initial);
      onClose();
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Member"
      description="New member will be added to the roster and processed for eligibility."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={saving}
            disabled={!canSubmit}
          >
            Add Member
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="LAST, FIRST M."
              value={form.FULL_NAME}
              onChange={(e) => update("FULL_NAME", e.target.value)}
            />
            <Select
              label="Grade *"
              value={form.GRADE}
              onChange={(e) => update("GRADE", e.target.value)}
            >
              <option value="">Select grade…</option>
              {MEMBER_GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </div>
        </Section>

        <Section title="Assignment">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned PAS *"
              placeholder="e.g., HAAC6L00"
              value={form.ASSIGNED_PAS}
              onChange={(e) => update("ASSIGNED_PAS", e.target.value)}
            />
            <Input
              label="Unit Name (ASSIGNED_PAS_CLEARTEXT) *"
              placeholder="e.g., 1st Information Systems Sq"
              value={form.ASSIGNED_PAS_CLEARTEXT}
              onChange={(e) =>
                update("ASSIGNED_PAS_CLEARTEXT", e.target.value)
              }
            />
            <SmartDateInput
              label="Date Arrived Station *"
              value={form.DATE_ARRIVED_STATION}
              onChange={(v) => update("DATE_ARRIVED_STATION", v)}
            />
          </div>
        </Section>

        <Section title="AFSC">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="PAFSC *"
              placeholder="e.g., 3F0X1"
              value={form.PAFSC}
              onChange={(e) => update("PAFSC", e.target.value)}
              hint="Primary AFSC"
            />
            <Input
              label="DAFSC *"
              placeholder="e.g., 3F0X1"
              value={form.DAFSC}
              onChange={(e) => update("DAFSC", e.target.value)}
              hint="Duty AFSC"
            />
          </div>
        </Section>

        <Section title="Time in Grade / Service">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmartDateInput
              label="Date of Rank (DOR) *"
              value={form.DOR}
              onChange={(v) => update("DOR", v)}
            />
            <SmartDateInput
              label="TAFMSD *"
              value={form.TAFMSD}
              onChange={(v) => update("TAFMSD", v)}
              hint="Total Active Federal Military Service Date"
            />
          </div>
        </Section>

        <Section title="Reenlistment & UIF">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="RE Code *"
              placeholder="e.g., 1A"
              value={form.REENL_ELIG_STATUS}
              onChange={(e) => update("REENL_ELIG_STATUS", e.target.value)}
            />
            <Input
              label="UIF Code"
              value={form.UIF_CODE}
              onChange={(e) => update("UIF_CODE", e.target.value)}
            />
            <SmartDateInput
              label="UIF Disposition Date"
              value={form.UIF_DISPOSITION_DATE}
              onChange={(v) => update("UIF_DISPOSITION_DATE", v)}
            />
          </div>
        </Section>
      </div>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2.5">{title}</legend>
      {children}
    </fieldset>
  );
}
