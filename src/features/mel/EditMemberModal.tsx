import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import type { Member } from "@/types";

interface EditMemberModalProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (updates: Partial<Member>) => Promise<void> | void;
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

const toDateInput = (v: string | null | undefined): string => {
  if (!v) return "";
  // If already YYYY-MM-DD, return as-is
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  // Try parsing other formats
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export function EditMemberModal({
  open,
  member,
  onClose,
  onSave,
}: EditMemberModalProps) {
  const [form, setForm] = useState<Partial<Member>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!member) {
      setForm({});
      return;
    }
    setForm({
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
      UIF_CODE: member.UIF_CODE ?? "",
      UIF_DISPOSITION_DATE: toDateInput(member.UIF_DISPOSITION_DATE),
    });
  }, [member]);

  const update = (k: keyof Member, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const val = (k: keyof Member): string =>
    (form[k] as string | undefined) ?? "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Member"
      description="Changes will trigger eligibility re-processing."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="LAST, FIRST M."
              value={val("FULL_NAME")}
              onChange={(e) => update("FULL_NAME", e.target.value)}
            />
            <Select
              label="Grade"
              value={val("GRADE")}
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
              label="Assigned PAS"
              placeholder="e.g., HAAC6L00"
              value={val("ASSIGNED_PAS")}
              onChange={(e) => update("ASSIGNED_PAS", e.target.value)}
            />
            <Input
              label="Unit Name (ASSIGNED_PAS_CLEARTEXT)"
              placeholder="e.g., 1st Information Systems Sq"
              value={val("ASSIGNED_PAS_CLEARTEXT")}
              onChange={(e) => update("ASSIGNED_PAS_CLEARTEXT", e.target.value)}
            />
            <SmartDateInput
              label="Date Arrived Station"
              value={val("DATE_ARRIVED_STATION")}
              onChange={(v) => update("DATE_ARRIVED_STATION", v)}
            />
          </div>
        </Section>

        <Section title="AFSC">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="PAFSC"
              placeholder="e.g., 3F0X1"
              value={val("PAFSC")}
              onChange={(e) => update("PAFSC", e.target.value)}
              hint="Primary AFSC"
            />
            <Input
              label="DAFSC"
              placeholder="e.g., 3F0X1"
              value={val("DAFSC")}
              onChange={(e) => update("DAFSC", e.target.value)}
              hint="Duty AFSC"
            />
          </div>
        </Section>

        <Section title="Time in Grade / Service">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmartDateInput
              label="Date of Rank (DOR)"
              value={val("DOR")}
              onChange={(v) => update("DOR", v)}
            />
            <SmartDateInput
              label="TAFMSD"
              value={val("TAFMSD")}
              onChange={(v) => update("TAFMSD", v)}
              hint="Total Active Federal Military Service Date"
            />
          </div>
        </Section>

        <Section title="Reenlistment & UIF">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="RE Code"
              placeholder="e.g., 1A"
              value={val("REENL_ELIG_STATUS")}
              onChange={(e) => update("REENL_ELIG_STATUS", e.target.value)}
            />
            <Input
              label="UIF Code"
              value={val("UIF_CODE")}
              onChange={(e) => update("UIF_CODE", e.target.value)}
            />
            <SmartDateInput
              label="UIF Disposition Date"
              value={val("UIF_DISPOSITION_DATE")}
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
