import { Select } from "pace-frontend-test";

const cycles = [
  { value: "SRA", label: "Senior Airman (SRA)" },
  { value: "SSG", label: "Staff Sergeant (SSG)" },
  { value: "TSG", label: "Technical Sergeant (TSG)" },
  { value: "MSG", label: "Master Sergeant (MSG)" },
];

// The field across its states: options prop, hint, error, and disabled.
export const Fields = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 12, maxWidth: 360 }}>
    <Select label="Promotion Cycle" options={cycles} defaultValue="SSG" />
    <Select label="Grade" hint="Member's current grade">
      <option>SrA</option>
      <option>SSgt</option>
      <option>TSgt</option>
    </Select>
    <Select label="State" error="Selection required" options={[{ value: "", label: "Select a state…" }]} />
    <Select label="Branch" disabled options={[{ value: "USAF", label: "USAF" }]} defaultValue="USAF" />
  </div>
);
