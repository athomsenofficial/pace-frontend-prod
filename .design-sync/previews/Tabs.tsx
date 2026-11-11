import { Tabs } from "pace-frontend-test";

// Eligibility categories with count badges; the active tab carries the navy underline.
export const WithCounts = () => (
  <div style={{ padding: 12, maxWidth: 520 }}>
    <Tabs
      value="eligible"
      onChange={() => {}}
      items={[
        { value: "eligible", label: "Eligible", count: 42 },
        { value: "review", label: "Needs Review", count: 7 },
        { value: "ineligible", label: "Ineligible", count: 3 },
      ]}
    />
  </div>
);

// Plain tabs without counts.
export const Plain = () => (
  <div style={{ padding: 12, maxWidth: 520 }}>
    <Tabs
      value="roster"
      onChange={() => {}}
      items={[
        { value: "roster", label: "Roster" },
        { value: "history", label: "History" },
        { value: "settings", label: "Settings" },
      ]}
    />
  </div>
);
