import { Input } from "pace-frontend-test";

// The field in its common states: label, hint, error, and disabled.
export const Fields = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 12, maxWidth: 360 }}>
    <Input label="Full Name" placeholder="LAST, FIRST M." />
    <Input label="PAS Code" defaultValue="FV4407" hint="6-character unit identifier" />
    <Input label="Email" defaultValue="john.smith" error="Enter a valid email address" />
    <Input label="Service Computation Date" disabled defaultValue="01 Mar 2018" />
  </div>
);

// A bare input with no label, as used inline in compact forms.
export const Plain = () => (
  <div style={{ padding: 12, maxWidth: 360 }}>
    <Input placeholder="Search members…" />
  </div>
);
