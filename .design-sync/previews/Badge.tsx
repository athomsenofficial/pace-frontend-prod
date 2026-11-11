import { Badge } from "pace-frontend-test";

// Status pills used across the promotion-eligibility workflow.
export const Colors = () => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
      padding: 8,
    }}
  >
    <Badge color="neutral">Draft</Badge>
    <Badge color="navy">Step 2 of 4</Badge>
    <Badge color="green">Eligible</Badge>
    <Badge color="red">Ineligible</Badge>
    <Badge color="amber">Needs Review</Badge>
    <Badge color="blue">In Progress</Badge>
    <Badge color="teal">Submitted</Badge>
  </div>
);

// A badge labelling a row, as it appears in the roster review table.
export const InContext = () => (
  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "center",
      padding: 8,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
      color: "#334155",
    }}
  >
    <span style={{ fontWeight: 600, color: "#0f1e3d" }}>SMITH, JOHN A.</span>
    <Badge color="navy">SSgt → TSgt</Badge>
    <Badge color="green">Eligible</Badge>
  </div>
);
